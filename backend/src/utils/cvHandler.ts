import pdfParse from "pdf-parse";
import { extractRawText } from "mammoth";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, OPENAI_API_KEY } from "../config/env.config";
import { CVPROMPT } from "../constants/prompt";
import OpenAI from "openai";

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const AI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const extractTextFromCV = async (file: Buffer, mimeType: string): Promise<string> => {
    if (mimeType === PDF) {
        const rawData = await pdfParse(file);
        return rawData.text;
    } else if (mimeType === DOCX) {
        const result = await extractRawText({ buffer: file });
        return result.value;
    } else {
        throw new Error('Unsupported file type!');
    }
};

export const formatText = async (sessionId: string, rawText: string, sendUpdate: (data: any) => void) => {
    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
    });

    let fullContent = '';

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: CVPROMPT },
                { role: "user", content: rawText }
            ],
            response_format: {
                type: "json_object"
            },
            temperature: 0.3,
            stream: true,
        });

        for await (const chunk of response) {
            const content = chunk.choices[0].delta?.content;
            if (content) {
                fullContent += content;
                // Send streaming data
                sendUpdate({
                    status: 'streaming',
                    chunk: content,
                    type: 'cv_format',
                    progress: 20 + Math.min((fullContent.length / 1000) * 40, 40) // 20-60%
                });
            }
        }

        // Parse and return the complete JSON
        const parseText = JSON.parse(fullContent);
        return parseText;
    } catch (error) {
        console.error("Error formatting text:", error);
        throw error;
    }
}

export const embeddingData = async (data: string) => {
    try {
        const vector = await AI.models.embedContent({
            model: "gemini-embedding-001",
            contents: data
        });

        //@ts-ignore
        return vector.embeddings[0].values as number[][];
    } catch (error) {
        console.error("Error embedding data:", error);
        throw error;
    }
}

export const analystDataStats = async (prompt: string) => {
    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
    });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "user", content: prompt },
            ],
            response_format: {
                type: "json_object",
            },
            temperature: 0.3
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content ?? "{}");
    } catch (error) {
        console.error("Error analyzing CV stats:", error);
        throw error;
    }
}