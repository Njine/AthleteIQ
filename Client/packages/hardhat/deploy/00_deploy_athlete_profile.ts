import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const AthleteProfile = await ethers.getContractFactory("AthleteProfile");

  // Deploy the contract
  console.log("Deploying AthleteProfile...");
  const athleteProfile = await AthleteProfile.deploy();

  // Wait for the deployment to complete
  await athleteProfile.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await athleteProfile.getAddress();
  console.log("AthleteProfile deployed to:", contractAddress);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });