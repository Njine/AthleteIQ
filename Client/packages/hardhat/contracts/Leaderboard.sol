// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Leaderboard {
    struct AthleteScore {
        address athlete;
        uint256 score;
    }

    AthleteScore[] public leaderboard;

    function updateLeaderboard(address athlete, uint256 score) public {
        leaderboard.push(AthleteScore(athlete, score));
    }

    function getLeaderboard() public view returns (AthleteScore[] memory) {
        return leaderboard;
    }
}