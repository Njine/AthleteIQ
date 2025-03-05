const hre = require("hardhat");

async function main() {
    const ZKPVerification = await hre.ethers.getContractFactory("ZKPVerification");
    const zkpVerification = await ZKPVerification.deploy();
    await zkpVerification.deployed();
    console.log("ZKPVerification deployed to:", zkpVerification.address);

    const Leaderboard = await hre.ethers.getContractFactory("Leaderboard");
    const leaderboard = await Leaderboard.deploy();
    await leaderboard.deployed();
    console.log("Leaderboard deployed to:", leaderboard.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});