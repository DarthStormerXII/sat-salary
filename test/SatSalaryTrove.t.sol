// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {SatSalaryTrove} from "../contracts/SatSalaryTrove.sol";
import {IBorrowerOperations, ITroveManager, IPriceFeed, IMUSD, IHintHelpers, ISortedTroves} from "../contracts/interfaces/IMezo.sol";
import {MockMUSD} from "../contracts/MockMUSD.sol";

contract MockBorrowerOps {
    address public musd;
    address public troveManager;
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    constructor(address _musd) {
        musd = _musd;
    }

    function openTrove(uint256 _debtAmount, address, address) external payable {
        collateral[msg.sender] = msg.value;
        debt[msg.sender] = _debtAmount + 200e18; // +200 gas deposit
        MockMUSD(musd).mint(msg.sender, _debtAmount);
    }

    function addColl(address, address) external payable {
        collateral[msg.sender] += msg.value;
    }

    function repayMUSD(uint256 _amount, address, address) external {
        debt[msg.sender] -= _amount;
    }
}

contract MockTroveManager {
    MockBorrowerOps internal ops;

    constructor(address _ops) {
        ops = MockBorrowerOps(payable(_ops));
    }

    function getTroveStatus(address _borrower) external view returns (uint256) {
        return ops.collateral(_borrower) > 0 ? 1 : 0;
    }

    function getTroveDebt(address _borrower) external view returns (uint256) {
        return ops.debt(_borrower);
    }

    function getTroveColl(address _borrower) external view returns (uint256) {
        return ops.collateral(_borrower);
    }

    function getCurrentICR(address _borrower, uint256 _price) external view returns (uint256) {
        uint256 d = ops.debt(_borrower);
        if (d == 0) return type(uint256).max;
        return (ops.collateral(_borrower) * _price) / d;
    }

    function getBorrowingFee(uint256) external pure returns (uint256) {
        return 0;
    }
}

contract MockPriceFeed {
    uint256 public price = 76_000e18; // $76,000

    function fetchPrice() external view returns (uint256) {
        return price;
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }
}

contract MockHintHelpers {
    function getApproxHint(uint256, uint256, uint256) external pure returns (address, uint256, uint256) {
        return (address(0), 0, 0);
    }
}

contract MockSortedTroves {
    function findInsertPosition(uint256, address, address) external pure returns (address, address) {
        return (address(0), address(0));
    }
}

contract SatSalaryTroveTest is Test {
    MockMUSD internal musd;
    MockBorrowerOps internal borrowerOps;
    MockTroveManager internal troveManagerMock;
    MockPriceFeed internal priceFeed;
    MockHintHelpers internal hintHelpers;
    MockSortedTroves internal sortedTroves;
    SatSalaryTrove internal trove;

    address internal payee = address(0xBEEF);

    function setUp() public {
        musd = new MockMUSD();
        borrowerOps = new MockBorrowerOps(address(musd));
        troveManagerMock = new MockTroveManager(address(borrowerOps));
        priceFeed = new MockPriceFeed();
        hintHelpers = new MockHintHelpers();
        sortedTroves = new MockSortedTroves();

        trove = new SatSalaryTrove(
            address(borrowerOps),
            address(troveManagerMock),
            address(priceFeed),
            address(musd),
            address(hintHelpers),
            address(sortedTroves)
        );

        vm.deal(address(this), 100 ether);
    }

    function testOpenTroveAndBorrowMusd() public {
        trove.openTrove{value: 0.05 ether}(2000e18);

        assertGt(trove.troveColl(), 0);
        assertGt(trove.troveDebt(), 0);
        assertGt(trove.healthFactor(), 0);
        assertEq(musd.balanceOf(address(trove)), 2000e18);
    }

    function testCreateStreamAndClaim() public {
        trove.openTrove{value: 0.05 ether}(2000e18);
        // MUSD was minted to trove; transfer to test then fund back
        vm.prank(address(trove));
        musd.transfer(address(this), 1000e18);
        musd.approve(address(trove), 1000e18);
        trove.fundPayroll(1000e18);

        uint256 streamId = trove.createStream(payee, 1e18); // 1 MUSD/sec

        vm.warp(block.timestamp + 100);

        vm.prank(payee);
        trove.claim(streamId);

        assertEq(musd.balanceOf(payee), 100e18);
        assertEq(trove.payrollReserve(), 900e18);
    }

    function testPauseStopsAccrual() public {
        trove.openTrove{value: 0.05 ether}(2000e18);
        vm.prank(address(trove));
        musd.transfer(address(this), 1000e18);
        musd.approve(address(trove), 1000e18);
        trove.fundPayroll(1000e18);
        uint256 streamId = trove.createStream(payee, 1e18);

        vm.warp(block.timestamp + 50);
        trove.pauseStream(streamId);

        vm.warp(block.timestamp + 100); // 100 more seconds while paused
        assertEq(trove.pending(streamId), 50e18); // only first 50s accrued

        trove.resumeStream(streamId);
        vm.warp(block.timestamp + 20);
        assertEq(trove.pending(streamId), 70e18); // 50 + 20 after resume
    }

    function testRebalanceRepaysDebtWhenUnhealthy() public {
        // Open trove: 0.05 BTC at $76k = $3800 coll, $2200 debt => ICR ~1.73
        trove.openTrove{value: 0.05 ether}(2000e18);

        // Price drop to make it unhealthy (below 1.8 threshold)
        // Current: 0.05e18 * 76000e18 / 2200e18 = ~1.727e18 — already below 1.8
        uint256 hf = trove.healthFactor();
        assertTrue(hf < 1.8e18);

        // Fund some MUSD for rebalance
        musd.mint(address(trove), 500e18);

        trove.rebalance();
        // After rebalance, debt should be lower
        assertTrue(trove.troveDebt() < 2200e18);
    }

    function testRebalanceRevertsWhenHealthy() public {
        // Open trove: 1 BTC at $76k = $76000 coll, $2200 debt => very healthy
        trove.openTrove{value: 1 ether}(2000e18);

        vm.expectRevert("HEALTHY");
        trove.rebalance();
    }

    function testAddCollateralImprovesHealth() public {
        trove.openTrove{value: 0.05 ether}(2000e18);
        uint256 hfBefore = trove.healthFactor();

        trove.addCollateral{value: 0.05 ether}();
        uint256 hfAfter = trove.healthFactor();

        assertTrue(hfAfter > hfBefore);
    }

    function testOnlyPayeeCanClaim() public {
        trove.openTrove{value: 0.05 ether}(2000e18);
        vm.prank(address(trove));
        musd.transfer(address(this), 1000e18);
        musd.approve(address(trove), 1000e18);
        trove.fundPayroll(1000e18);
        uint256 streamId = trove.createStream(payee, 1e18);

        vm.warp(block.timestamp + 10);

        vm.prank(address(0xDEAD));
        vm.expectRevert("NOT_PAYEE");
        trove.claim(streamId);
    }

    function testBtcPriceFromOracle() public view {
        uint256 price = trove.btcPrice();
        assertEq(price, 76_000e18);
    }
}
