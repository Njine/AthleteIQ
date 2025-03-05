import React, { useState } from "react";
import axios from "axios";

const SubmitData = () => {
    const [inputDataPath, setInputDataPath] = useState("");

    const handleSubmit = async () => {
        try {
            const response = await axios.post("/generate_proof", {
                input_data_path: inputDataPath,
            });
            console.log("Proof generated:", response.data.proof);
        } catch (error) {
            console.error("Error generating proof:", error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={inputDataPath}
                onChange={(e) => setInputDataPath(e.target.value)}
                placeholder="Enter input data path"
            />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default SubmitData;