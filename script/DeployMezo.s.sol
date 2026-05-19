// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {SatSalaryVault, IERC20Like} from "../contracts/SatSalaryVault.sol";

contract DeployMezo is Script {
    address internal constant MUSD_TESTNET_DOCS = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;

    function run() external returns (SatSalaryVault vault) {
        uint256 deployerKey = vm.envUint("MEZO_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        vault = new SatSalaryVault(IERC20Like(MUSD_TESTNET_DOCS));
        vm.stopBroadcast();
    }
}
