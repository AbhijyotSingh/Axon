import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const geminiMessages = messages.map((msg: any) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
}));

const result = await model.generateContent({
  contents: geminiMessages,
});

    return NextResponse.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Gemini server error:", error);
    return NextResponse.json(
      { error: "Gemini request failed" },
      { status: 500 }
    );
  }
}
