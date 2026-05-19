// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20Like {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SatSalaryVault {
    struct Stream {
        address worker;
        uint256 ratePerSecond;
        uint256 accrued;
        uint256 lastUpdated;
        bool paused;
        bool exists;
    }

    IERC20Like public immutable musd;
    address public immutable owner;
    uint256 public collateralBtcSats;
    uint256 public collateralUsdValue;
    uint256 public musdDebt;
    uint256 public payrollLiquidity;
    uint256 public nextStreamId;

    mapping(uint256 => Stream) public streams;

    event CollateralRecorded(uint256 btcSats, uint256 usdValue);
    event CreditOpened(uint256 musdAmount);
    event PayrollFunded(uint256 amount, uint256 liquidity);
    event StreamCreated(uint256 indexed streamId, address indexed worker, uint256 ratePerSecond);
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event DebtRepaid(uint256 amount, uint256 remainingDebt);
    event WorkerPaid(uint256 indexed streamId, address indexed worker, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor(IERC20Like musd_) {
        musd = musd_;
        owner = msg.sender;
    }

    function recordCollateral(uint256 btcSats, uint256 usdValue) external onlyOwner {
        collateralBtcSats = btcSats;
        collateralUsdValue = usdValue;
        emit CollateralRecorded(btcSats, usdValue);
    }

    function openCredit(uint256 musdAmount) external onlyOwner {
        musdDebt += musdAmount;
        emit CreditOpened(musdAmount);
    }

    function fundPayroll(uint256 amount) external onlyOwner {
        require(amount > 0, "ZERO_FUND");
        payrollLiquidity += amount;
        require(musd.transferFrom(msg.sender, address(this), amount), "MUSD_FUND");
        emit PayrollFunded(amount, payrollLiquidity);
    }

    function createStream(address worker, uint256 ratePerSecond)
        external
        onlyOwner
        returns (uint256 streamId)
    {
        require(worker != address(0), "ZERO_WORKER");
        require(ratePerSecond > 0, "ZERO_RATE");

        streamId = nextStreamId++;
        streams[streamId] = Stream({
            worker: worker,
            ratePerSecond: ratePerSecond,
            accrued: 0,
            lastUpdated: block.timestamp,
            paused: false,
            exists: true
        });

        emit StreamCreated(streamId, worker, ratePerSecond);
    }

    function pauseStream(uint256 streamId) external onlyOwner {
        Stream storage stream = _stream(streamId);
        _accrue(stream);
        stream.paused = true;
        emit StreamPaused(streamId);
    }

    function resumeStream(uint256 streamId) external onlyOwner {
        Stream storage stream = _stream(streamId);
        require(stream.paused, "NOT_PAUSED");
        stream.paused = false;
        stream.lastUpdated = block.timestamp;
        emit StreamResumed(streamId);
    }

    function withdrawAccrued(uint256 streamId) external returns (uint256 amount) {
        Stream storage stream = _stream(streamId);
        require(msg.sender == stream.worker, "ONLY_WORKER");
        _accrue(stream);

        amount = stream.accrued;
        require(amount > 0, "NO_ACCRUAL");
        require(payrollLiquidity >= amount, "INSUFFICIENT_LIQUIDITY");
        payrollLiquidity -= amount;
        stream.accrued = 0;
        require(musd.transfer(stream.worker, amount), "MUSD_TRANSFER");
        emit WorkerPaid(streamId, stream.worker, amount);
    }

    function repay(uint256 amount) external onlyOwner {
        require(amount > 0, "ZERO_REPAY");
        require(amount <= musdDebt, "OVER_REPAY");
        musdDebt -= amount;
        require(musd.transferFrom(msg.sender, address(this), amount), "MUSD_REPAY");
        emit DebtRepaid(amount, musdDebt);
    }

    function pending(uint256 streamId) external view returns (uint256) {
        Stream storage stream = _stream(streamId);
        if (stream.paused) return stream.accrued;
        return stream.accrued + ((block.timestamp - stream.lastUpdated) * stream.ratePerSecond);
    }

    function _accrue(Stream storage stream) internal {
        if (!stream.paused) {
            stream.accrued += (block.timestamp - stream.lastUpdated) * stream.ratePerSecond;
        }
        stream.lastUpdated = block.timestamp;
    }

    function _stream(uint256 streamId) internal view returns (Stream storage stream) {
        stream = streams[streamId];
        require(stream.exists, "NO_STREAM");
    }
}
