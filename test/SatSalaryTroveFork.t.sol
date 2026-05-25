// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console2} from "forge-std/Test.sol";
import {SatSalaryTrove} from "../contracts/SatSalaryTrove.sol";
import {IMUSD, IBorrowerOperations} from "../contracts/interfaces/IMezo.sol";

/// Mock of the Mezo Skip-Connect oracle precompile (latestRoundData), which is
/// NOT present in a Foundry fork (returns NotActivated). We etch this at the
/// precompile address so oracle-dependent paths can run in CI.
contract MockOracle {
    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        // ~$76,979 with 8 decimals (Chainlink convention)
        return (1, 76_979e8, block.timestamp, block.timestamp, 1);
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }
}

/// Fork test against the REAL deployed Mezo testnet contracts. Run with:
///   forge test --fork-url https://rpc.test.mezo.org --match-contract Fork -vvv
contract SatSalaryTroveForkTest is Test {
    address constant MUSD = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;
    address constant BORROWER_OPS = 0xCdF7028ceAB81fA0C6971208e83fa7872994beE5;
    address constant TROVE_MANAGER = 0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0;
    address constant PRICE_FEED = 0x86bCF0841622a5dAC14A313a15f96A95421b9366;
    address constant HINT_HELPERS = 0x4e4cBA3779d56386ED43631b4dCD6d8EacEcBCF6;
    address constant SORTED_TROVES = 0x722E4D24FD6Ff8b0AC679450F3D91294607268fA;
    address constant ORACLE_PRECOMPILE = 0x7b7c000000000000000000000000000000000015;

    SatSalaryTrove trove;

    function setUp() public {
        // Etch a working oracle at the precompile address (fork lacks it).
        MockOracle mock = new MockOracle();
        vm.etch(ORACLE_PRECOMPILE, address(mock).code);

        trove = new SatSalaryTrove(
            BORROWER_OPS, TROVE_MANAGER, PRICE_FEED, MUSD, HINT_HELPERS, SORTED_TROVES
        );
        vm.deal(address(trove), 5 ether);
        vm.deal(address(this), 1 ether);
    }

    /// The wiring is real even if the oracle is etched: MUSD address reported by
    /// the live BorrowerOperations must match our configured MUSD.
    function test_realWiring() public view {
        assertEq(IBorrowerOperations(BORROWER_OPS).musd(), MUSD, "MUSD mismatch");
        assertEq(IBorrowerOperations(BORROWER_OPS).troveManager(), TROVE_MANAGER, "TM mismatch");
    }

    function test_priceFeedWithEtchedOracle() public view {
        uint256 price = trove.btcPrice();
        console2.log("Price (etched, 1e18):", price);
        assertGt(price, 0, "price 0");
    }

    function test_openTroveAgainstRealMezo() public {
        uint256 price = trove.btcPrice();
        uint256 debt = 1800e18;
        uint256 coll = 0.06 ether;
        console2.log("ICR (1e18):", (coll * price) / debt);

        trove.openTrove{value: coll}(debt);

        console2.log("trove debt:", trove.troveDebt());
        console2.log("trove coll:", trove.troveColl());
        console2.log("health factor:", trove.healthFactor());
        console2.log("MUSD in contract:", IMUSD(MUSD).balanceOf(address(trove)));

        assertEq(trove.troveColl(), coll, "coll mismatch");
        assertGt(trove.troveDebt(), 0, "no debt");
        assertGe(IMUSD(MUSD).balanceOf(address(trove)), debt, "MUSD not received");

        // allocateToPayroll moves borrowed MUSD into the reserve
        trove.allocateToPayroll(1500e18);
        assertEq(trove.payrollReserve(), 1500e18, "reserve not set");
        assertEq(trove.unallocatedMusd(), debt - 1500e18, "buffer wrong");
    }
}
