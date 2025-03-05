// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ZKPVerification {
    mapping(bytes32 => bool) public verifiedProofs;

    function verifyProof(bytes memory proof) public {
        bytes32 proofHash = keccak256(proof);
        verifiedProofs[proofHash] = true;
    }

    function isVerified(bytes32 proofHash) public view returns (bool) {
        return verifiedProofs[proofHash];
    }
}