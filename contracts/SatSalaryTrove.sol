// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IBorrowerOperations, ITroveManager, IPriceFeed, IMUSD, IHintHelpers, ISortedTroves} from "./interfaces/IMezo.sol";

contract SatSalaryTrove {
    // --- Mezo protocol references ---
    IBorrowerOperations public immutable borrowerOps;
    ITroveManager public immutable troveManager;
    IPriceFeed public immutable priceFeed;
    IMUSD public immutable musd;
    IHintHelpers public immutable hintHelpers;
    ISortedTroves public immutable sortedTroves;

    address public immutable owner;
    address public employer; // set on first openTrove — the wallet that manages the trove

    uint256 public constant MIN_COLLATERAL_RATIO = 1.5e18; // 150% — safe buffer above 110% liquidation
    uint256 public constant REBALANCE_THRESHOLD = 1.8e18; // auto-rebalance triggers below 180%
    uint256 public constant TARGET_RATIO_AFTER_REBALANCE = 2.5e18; // rebalance targets 250%

    // --- Payroll stream state ---
    struct Stream {
        address payee;
        uint256 ratePerSecond;
        uint256 accrued;
        uint256 lastUpdated;
        bool paused;
        bool exists;
    }

    uint256 public nextStreamId;
    mapping(uint256 => Stream) public streams;
    uint256 public totalStreamRate;
    uint256 public payrollReserve;

    // --- Events ---
    event TroveOpened(uint256 btcCollateral, uint256 musdBorrowed, uint256 healthFactor);
    event CollateralAdded(uint256 amount, uint256 newHealthFactor);
    event DebtRepaid(uint256 amount, uint256 remainingDebt);
    event StreamCreated(uint256 indexed streamId, address indexed payee, uint256 ratePerSecond);
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event PayeeClaimed(uint256 indexed streamId, address indexed payee, uint256 amount);
    event Rebalanced(uint256 debtRepaid, uint256 newHealthFactor);
    event PayrollFunded(uint256 musdAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    modifier onlyEmployer() {
        require(msg.sender == employer, "NOT_EMPLOYER");
        _;
    }

    constructor(
        address _borrowerOps,
        address _troveManager,
        address _priceFeed,
        address _musd,
        address _hintHelpers,
        address _sortedTroves
    ) {
        borrowerOps = IBorrowerOperations(_borrowerOps);
        troveManager = ITroveManager(_troveManager);
        priceFeed = IPriceFeed(_priceFeed);
        musd = IMUSD(_musd);
        hintHelpers = IHintHelpers(_hintHelpers);
        sortedTroves = ISortedTroves(_sortedTroves);
        owner = msg.sender;
    }

    receive() external payable {}

    // --- Trove management ---

    function openTrove(uint256 _musdAmount) external payable {
        require(employer == address(0), "TROVE_EXISTS");
        require(msg.value > 0, "NO_COLLATERAL");
        require(_musdAmount >= 1800e18, "MIN_DEBT_1800");

        employer = msg.sender;
        (address upper, address lower) = _getHints(_musdAmount, msg.value);
        borrowerOps.openTrove{value: msg.value}(_musdAmount, upper, lower);

        uint256 hf = healthFactor();
        emit TroveOpened(msg.value, _musdAmount, hf);
    }

    function addCollateral() external payable onlyEmployer {
        require(msg.value > 0, "NO_COLLATERAL");
        (address upper, address lower) = _getCurrentHints();
        borrowerOps.addColl{value: msg.value}(upper, lower);
        emit CollateralAdded(msg.value, healthFactor());
    }

    function repayDebt(uint256 _amount) external onlyEmployer {
        require(_amount > 0, "ZERO_REPAY");
        musd.approve(address(borrowerOps), _amount);
        (address upper, address lower) = _getCurrentHints();
        borrowerOps.repayMUSD(_amount, upper, lower);
        emit DebtRepaid(_amount, troveDebt());
    }

    function fundPayroll(uint256 _amount) external onlyEmployer {
        require(_amount > 0, "ZERO_FUND");
        require(musd.transferFrom(msg.sender, address(this), _amount), "MUSD_TRANSFER");
        payrollReserve += _amount;
        emit PayrollFunded(_amount);
    }

    /// @notice Allocate MUSD already held by this contract (e.g. borrowed via
    /// openTrove) into the payroll reserve so streams can pay it out. Keeps any
    /// unallocated balance free as a rebalance buffer.
    function allocateToPayroll(uint256 _amount) external onlyEmployer {
        require(_amount > 0, "ZERO_FUND");
        require(unallocatedMusd() >= _amount, "INSUFFICIENT_MUSD");
        payrollReserve += _amount;
        emit PayrollFunded(_amount);
    }

    /// @notice MUSD held by the contract that is not committed to payroll —
    /// available for rebalance debt repayment or owner sweep.
    function unallocatedMusd() public view returns (uint256) {
        uint256 bal = musd.balanceOf(address(this));
        return bal > payrollReserve ? bal - payrollReserve : 0;
    }

    /// @notice Owner can recover unallocated MUSD (never touches payroll reserve).
    function sweepMusd(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "ZERO_TO");
        require(unallocatedMusd() >= _amount, "INSUFFICIENT_MUSD");
        require(musd.transfer(_to, _amount), "MUSD_TRANSFER");
    }

    // --- Payroll streams ---

    function createStream(address _payee, uint256 _ratePerSecond) external onlyEmployer returns (uint256 streamId) {
        require(_payee != address(0), "ZERO_PAYEE");
        require(_ratePerSecond > 0, "ZERO_RATE");

        streamId = nextStreamId++;
        streams[streamId] =
            Stream({payee: _payee, ratePerSecond: _ratePerSecond, accrued: 0, lastUpdated: block.timestamp, paused: false, exists: true});
        totalStreamRate += _ratePerSecond;

        emit StreamCreated(streamId, _payee, _ratePerSecond);
    }

    function pauseStream(uint256 _streamId) external onlyEmployer {
        Stream storage s = _stream(_streamId);
        _accrue(s);
        totalStreamRate -= s.ratePerSecond;
        s.paused = true;
        emit StreamPaused(_streamId);
    }

    function resumeStream(uint256 _streamId) external onlyEmployer {
        Stream storage s = _stream(_streamId);
        require(s.paused, "NOT_PAUSED");
        s.paused = false;
        s.lastUpdated = block.timestamp;
        totalStreamRate += s.ratePerSecond;
        emit StreamResumed(_streamId);
    }

    function claim(uint256 _streamId) external {
        Stream storage s = _stream(_streamId);
        require(msg.sender == s.payee, "NOT_PAYEE");
        _accrue(s);

        uint256 amount = s.accrued;
        require(amount > 0, "NOTHING_TO_CLAIM");
        require(payrollReserve >= amount, "INSUFFICIENT_RESERVE");

        s.accrued = 0;
        payrollReserve -= amount;
        require(musd.transfer(s.payee, amount), "MUSD_TRANSFER");

        emit PayeeClaimed(_streamId, s.payee, amount);
    }

    function pending(uint256 _streamId) external view returns (uint256) {
        Stream storage s = _stream(_streamId);
        if (s.paused) return s.accrued;
        return s.accrued + ((block.timestamp - s.lastUpdated) * s.ratePerSecond);
    }

    // --- Auto-rebalance ---

    function rebalance() external {
        uint256 hf = healthFactor();
        require(hf < REBALANCE_THRESHOLD, "HEALTHY");

        uint256 price = priceFeed.fetchPrice();
        uint256 coll = troveColl();
        uint256 debt = troveDebt();

        // Calculate how much debt to repay to reach target ratio
        // targetRatio = (coll * price) / (newDebt * 1e18)
        // newDebt = (coll * price) / (targetRatio)
        uint256 targetDebt = (coll * price) / TARGET_RATIO_AFTER_REBALANCE;
        uint256 repayAmount = debt > targetDebt ? debt - targetDebt : 0;

        if (repayAmount > 0) {
            uint256 available = musd.balanceOf(address(this)) - payrollReserve;
            uint256 actual = repayAmount > available ? available : repayAmount;

            if (actual > 0) {
                musd.approve(address(borrowerOps), actual);
                (address upper, address lower) = _getCurrentHints();
                borrowerOps.repayMUSD(actual, upper, lower);
            }
        }

        emit Rebalanced(repayAmount, healthFactor());
    }

    // --- View helpers ---

    function healthFactor() public view returns (uint256) {
        uint256 status = troveManager.getTroveStatus(address(this));
        if (status != 1) return type(uint256).max; // no active trove

        uint256 price = priceFeed.fetchPrice();
        return troveManager.getCurrentICR(address(this), price);
    }

    function troveDebt() public view returns (uint256) {
        return troveManager.getTroveDebt(address(this));
    }

    function troveColl() public view returns (uint256) {
        return troveManager.getTroveColl(address(this));
    }

    function btcPrice() external view returns (uint256) {
        return priceFeed.fetchPrice();
    }

    function isRebalanceNeeded() external view returns (bool) {
        return healthFactor() < REBALANCE_THRESHOLD;
    }

    // --- Internal ---

    function _accrue(Stream storage s) internal {
        if (!s.paused) {
            s.accrued += (block.timestamp - s.lastUpdated) * s.ratePerSecond;
        }
        s.lastUpdated = block.timestamp;
    }

    function _stream(uint256 _streamId) internal view returns (Stream storage s) {
        s = streams[_streamId];
        require(s.exists, "NO_STREAM");
    }

    function _getHints(uint256, uint256) internal pure returns (address upper, address lower) {
        return (address(0), address(0));
    }

    function _getCurrentHints() internal pure returns (address upper, address lower) {
        return (address(0), address(0));
    }
}
