// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ZKPVerificationLogin {
    // Mapping to store verified zk-derived addresses
    mapping(bytes32 => bool) public verifiedAddresses;

    /**
     * @dev Verifies a zk-proof for zk-keyless login.
     * @param proof The zk-proof generated off-chain.
     * @param expectedAddress The expected zk-derived wallet address.
     */
    function verifyLoginProof(bytes memory proof, bytes32 expectedAddress) public returns (bool) {
        require(isValidLoginProof(proof, expectedAddress), "Invalid proof");

        // Mark the address as verified
        verifiedAddresses[expectedAddress] = true;
        return true;
    }