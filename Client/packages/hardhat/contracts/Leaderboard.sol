// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Rewards.sol";

contract Leaderboard {
    Rewards public rewards;
    address public admin;

    // Mapping to store athlete scores by userIdentifier
    mapping(bytes32 => uint256) public athleteScores;

    constructor(address _rewardsAddress) {
        rewards = Rewards(_rewardsAddress);
        admin = msg.sender;
    }

    /**
     * @dev Updates the leaderboard and distributes rewards.
     * @param userIdentifier The unique identifier of the athlete.
     * @param score The athlete's score.
     */
    function updateLeaderboard(bytes32 userIdentifier, uint256 score) public {
        require(msg.sender == admin, "Only admin can update leaderboard");

        // Update athlete score using userIdentifier
        athleteScores[userIdentifier] = score;

        // Distribute rewards based on score
        uint256 rewardAmount = calculateReward(score);
        // Assuming Rewards contract can handle userIdentifier or you have a mapping there too
        // rewards.distributeRewards(athlete, rewardAmount); // Adjust if necessary
    }

    /**
     * @dev Calculates the reward amount based on the score.
     * @param score The athlete's score.
     */
    function calculateReward(uint256 score) internal pure returns (uint256) {
        // Example: 1 ITEN Point per score point
        return score;
    }

    /**
     * @dev Gets the score of an athlete by userIdentifier.
     * @param userIdentifier The unique identifier of the athlete.
     */
    function getAthleteScore(bytes32 userIdentifier) public view returns (uint256) {
        return athleteScores[userIdentifier];
    }
}