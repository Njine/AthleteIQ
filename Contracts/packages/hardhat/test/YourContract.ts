import { ethers } from "hardhat";

async function main() {
    const contractAddress = "0xec3138a2aF91D4f93B269Ac7CED82d025BBFD77f";
    const contract = await ethers.getContractAt("ZkLoginAuth", contractAddress);

    const timestamp = Math.floor(Date.now() / 1000);
    const proofHash = "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234"; 
    const userAddress = "0xYourTestWalletAddress";
    const signature = "0x1234abcd5678efgh"; 

    const tx = await contract.verifyLogin(timestamp, proofHash, userAddress, signature);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt?.blockNumber);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
