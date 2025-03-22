// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ZkLoginAuth
 * @dev Simplified contract for verifying user authentication via signatures
 */
contract ZkLoginAuth {
    // Private trusted verifier address
    address private immutable trustedVerifier = 0x00AC976b0756EC2dd9935f55e0294C24FCa8DF46;
    uint256 public constant TIME_WINDOW = 20 minutes;
    
    event LoginAttempt(address indexed user, bool success, uint256 timestamp, address  recoveredSigner, address trustedVerifier,  bytes32 messageHash, bytes32 prefixedHash, string message);
    event LoginSuccess(address indexed user, string message);
    
    /**
     * @dev Verify user authentication with pre-formatted message components
     * @param timestamp Timestamp of the authentication attempt
     * @param proofHash Hash of the proof
     * @param userAddress Address of the user attempting to log in
     * @param signature Signature produced by the trusted verifier
     * @return True if authentication is successful
     */
    function verifyLogin(
        uint256 timestamp,
        string calldata proofHash,
        address userAddress,
        bytes calldata signature
    ) external returns (string memory) {
        // Check if timestamp is valid (not expired)
        require(block.timestamp - timestamp <= TIME_WINDOW, "Timestamp expired");
        
        // Recreate message from inputs (assuming proper formatting)
        // string memory message = string(
        //     abi.encodePacked(
        //         timestamp,
        //         ":",
        //         proofHash,
        //         ":",
        //         userAddress
        //     )
        // );



        // Concatenate values like Rust's format!("{}:{}:{}", ...)
        string memory messagee = string(abi.encodePacked(
            uintToString(timestamp), ":", 
            proofHash, ":", 
            toAsciiString(userAddress)
        ));
        
        // Hash the message using keccak256
        bytes32 messageHash = keccak256(bytes(messagee));
        
        // Prefix the hash (mimics ethers.hashMessage)
        bytes32 prefixedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // Recover signer from signature
        address recoveredSigner = recoverSigner(prefixedHash, signature);
        
        // Check conditions: valid signer and user address matches sender
        bool isValidSigner = (recoveredSigner == trustedVerifier);
        // bool isValidUser = (msg.sender == userAddress);
        bool success = isValidSigner;
        
        emit LoginAttempt(userAddress, success, timestamp, recoveredSigner, trustedVerifier, messageHash, prefixedHash, messagee);
        
        if (success) {
            // Emit an event that includes both the address and a success message
            emit LoginSuccess(userAddress, "success");
            return "success";
        } else {
            return "failure";
        }
    }
    
    /**
     * @dev Recover signer address from signature
     * @param _hash Hashed message
     * @param _signature Signature bytes
     * @return Recovered address
     */
    function recoverSigner(bytes32 _hash, bytes calldata _signature) internal pure returns (address) {
        require(_signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            // Extract r, s, v from the signature
            // IMPORTANT: We need to add 32 to the pointer to skip the length field of the bytes array
            r := calldataload(_signature.offset)
            s := calldataload(add(_signature.offset, 32))
            // For v, we load 32 bytes and then extract the first byte
            v := byte(0, calldataload(add(_signature.offset, 64)))
        }
        
        // Version of signature should be 27 or 28, but some wallets use 0 or 1
        if (v < 27) {
            v += 27;
        }
        
        return ecrecover(_hash, v, r, s);
    }

    function toAsciiString(address _addr) internal pure returns (string memory) {
        bytes memory addrBytes = abi.encodePacked(_addr);
        bytes memory hexChars = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = hexChars[uint8(addrBytes[i] >> 4)];
            str[3 + i * 2] = hexChars[uint8(addrBytes[i] & 0x0f)];
        }
        return string(str);
    }

    // Convert uint256 to string
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }
}