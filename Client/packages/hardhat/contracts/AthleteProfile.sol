// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract AthleteProfile {
    struct Athlete {
        string name;
        uint256 age;
        string sport;
        uint256 height; // in centimeters
        uint256 weight; // in kilograms
        string country;
    }

    // Mapping from athlete address to their profile
    mapping(address => Athlete) public athletes;

    // Array to store all athlete addresses
    address[] public athleteAddresses;

    // Event to emit when a profile is created or updated
    event ProfileUpdated(address indexed athlete, string name, uint256 age, string sport, uint256 height, uint256 weight, string country);

    // add your zk-proof verification key
    bytes32 public constant VERIFICATION_KEY = 0x...;

    /**
     * @dev Creates or updates an athlete's profile using zk-proof.
     * @param _name The athlete's name.
     * @param _age The athlete's age.
     * @param _sport The sport the athlete participates in.
     * @param _height The athlete's height in centimeters.
     * @param _weight The athlete's weight in kilograms.
     * @param _country The athlete's country of origin.
     * @param _proof The zk-proof for authentication.
     */
    function setProfileWithZkProof(
        string memory _name,
        uint256 _age,
        string memory _sport,
        uint256 _height,
        uint256 _weight,
        string memory _country,
        bytes memory _proof
    ) public {
        // Verify the zk-proof
        require(verifyZkProof(_proof), "Invalid zk-proof");

        // Create or update the athlete's profile
        athletes[msg.sender] = Athlete(_name, _age, _sport, _height, _weight, _country);

        // Add the athlete's address to the list if it's not already there
        if (!isAthlete(msg.sender)) {
            athleteAddresses.push(msg.sender);
        }

        // Emit an event for the profile update
        emit ProfileUpdated(msg.sender, _name, _age, _sport, _height, _weight, _country);
    }

    /**
     * @dev Verifies the zk-proof.
     * @param _proof The zk-proof to verify.
     */
    function verifyZkProof(bytes memory _proof) internal pure returns (bool) {
        // Placeholder for zk-proof verification logic
        // Replace with actual verification using SnarkJS or a similar library
        return true;
    }

    /**
     * @dev Returns the profile of a specific athlete.
     * @param _athlete The address of the athlete.
     */
    function getProfile(address _athlete) public view returns (
        string memory,
        uint256,
        string memory,
        uint256,
        uint256,
        string memory
    ) {
        Athlete memory athlete = athletes[_athlete];
        return (
            athlete.name,
            athlete.age,
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
        return bytes(athletes[_athlete].name).length > 0;
    }

    /**
     * @dev Returns the total number of registered athletes.
     */
    function getTotalAthletes() public view returns (uint256) {
        return athleteAddresses.length;
    }
}
    function createAthlete(
        string memory _name,
        uint256 _age,
        string memory _sport,
        uint256 _height,
        uint256 _weight,
        string memory _country
    ) public {
        Athlete memory newAthlete = Athlete(
            _name,
            _age,
            _sport,
            _height,
            _weight,
            _country
        );
        athletes.push(newAthlete);
    }

    function getAthlete(uint256 _index)
        public
        view
        returns (
            string memory,
            uint256,
            string memory,
            uint256,
            uint256,
            string memory
        )
    {
        Athlete memory athlete = athletes[_index];
        return (
            athlete.name,
            athlete.age,
            athlete.sport,
            athlete.height,
            athlete.weight,
            athlete.country
        );
    }

    function getAthletesCount() public view returns (uint256) {
        return athletes.length;
    }
}