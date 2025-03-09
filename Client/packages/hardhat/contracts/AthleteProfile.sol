// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "./ZKPVerificationLogin.sol"; // For zk-keyless login
import "./ZKPVerificationML.sol"; // For Expander zkML with GKR
import "./ITENPoints.sol"; // For ITEN Points rewards

contract AthleteProfile {
    struct Athlete {
        string name; // Optional field
        uint256 age;
        string sex;
        string sport;
        uint256 height; // in centimeters
        uint256 weight; // in kilograms
        string country;
        uint256 trainingHours; // Total training hours logged
        uint256 performanceMetric; // Performance metric (e.g., speed, endurance, strength)
        uint256 lastPerformanceMetric; // Previous performance metric for improvement tracking
        bool exists; // Added to track if the athlete is registered
    }

    // Mapping from athlete address to their profile
    mapping(address => Athlete) public athletes;

    // Mapping from zk-derived address to athlete address
    mapping(bytes32 => address) public userToAthlete;

    // Array to store all athlete addresses
    addresspublic athleteAddresses;

    // Event to emit when a profile is created or updated
    event ProfileUpdated(
        address indexed athlete,
        string name,
        uint256 age,
        string sex,
        string sport,
        uint256 height,
        uint256 weight,
        string country
    );

    // Instance of the ZKPVerificationLogin contract
    ZKPVerificationLogin private zkpVerificationLogin;

    // Instance of the ZKPVerificationML contract
    ZKPVerificationML private zkpVerificationML;

    // Instance of the ITENPoints token contract
    ITENPoints private itenPoints;

    // Address of the admin (for reward distribution)
    address public admin;

    constructor(
        address _zkpVerificationLoginAddress,
        address _zkpVerificationMLAddress,
        address _itenPointsAddress
    ) {
        zkpVerificationLogin = ZKPVerificationLogin(_zkpVerificationLoginAddress);
        zkpVerificationML = ZKPVerificationML(_zkpVerificationMLAddress);
        itenPoints = ITENPoints(_itenPointsAddress);
        admin = msg.sender;
    }

    /**
     * @dev Creates or updates an athlete's profile using zk-proof.
     * @param _name The athlete's name (optional).
     * @param _age The athlete's age.
     * @param _sex The athlete's sex/gender.
     * @param _sport The sport the athlete participates in.
     * @param _height The athlete's height in centimeters.
     * @param _weight The athlete's weight in kilograms.
     * @param _country The athlete's country of origin.
     * @param _proof The zk-proof for authentication.
     * @param _derivedAddress The zk-derived wallet address.
     */
    function setProfileWithZkProof(
        string calldata _name, // Optional field
        uint256 _age,
        string calldata _sex,
        string calldata _sport,
        uint256 _height,
        uint256 _weight,
        string calldata _country,
        bytes calldata _proof,
        bytes32 _derivedAddress
    ) public {
        // Verify the zk-proof using the ZKPVerificationLogin contract
        require(zkpVerificationLogin.verifyLoginProof(_proof, _derivedAddress), "Invalid zk-proof");

        // Convert derivedAddress to address type
        address athleteAddress = address(uint160(uint256(_derivedAddress)));

        // Check if the profile already exists
        Athlete storage athlete = athletes[athleteAddress];
        if (
            !athlete.exists || // Check if the athlete is new
            keccak256(bytes(athlete.name)) != keccak256(bytes(_name)) ||
            athlete.age != _age ||
            keccak256(bytes(athlete.sex)) != keccak256(bytes(_sex)) ||
            keccak256(bytes(athlete.sport)) != keccak256(bytes(_sport)) ||
            athlete.height != _height ||
            athlete.weight != _weight ||
            keccak256(bytes(athlete.country)) != keccak256(bytes(_country))
        ) {
            // Update the profile
            athlete.name = _name; // Can be empty
            athlete.age = _age;
            athlete.sex = _sex;
            athlete.sport = _sport;
            athlete.height = _height;
            athlete.weight = _weight;
            athlete.country = _country;
            athlete.exists = true; // Mark as registered

            // Emit an event for the profile update
            emit ProfileUpdated(
                athleteAddress,
                _name,
                _age,
                _sex,
                _sport,
                _height,
                _weight,
                _country
            );

            // Reward the athlete for completing their profile
            rewardProfileCompletion(athleteAddress);
        }

        // Add the athlete's address to the list if it's a new profile
        if (!isAthlete(athleteAddress)) {
            athleteAddresses.push(athleteAddress);
        }

        // Map the user identifier to the athlete address
        userToAthlete[_derivedAddress] = athleteAddress;
    }

    /**
     * @dev Rewards an athlete for completing their profile.
     * @param athleteAddress The address of the athlete.
     */
    function rewardProfileCompletion(address athleteAddress) internal {
        Athlete storage athlete = athletes[athleteAddress];
        require(athlete.exists, "Athlete not registered");

        // Check if all profile fields are filled
        if (
            bytes(athlete.name).length > 0 &&
            athlete.age > 0 &&
            bytes(athlete.sex).length > 0 &&
            bytes(athlete.sport).length > 0 &&
            athlete.height > 0 &&
            athlete.weight > 0 &&
            bytes(athlete.country).length > 0
        ) {
            // Reward the athlete with 50 ITEN Points
            uint256 rewardAmount = 50 * 10 ** 18; // Adjust decimals if needed
            itenPoints.transfer(athleteAddress, rewardAmount);
        }
    }

    /**
     * @dev Logs training hours for an athlete.
     * @param athleteAddress The address of the athlete.
     * @param hoursLogged The number of training hours logged.
     */
    function logTrainingHours(address athleteAddress, uint256 hoursLogged) public {
        require(athletes[athleteAddress].exists, "Athlete not registered");

        // Reward the athlete for logging training hours
        rewardTrainingHours(athleteAddress, hoursLogged);
    }

    /**
     * @dev Rewards an athlete for logging training hours.
     * @param athleteAddress The address of the athlete.
     * @param hoursLogged The number of training hours logged.
     */
    function rewardTrainingHours(address athleteAddress, uint256 hoursLogged) internal {
        Athlete storage athlete = athletes[athleteAddress];
        require(athlete.exists, "Athlete not registered");

        // Reward 10 ITEN Points for every 10 hours of training
        uint256 rewardAmount = (hoursLogged / 10) * 10 * 10 ** 18; // Adjust decimals if needed
        itenPoints.transfer(athleteAddress, rewardAmount);

        // Update the athlete's total training hours
        athlete.trainingHours += hoursLogged;
    }

    /**
     * @dev Logs performance metrics for an athlete.
     * @param athleteAddress The address of the athlete.
     * @param newPerformanceMetric The new performance metric.
     */
    function logPerformanceMetric(address athleteAddress, uint256 newPerformanceMetric) public {
        require(athletes[athleteAddress].exists, "Athlete not registered");

        // Reward the athlete for improving their performance
        rewardPerformanceImprovement(athleteAddress, newPerformanceMetric);
    }

    /**
     * @dev Rewards an athlete for improving their performance metric.
     * @param athleteAddress The address of the athlete.
     * @param newPerformanceMetric The new performance metric.
     */
    function rewardPerformanceImprovement(address athleteAddress, uint256 newPerformanceMetric) internal {
        Athlete storage athlete = athletes[athleteAddress];
        require(athlete.exists, "Athlete not registered");

        // Calculate the percentage improvement
        uint256 improvement = (newPerformanceMetric * 100) / athlete.lastPerformanceMetric;

        // Reward 100 ITEN Points for a 10% improvement
        if (improvement >= 110) { // 10% improvement
            uint256 rewardAmount = 100 * 10 ** 18; // Adjust decimals if needed
            itenPoints.transfer(athleteAddress, rewardAmount);
        }

        // Update the athlete's performance metric
        athlete.lastPerformanceMetric = athlete.performanceMetric;
        athlete.performanceMetric = newPerformanceMetric;
    }

    /**
     * @dev Returns the profile of a specific athlete.
     * @param _athlete The address of the athlete.
     */
    function getProfile(address _athlete) public view returns (
        string memory,
        uint256,
        string memory,
        string memory,
        uint256,
        uint256,
        string memory
    ) {
        require(athletes[_athlete].exists, "Athlete not registered");
        Athlete memory athlete = athletes[_athlete];
        return (
            athlete.name,
            athlete.age,
            athlete.sex,
            athlete.sport,
            athlete.height,
            athlete.weight,
            athlete.country
        );
    }

    /**
     * @dev Checks if an address is already registered as an athlete.
     * @param _athlete The address to check.
     */
    function isAthlete(address _athlete) public view returns (bool) {
        return athletes[_athlete].exists;
    }

    /**
     * @dev Returns the total number of registered athletes.
     */
    function getTotalAthletes() public view returns (uint256) {
        return athleteAddresses.length;
    }

    /**
     * @dev Allows the admin to update the ZKPVerificationLogin contract address.
     * @param _zkpVerificationLoginAddress The new ZKPVerificationLogin contract address.
     */
    function updateZKPVerificationLoginAddress(address _zkpVerificationLoginAddress) public {
        require(msg.sender == admin, "Only admin can update ZKPVerificationLogin address");
        zkpVerificationLogin = ZKPVerificationLogin(_zkpVerificationLoginAddress);
    }

    /**
     * @dev Allows the admin to update the ZKPVerificationML contract address.
     * @param _zkpVerificationMLAddress The new ZKPVerificationML contract address.
     */
    function updateZKPVerificationMLAddress(address _zkpVerificationMLAddress) public {
        require(msg.sender == admin, "Only admin can update ZKPVerificationML address");
        zkpVerificationML = ZKPVerificationML(_zkpVerificationMLAddress);
    }

    /**
     * @dev Allows the admin to update the ITENPoints contract address.
     * @param _itenPointsAddress The new ITENPoints contract address.
     */
    function updateITENPointsAddress(address _itenPointsAddress) public {
        require(msg.sender == admin, "Only admin can update ITENPoints address");
        itenPoints = ITENPoints(_itenPointsAddress);
    }

    /**
     * @dev Gets the athlete address associated with a user identifier.
     * @param _userIdentifier The user identifier.
     */
    function getAthleteByUserIdentifier(bytes32 _userIdentifier) public view returns (address) {
        return userToAthlete[_userIdentifier];
    }
}