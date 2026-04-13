import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyB_3floX8nHwUby1wZZG0IJlLzZgEj9NnQ";

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hola, responde en una palabra.");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (error) {
        console.log("FAILED:", error.message);
    }
}

test();
