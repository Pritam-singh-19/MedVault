import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import "./styles/chatbot.css";

const ChatBot = ({ summary }) => {
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: "Hello! How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const chatBoxRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when chatHistory changes
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Helper to format bot response as points
  const formatBotResponse = (text) => {
    // Split by newlines or numbered points
    const points = text.split(/\n|(?<=\.)\s(?=\d+\.)/).filter(Boolean);
    if (points.length > 1) {
      return (
        <ul>
          {points.map((point, idx) => (
            <li key={idx}>{point.trim()}</li>
          ))}
        </ul>
      );
    }
    return <span>{text}</span>;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newChat = [...chatHistory, userMessage];

    setChatHistory(newChat);
    setInput('');

    try {
      const res = await axios.post('/api/chatbot', {
        query: input,
        reportText: summary || ""
      });

      const assistantMessage = { role: 'assistant', content: res.data.answer };
      setChatHistory([...newChat, assistantMessage]);
    } catch (err) {
      console.error('Error communicating with chatbot:', err);
    }
  };

  return (
    <div className="chat-container">
      <h3>
        {summary
          ? "Feel free to ask anything about this report 😊"
          : "Ask me anything about health, medicines, or reports!"}
      </h3>
      <div className="chat-box" ref={chatBoxRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={msg.role}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong>{" "}
            {msg.role === 'assistant'
              ? formatBotResponse(msg.content)
              : msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask a question..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatBot;