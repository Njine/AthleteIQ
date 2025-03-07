// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Rewards.sol";

contract Leaderboard {
    Rewards public rewards;
    address public admin;

    constructor(address _rewardsAddress) {
        rewards = Rewards(_rewardsAddress);
        admin = msg.sender;
    }

    /**
     * @dev Updates the leaderboard and distributes rewards.
     * @param athlete The address of the athlete.
     * @param score The athlete's score.
     */
    function updateLeaderboard(address athlete, uint256 score) public {
        require(msg.sender == admin, "Only admin can update leaderboard");

        // Update leaderboard logic here

        // Distribute rewards based on score
        uint256 rewardAmount = calculateReward(score);
        rewards.distributeRewards(athlete, rewardAmount);
    }

    /**
     * @dev Calculates the reward amount based on the score.
     * @param score The athlete's score.
     */
    function calculateReward(uint256 score) internal pure returns (uint256) {
        // Example: 1 ITEN Point per score point
        return score;
    }
}