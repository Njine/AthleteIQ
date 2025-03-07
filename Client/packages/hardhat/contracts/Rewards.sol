// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITENPoints.sol";

contract Rewards {
    ITENPoints public itenPoints;
    address public admin;

    // Mapping to store rewards for athletes
    mapping(address => uint256) public athleteRewards;

    constructor(address _itenPointsAddress) {
        itenPoints = ITENPoints(_itenPointsAddress);
        admin = msg.sender;
    }

    /**
     * @dev Distributes ITEN Points to an athlete.
     * @param athlete The address of the athlete.
     * @param amount The amount of ITEN Points to distribute.
     */
    function distributeRewards(address athlete, uint256 amount) public {
        require(msg.sender == admin, "Only admin can distribute rewards");

        // Transfer ITEN Points to the athlete
        itenPoints.transfer(athlete, amount);

        // Update the athlete's rewards
        athleteRewards[athlete] += amount;
    }

    /**
     * @dev Checks the ITEN Points balance of an athlete.
     * @param athlete The address of the athlete.
     */
    function getRewards(address athlete) public view returns (uint256) {
        return athleteRewards[athlete];
    }
}