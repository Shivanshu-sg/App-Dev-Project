type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AssistantInput = {
  message: string;
  history?: AssistantMessage[];
};

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const toGeminiRole = (role: AssistantMessage['role']) => {
  return role === 'assistant' ? 'model' : 'user';
};

export const sendAssistantMessage = async (input: AssistantInput) => {
  if (!GOOGLE_API_KEY) {
    return {
      reply:
        'AI assistant is not configured yet. Please add GOOGLE_API_KEY in the API environment.',
    };
  }

  const contents = [
    ...(input.history ?? []).map((message) => ({
      role: toGeminiRole(message.role),
      parts: [{ text: message.content }],
    })),
    {
      role: 'user',
      parts: [{ text: input.message }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                'You are Lifely AI, a supportive care assistant. Help members understand their care plan, tasks, check-ins, routines, accessibility needs, and daily wellness. Do not give medical diagnosis. Encourage contacting a doctor or caregiver for urgent or medical concerns.',
            },
          ],
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
    throw new Error('AI assistant request failed');
  }

  const data = await response.json();

  return {
    reply:
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      'Sorry, I could not generate a response.',
  };
};