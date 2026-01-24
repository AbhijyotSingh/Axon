import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const contents = messages.map((msg: any) => {
      // TEXT ONLY
      if (msg.type === "text") {
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        };
      }

      // IMAGE OR PDF
      if (msg.type === "file") {
        return {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: msg.mimeType, // image/png | image/jpeg | application/pdf
                data: msg.base64,       // base64 string WITHOUT prefix
              },
            },
            { text: msg.prompt || "Analyze this file" },
          ],
        };
      }
    });

    const result = await model.generateContent({
      contents,
    });

    return NextResponse.json({
      reply: result.response.text(),
    });
  } catch (error) {
    console.error("Gemini server error:", error);
    return NextResponse.json(
      { error: "Gemini request failed" },
      { status: 500 }
    );
  }
}
