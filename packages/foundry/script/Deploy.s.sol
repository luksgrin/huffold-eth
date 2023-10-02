//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";
import {compile, create} from "huff-runner/Deploy.sol";

using { create } for bytes;

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external returns(Deployment[] memory){
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);
        // YourContract yourContract = new YourContract(
        //     vm.addr(deployerPrivateKey)
        // );
        // console.logString(
        //     string.concat(
        //         "YourContract deployed at: ",
        //         vm.toString(address(yourContract))
        //     )
        // );

        address ycontract = compile(vm, "contracts/huff/YourContract.huff").create({value: 0});
        deployments.push(Deployment({
            name: "YourContract",
            addr: ycontract
        }));
        console.logString(
            string.concat(
                "YourContract deployed at: ",
                vm.toString(address(ycontract))
            )
        );
        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
        return deployments;
    }

}
