// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Leaderboard.sol"; // Import Leaderboard contract

contract ZKPVerificationML {
    Leaderboard public leaderboardContract; // Reference to Leaderboard contract
    address public admin;

    constructor(address _leaderboardAddress) {
        leaderboardContract = Leaderboard(_leaderboardAddress);
        admin = msg.sender; // Set the admin
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * @dev Verifies a zk-proof for an ML prediction using Expander and updates the leaderboard.
     * @param _proof The zk-proof.
     * @param _expectedPrediction The expected output of the ML computation.
     * @param _userIdentifier The unique identifier derived during zk-keyless login (e.g., a hash of the user's login data).
     */
    function verifyMLProof(
        bytes memory _proof,
        uint256 _expectedPrediction,
        bytes32 _userIdentifier
    ) public onlyAdmin {
        console.log("Proof received:", _proof);
        console.log("Expected prediction:", _expectedPrediction);
        console.log("User Identifier:", _userIdentifier);

        // Placeholder: Verify the proof using Expander and GKR verification logic
        // You'll need to replace this with your actual GKR verification logic.
        bool proofIsValid = isValidMLProof(_proof, _expectedPrediction, _userIdentifier);

        if (proofIsValid) {
            console.log("Proof is valid");
            // Use the userIdentifier to identify the athlete
            leaderboardContract.updateLeaderboard(_userIdentifier, _expectedPrediction);
        } else {
            console.log("Proof is invalid");
            revert("Invalid zk-proof");
        }
    }

    /**
     * @dev Verifies a zk-proof for an ML computation using Expander and GKR.
     * @param proof The zk-proof.
     * @param expectedOutput The expected output of the ML computation.
     * @param userIdentifier The unique identifier derived during zk-keyless login.
     */
    function isValidMLProof(bytes memory proof, uint256 expectedOutput, bytes32 userIdentifier) internal pure returns (bool) {
        // Implement actual Expander and GKR verification logic here
        // This function should now also incorporate the userIdentifier in the verification process
        // For now, return true to simulate successful verification
        console.log("isValidMLProof - Proof:", proof);
        console.log("isValidMLProof - Expected Output:", expectedOutput);
        console.log("isValidMLProof - User Identifier:", userIdentifier);
        return true;
    }

    /**
     * @dev Allows the admin to update the Leaderboard contract address.
     * @param _leaderboardAddress The new Leaderboard contract address.
     */
    function updateLeaderboardAddress(address _leaderboardAddress) public onlyAdmin {
        leaderboardContract = Leaderboard(_leaderboardAddress);
    }
    // Added admin role and modifier
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor(address _leaderboardAddress) {
        leaderboardContract = Leaderboard(_leaderboardAddress);
        admin = msg.sender;
    }
}