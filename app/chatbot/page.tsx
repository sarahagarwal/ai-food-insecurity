"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I can help you find food banks in your area. What are you looking for today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
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
          message: input,
          history: chatHistory
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      
      // Update chat history for next request
      setChatHistory(data.history);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#fef6e4",
      }}
    >
      <Header />
      <main
        style={{
          flex: "1",
          width: "100%",
          maxWidth: "800px",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#2c5f2d", textAlign: "center" }}>
          Food Bank Finder
        </h1>
        <p style={{ fontSize: "18px", color: "#4b5563", textAlign: "center", marginBottom: "20px" }}>
          Ask questions and get personalized food bank recommendations.
        </p>
        
        {/* Chat message container */}
        <div 
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: "400px",
            maxHeight: "500px"
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: message.role === "user" ? "#e9fae3" : "#f3f4f6",
                color: "#4b5563",
                borderRadius: "18px",
                padding: "12px 16px",
                maxWidth: "70%",
                marginBottom: "12px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
              }}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#f3f4f6",
                color: "#4b5563",
                borderRadius: "18px",
                padding: "12px 16px",
                maxWidth: "70%",
                marginBottom: "12px",
              }}
            >
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSendMessage} style={{ width: "100%" }}>
          <div style={{ 
            display: "flex", 
            width: "100%", 
            borderRadius: "25px",
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food banks..."
              style={{
                flex: 1,
                padding: "16px 20px",
                borderRadius: "25px 0 0 25px",
                border: "none",
                outline: "none",
                fontSize: "16px"
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "16px 24px",
                backgroundColor: "#2c5f2d",
                color: "white",
                borderRadius: "0 25px 25px 0",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              Send
            </button>
          </div>
        </form>
      </main>
      <Footer />
      
      {/* Add this CSS for the typing indicator */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 2px;
          background-color: #8b8b8b;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </div>
  );
}
