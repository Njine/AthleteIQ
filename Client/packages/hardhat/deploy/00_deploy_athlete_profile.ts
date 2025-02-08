import { expect } from "chai";
import { ethers } from "hardhat";

describe("AthleteProfile", function () {
    let AthleteProfile: any;
    let athleteProfile: any;
    let owner: any;
    let addr1: any;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        AthleteProfile = await ethers.getContractFactory("AthleteProfile");
        athleteProfile = await AthleteProfile.deploy();
        await athleteProfile.deployed();
    });

    it("Should create a profile", async function () {
        await athleteProfile.setProfileWithZkProof(
            "Eliud Kipchoge",
            38,
            "Male",
            "Marathon",
            167,
            52,
            "Kenya",
            "0x" // Mock zk-proof
        );

        const profile = await athleteProfile.getProfile(owner.address);
        expect(profile.name).to.equal("Eliud Kipchoge");
        expect(profile.age).to.equal(38);
        expect(profile.sex).to.equal("Male");
        expect(profile.sport).to.equal("Marathon");
        expect(profile.height).to.equal(167);
        expect(profile.weight).to.equal(52);
        expect(profile.country).to.equal("Kenya");
    });

    it("Should return the total number of athletes", async function () {
        await athleteProfile.setProfileWithZkProof(
            "Eliud Kipchoge",
            38,
            "Male",
            "Marathon",
            167,
            52,
            "Kenya",
            "0x" // Mock zk-proof
        );

        const totalAthletes = await athleteProfile.getTotalAthletes();
        expect(totalAthletes).to.equal(1);
    });
});