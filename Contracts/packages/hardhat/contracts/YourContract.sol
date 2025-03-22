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
    event LoginAttempt(string indexed user, bool success, address  recoveredSigner, address trustedVerifier, bytes32 messageHash, string message);
    event LoginSuccess(string indexed user, string message);

    /**
     * @dev Verify user authentication with pre-formatted message components
     * @param timestamps Timestamp of the authentication attempt
     * @param proofHash Hash of the proof
     * @param userAddress Address of the user attempting to log in
     * @param signature Signature produced by the trusted verifier
     * @return True if authentication is successful
     */
    function verifyLogin(
        string calldata timestamps,
        string calldata proofHash,
        string calldata userAddress,
        bytes calldata signature
    ) external returns (string memory) {
        uint256 timestamp = stringToUint(timestamps); // Convert string to uint256
        // Check if timestamp is valid (not expired)
        require(
            (block.timestamp > timestamp ? block.timestamp - timestamp : timestamp - block.timestamp) <= TIME_WINDOW,
            "Timestamp outside valid window"
        );

        // Concatenate values like Rust's format!("{}:{}:{}", ...)
        string memory messagee = string(abi.encodePacked(timestamps, ":", proofHash, ":", userAddress));

        // Hash the message using keccak256
        bytes32 messageHash = keccak256(bytes(messagee));
        // Prefix the hash (mimics ethers.hashMessage)
        bytes32 prefixedHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // Recover signer from signature
        address recoveredSigner = recoverSigner(prefixedHash, signature);
        bool success = (recoveredSigner == trustedVerifier);
        emit LoginAttempt(userAddress, success, recoveredSigner, trustedVerifier, messageHash, messagee);

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

    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            require(b[i] >= 0x30 && b[i] <= 0x39, "Invalid character"); // Ensure only digits
            result = result * 10 + (uint256(uint8(b[i])) - 48);
        }
        return result;
    }
}