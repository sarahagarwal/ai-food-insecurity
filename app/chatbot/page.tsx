"use client";
import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Send message to backend API
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch response: ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center min-h-screen bg-[#fef6e4]">
      <Header />
      <main className="flex-1 w-full max-w-3xl px-4 py-10 flex flex-col">
        <div className="text-center mb-5">
          <h1 className="text-4xl font-bold text-[#2c5f2d]">
            AI Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Chat with our AI to get helpful information and answers to your questions.
          </p>
        </div>

        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg p-5 mb-5 shadow-md flex flex-col gap-3 min-h-96">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-400 text-center">
              <p>No messages yet. Start by asking me anything!</p>
              <p className="text-sm mt-2">
                Example: "What are ways to eat healthier on a budget?"
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === "user" ? "self-end bg-[#2c5f2d] text-white" : "self-start bg-[#f59e0b] text-black"
                } px-4 py-3 rounded-2xl max-w-[80%] break-words`}
              >
                {message.content}
              </div>
            ))
          )}
          {isLoading && (
            <div className="self-start bg-[#f59e0b] text-black px-4 py-3 rounded-2xl">
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-3 rounded-lg border border-gray-300 text-base"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-[#2c5f2d] text-white px-6 py-3 rounded-lg border-none text-base font-medium ${
              isLoading || !input.trim() ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            Send
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}