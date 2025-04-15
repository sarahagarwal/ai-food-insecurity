"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ChatbotPage() {
  // Language state
  const [language, setLanguage] = useState<string>("english");
  
  // Initial welcome messages based on language
  const welcomeMessages = {
    english: "Hello! I can help you find food banks in your area. To provide the best recommendations, could you share your location or the area you're looking in?",
    spanish: "¡Hola! Puedo ayudarte a encontrar bancos de alimentos en tu área. Para darte las mejores recomendaciones, ¿podrías compartir tu ubicación o el área donde estás buscando?"
  };

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: welcomeMessages.english }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<string>("prompt");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [showLanguageSelector, setShowLanguageSelector] = useState<boolean>(true);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Request user location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setLocationPermission(result.state);
        
        if (result.state === "granted") {
          getUserLocation();
        }
        
        result.onchange = function() {
          setLocationPermission(this.state);
          if (this.state === "granted") {
            getUserLocation();
          }
        };
      });
    }
  }, []);

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Send location to backend
        sendLocationToBackend(latitude, longitude);
        
        // Add a message to inform user their location is being used
        const locationMessage = language === "spanish" 
          ? "He detectado tu ubicación. Usaré esta información para encontrar bancos de alimentos cercanos. ¡Pregúntame sobre bancos de alimentos en tu área!"
          : "I've detected your location. I'll use this to find food banks nearest to you. Feel free to ask about food banks in your area!";
        
        setMessages(prev => [
          ...prev, 
          { role: "assistant", content: locationMessage }
        ]);
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  const sendLocationToBackend = async (latitude: number, longitude: number) => {
    try {
      await fetch("http://localhost:5000/api/set-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ latitude, longitude }),
      });
    } catch (error) {
      console.error("Error sending location to backend:", error);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      const requestingMessage = language === "spanish"
        ? "Estoy solicitando acceso a tu ubicación para encontrar bancos de alimentos cercanos..."
        : "I'm requesting access to your location to find food banks near you...";
      
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: requestingMessage }
      ]);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          sendLocationToBackend(latitude, longitude);
          
          const thankYouMessage = language === "spanish"
            ? "¡Gracias! Ahora tengo tu ubicación y puedo proporcionarte recomendaciones más precisas de bancos de alimentos."
            : "Thank you! I now have your location and can provide more accurate food bank recommendations.";
          
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: thankYouMessage }
          ]);
        },
        (error) => {
          const errorMessage = language === "spanish"
            ? "No pude acceder a tu ubicación. Aún puedes buscar bancos de alimentos mencionando tu área en tu mensaje."
            : "I couldn't access your location. You can still search for food banks by mentioning your area in your message.";
          
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: errorMessage }
          ]);
        }
      );
    }
  };

  const setUserLanguage = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setShowLanguageSelector(false);
    
    // Reset chat with appropriate welcome message
    setChatHistory([]);
    setMessages([
      { 
        role: "assistant", 
        content: selectedLanguage === "spanish" ? welcomeMessages.spanish : welcomeMessages.english 
      }
    ]);
  };

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Check for location-specific keywords to prompt for location
    const locationKeywords = language === "english" 
      ? ["near me", "nearby", "close", "closest", "nearest"]
      : ["cerca", "cercano", "cercana", "próximo", "próxima"];
    
    if (locationKeywords.some(keyword => input.toLowerCase().includes(keyword)) && !userLocation && locationPermission !== "denied") {
      requestLocationPermission();
    }

    try {
      // Send message to backend API
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userLocation 
            ? `${input} (User's coordinates: lat ${userLocation.lat}, lng ${userLocation.lng})`
            : input,
          history: chatHistory,
          language: language
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
      
      const errorMessage = language === "spanish"
        ? "Lo siento, encontré un error al conectarme a la base de datos de bancos de alimentos. Por favor, inténtalo de nuevo en un momento."
        : "Sorry, I encountered an error connecting to the food bank database. Please try again in a moment.";
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format message content with Markdown and emojis
  const formatMessageContent = (content: string) => {
    // Convert line breaks to <br> elements
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
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
          {language === "spanish" ? "Buscador de Bancos de Alimentos" : "Food Bank Finder"}
        </h1>
        <p style={{ fontSize: "18px", color: "#4b5563", textAlign: "center", marginBottom: "20px" }}>
          {language === "spanish" 
            ? "Haz preguntas y obtén recomendaciones personalizadas de bancos de alimentos." 
            : "Ask questions and get personalized food bank recommendations."}
        </p>
        
        {/* Language selector */}
        {showLanguageSelector && (
          <div 
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              textAlign: "center"
            }}
          >
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
              Choose your preferred language / Elige tu idioma preferido:
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => setUserLanguage("english")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2c5f2d",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                English 🇺🇸
              </button>
              <button
                onClick={() => setUserLanguage("spanish")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2c5f2d",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Español 🇪🇸
              </button>
            </div>
          </div>
        )}
        
        {/* Location button */}
        {!userLocation && locationPermission !== "denied" && !showLanguageSelector && (
          <button
            onClick={requestLocationPermission}
            style={{
              padding: "12px 20px",
              backgroundColor: "#2c5f2d",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "20px",
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span role="img" aria-label="location">📍</span>
            {language === "spanish" 
              ? "Compartir mi ubicación para mejores resultados" 
              : "Share My Location for Better Results"}
          </button>
        )}
        
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
                maxWidth: "75%",
                marginBottom: "12px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                whiteSpace: "pre-wrap"
              }}
            >
              {formatMessageContent(message.content)}
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
              placeholder="Ask about food banks near you..."
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