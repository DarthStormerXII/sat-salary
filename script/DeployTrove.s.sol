// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {SatSalaryTrove} from "../contracts/SatSalaryTrove.sol";

contract DeployTrove is Script {
    // Mezo Testnet (chain 31611) verified addresses
    address internal constant BORROWER_OPS = 0xCdF7028ceAB81fA0C6971208e83fa7872994beE5;
    address internal constant TROVE_MANAGER = 0xE47c80e8c23f6B4A1aE41c34837a0599D5D16bb0;
    address internal constant PRICE_FEED = 0x86bCF0841622a5dAC14A313a15f96A95421b9366;
    address internal constant MUSD = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;
    address internal constant HINT_HELPERS = 0x4e4cBA3779d56386ED43631b4dCD6d8EacEcBCF6;
    address internal constant SORTED_TROVES = 0x722E4D24FD6Ff8b0AC679450F3D91294607268fA;

    function run() external returns (SatSalaryTrove trove) {
        uint256 deployerKey = vm.envUint("MEZO_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        trove = new SatSalaryTrove(BORROWER_OPS, TROVE_MANAGER, PRICE_FEED, MUSD, HINT_HELPERS, SORTED_TROVES);

        console.log("SatSalaryTrove deployed at:", address(trove));
        console.log("BorrowerOperations:", BORROWER_OPS);
        console.log("TroveManager:", TROVE_MANAGER);
        console.log("PriceFeed:", PRICE_FEED);
        console.log("MUSD:", MUSD);

        vm.stopBroadcast();
    }
}
