import { OpenAI } from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";

// Create an OpenAI client (edge-friendly)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Set the runtime to edge for best performance
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // const { messages } = await req.json();
    const prompt = `Create a list of three open-ended and engaging 
    questions formatted as a single string. Each question should be separated by '||'. These questions 
    are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience.
    Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. 
    
    For example, your output should be structured like this: 
    'What's a hobby you've recently started? || If you could have dinner with any 
    historical figure, who would it be? || What's a simple thing that makes you happy?'. 
    
    Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

    // Ask OpenAI for a streaming chat completion
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      stream: true,
      max_tokens: 400,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      console.error(
        `OpenAI API Error: ${name}, status: ${status}, header: ${headers}, messages: ${message}`
      );
      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      console.error("error in OpenAI: " + error);
      throw error;
    }
  }
}
