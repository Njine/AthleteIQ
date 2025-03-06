// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "./ZKPVerification.sol"; // Import the ZKPVerification contract

contract AthleteProfile {
    struct Athlete {
        string name; // Optional field
        uint256 age;
        string sex;
        string sport;
        uint256 height; // in centimeters
        uint256 weight; // in kilograms
        string country;
        bool exists; // Added to track if the athlete is registered
    }

    // Mapping from athlete address to their profile
    mapping(address => Athlete) public athletes;

    // Array to store all athlete addresses
    address[] public athleteAddresses;

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

    // Instance of the ZKPVerification contract
    ZKPVerification private zkpVerification;

    constructor(address _zkpVerificationAddress) {
        zkpVerification = ZKPVerification(_zkpVerificationAddress);
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
        // Verify the zk-proof using the ZKPVerification contract
        require(zkpVerification.verifyZkProof(_proof, _derivedAddress), "Invalid zk-proof");

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
        }

        // Add the athlete's address to the list if it's a new profile
        if (!isAthlete(athleteAddress)) {
            athleteAddresses.push(athleteAddress);
        }
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
}