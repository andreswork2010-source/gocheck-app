
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "h:\\DOCUMENTOS - Andrés\\ANDRES\\NEGOCIOS\\GoluM\\app\\.env" });

const API_KEY = process.env.VITE_GEMINI_API_KEY || "";
console.log("Testing API Key:", API_KEY.substring(0, 5) + "...");

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    try {
        const result = await model.generateContent("Respond with 'OK'");
        const response = await result.response;
        console.log("API Response:", response.text());
    } catch (err) {
        console.error("API Test Failed:", err);
    }
}

run();
