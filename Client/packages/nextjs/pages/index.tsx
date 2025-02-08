import { useState } from "react";
import { useContract, useSigner } from "wagmi";
import AthleteProfileABI from "../artifacts/contracts/AthleteProfile.sol/AthleteProfile.json";
import { groth16 } from "snarkjs";

export default function Home() {
    const [name, setName] = useState<string>("");
    const [age, setAge] = useState<number>(0);
    const [sex, setSex] = useState<string>("");
    const [sport, setSport] = useState<string>("");
    const [height, setHeight] = useState<number>(0);
    const [weight, setWeight] = useState<number>(0);
    const [country, setCountry] = useState<string>("");

    const { data: signer } = useSigner();
    const athleteProfile = useContract({
        address: "0xYourContractAddress", // Replace with your contract address
        abi: AthleteProfileABI.abi,
        signerOrProvider: signer,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Generate zk-proof
        const { proof, publicSignals } = await groth16.fullProve(
            { secret: "user-secret", hash: "hashed-secret" },
            "circuit.wasm",
            "circuit_final.zkey"
        );

        // Send proof and profile data to the contract
        const tx = await athleteProfile.setProfileWithZkProof(
            name,
            age,
            sex,
            sport,
            height,
            weight,
            country,
            proof
        );
        await tx.wait();
        console.log("Profile updated!");
    };

    return (
        <div>
            <h1>Athlete Profile</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                />
                <input
                    type="text"
                    placeholder="Sex"
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Sport"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Height (cm)"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                />
                <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                />
                <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                />
                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
}