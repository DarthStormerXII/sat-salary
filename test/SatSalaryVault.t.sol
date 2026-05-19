// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {MockMUSD} from "../contracts/MockMUSD.sol";
import {IERC20Like, SatSalaryVault} from "../contracts/SatSalaryVault.sol";

contract SatSalaryVaultTest is Test {
    MockMUSD internal musd;
    SatSalaryVault internal vault;
    address internal worker = address(0xBEEF);

    function setUp() public {
        musd = new MockMUSD();
        vault = new SatSalaryVault(IERC20Like(address(musd)));
        musd.mint(address(this), 15_000 ether);
        musd.approve(address(vault), type(uint256).max);
    }

    function testRecordsCollateralAndCredit() public {
        vault.recordCollateral(120_000_000, 126_000 ether);
        vault.openCredit(18_000 ether);
        vault.fundPayroll(10_000 ether);

        assertEq(vault.collateralBtcSats(), 120_000_000);
        assertEq(vault.collateralUsdValue(), 126_000 ether);
        assertEq(vault.musdDebt(), 18_000 ether);
        assertEq(vault.payrollLiquidity(), 10_000 ether);
    }

    function testWorkerWithdrawsStreamedMusd() public {
        vault.fundPayroll(10_000 ether);
        uint256 streamId = vault.createStream(worker, 1 ether);

        vm.warp(block.timestamp + 30);
        vm.prank(worker);
        uint256 paid = vault.withdrawAccrued(streamId);

        assertEq(paid, 30 ether);
        assertEq(musd.balanceOf(worker), 30 ether);
        assertEq(vault.payrollLiquidity(), 9_970 ether);
    }

    function testPauseStopsAccrualUntilResume() public {
        uint256 streamId = vault.createStream(worker, 1 ether);

        vm.warp(block.timestamp + 10);
        vault.pauseStream(streamId);
        vm.warp(block.timestamp + 30);
        assertEq(vault.pending(streamId), 10 ether);

        vault.resumeStream(streamId);
        vm.warp(block.timestamp + 5);
        assertEq(vault.pending(streamId), 15 ether);
    }

    function testRepayReducesDebtAndCollectsMusd() public {
        vault.openCredit(1_000 ether);

        vault.repay(250 ether);

        assertEq(vault.musdDebt(), 750 ether);
        assertEq(musd.balanceOf(address(vault)), 250 ether);
    }
}
