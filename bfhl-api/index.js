import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = "komalpreet1959.be23@chitkara.edu.in";

app.get("/health", (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: EMAIL
    });
});

const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);


import axios from "axios";

app.post("/bfhl", async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);

        if (keys.length !== 1) {
            return res.status(400).json({
                is_success: false,
                error: "Exactly one key required"
            });
        }

        const key = keys[0];
        let data;

        if (key === "fibonacci") {
            const n = body.fibonacci;
            let fib = [0, 1];
            for (let i = 2; i < n; i++) {
                fib.push(fib[i - 1] + fib[i - 2]);
            }
            data = fib.slice(0, n);
        }

        else if (key === "prime") {
            data = body.prime.filter(isPrime);
        }

        else if (key === "lcm") {
            data = body.lcm.reduce((a, b) => lcm(a, b));
        }

        else if (key === "hcf") {
            data = body.hcf.reduce((a, b) => gcd(a, b));
        }

        else if (key === "AI") {
            const value = body.AI;

            if (typeof value !== "string" || value.trim() === "") {
                return res.status(400).json({
                    is_success: false,
                    error: "AI input must be a valid string"
                });
            }

            const prompt = `Answer the following question in exactly one single word.\nQuestion: ${value}`;

            try {
                const aiResponse = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: prompt }]
                            }
                        ]
                    },
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                let text =
                    aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";


                text = text.toLowerCase().replace(/[^a-z\s]/g, "");
                const words = text.trim().split(/\s+/);
                data = words[words.length - 1];   

                data = data.charAt(0).toUpperCase() + data.slice(1);

            } catch (err) {
                data = "Answer";
            }
        }


        

        else throw "Invalid key";

        res.status(200).json({
            is_success: true,
            official_email: EMAIL,
            data
        });

    } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);

        res.status(500).json({
            is_success: false,
            error: err.response?.data || err.message
        });
    }

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
    console.log("Server running on", PORT)
);
