import { appDataSource } from "../../../database/data-source.js";
import { AssistantMessage, AssistantMessageRole } from "./assistant.entity.js";

type AssistantInput = {
  message: string;
};

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const SYSTEM_PROMPT =
  "You are Lifely AI, a supportive care assistant. Help members understand their care plan, tasks, check-ins, routines, accessibility needs, and daily wellness. Do not give medical diagnosis. Encourage contacting a doctor or caregiver for urgent or medical concerns.";

const toGeminiRole = (role: AssistantMessageRole) => {
  return role === "assistant" ? "model" : "user";
};

export const getAssistantHistory = async (userId: string) => {
  return appDataSource.getRepository(AssistantMessage).find({
    where: { userId },
    order: { createdAt: "ASC" },
    take: 30,
  });
};

export const sendAssistantMessage = async (
  userId: string,
  input: AssistantInput,
) => {
  const messageRepo = appDataSource.getRepository(AssistantMessage);

  const previousMessages = await messageRepo.find({
    where: { userId },
    order: { createdAt: "DESC" },
    take: 20,
  });

  const history = previousMessages.reverse();

  const userMessage = await messageRepo.save(
    messageRepo.create({
      userId,
      role: "user",
      content: input.message,
    }),
  );

  if (!GOOGLE_API_KEY) {
    const fallbackReply =
      "AI assistant is not configured yet. Please add GOOGLE_API_KEY in the API environment.";

    await messageRepo.save(
      messageRepo.create({
        userId,
        role: "assistant",
        content: fallbackReply,
      }),
    );

    return {
      reply: fallbackReply,
      message: userMessage,
    };
  }

  const contents = [
    ...history.map((message) => ({
      role: toGeminiRole(message.role),
      parts: [{ text: message.content }],
    })),
    {
      role: "user",
      parts: [{ text: input.message }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google AI error:", response.status, errorText);
    throw new Error("AI assistant request failed");
  }

  const data = await response.json();

  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Sorry, I could not generate a response.";

  const assistantMessage = await messageRepo.save(
    messageRepo.create({
      userId,
      role: "assistant",
      content: reply,
    }),
  );

  return {
    reply,
    message: assistantMessage,
  };
};
