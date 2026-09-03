import { FormEvent, useState } from "react";
import { api } from "../../lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantResponse = {
  data: {
    reply: string;
  };
};

export function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I am Lifely AI. Ask me about your care plan, tasks, check-ins, or daily routine.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedInput },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const result = await api<AssistantResponse>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message: trimmedInput,
          history: messages,
        }),
      });

      setMessages([
        ...nextMessages,
        { role: "assistant", content: result.data.reply },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant failed");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="assistant-page">
      <section className="assistant-header">
        <h1>AI Assistant</h1>
        <p>Get help with care plans, tasks, check-ins, and daily support.</p>
      </section>

      <section className="assistant-chat">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`chat-message ${message.role}`}
          >
            <p>{message.content}</p>
          </article>
        ))}

        {isSending ? (
          <article className="chat-message assistant">
            <p>Thinking...</p>
          </article>
        ) : null}
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <form className="assistant-form" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Lifely AI..."
        />

        <button type="submit" disabled={isSending}>
          Send
        </button>
      </form>
    </main>
  );
}