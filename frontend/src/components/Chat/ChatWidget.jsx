import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './ChatWidget.module.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Olá! Sou o assistente virtual da My Gastronomy. Como posso ajudar você hoje?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    
    const userMessage = { 
      text: inputMessage, 
      isUser: true, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          user_id: 'gastronomy_user'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro na resposta do servidor');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        text: data.response, 
        isUser: false,
        timestamp: new Date(),
        sources: data.sources 
      }]);
    } catch (error) {
      console.error('Erro:', error);
      setMessages(prev => [...prev, { 
        text: "Desculpe, estou tendo problemas para me conectar. Por favor, tente novamente em alguns instantes.", 
        isUser: false,
        timestamp: new Date()
      }]);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-widget">
      {/* Botão flutuante */}
      {!isOpen && (
        <motion.button 
          className="chat-button"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <FaRobot className="chat-button-icon" />
          <span className="notification-dot"></span>
        </motion.button>
      )}
      
      {/* Janela do chat */}
      {isOpen && (
        <motion.div 
          className="chat-window"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <div className="chat-header">
            <div className="chat-title">
              <FaRobot className="header-icon" />
              <div>
                <h3>Assistente Virtual</h3>
                <span className="status-online">● Online</span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message-container ${msg.isUser ? 'user' : 'bot'}`}
              >
                <div className="message-avatar">
                  {msg.isUser ? <FaUser /> : <FaRobot />}
                </div>
                <div className="message-content">
                  <div className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                    {msg.text}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="sources">
                        <small>Fontes: {msg.sources.join(', ')}</small>
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-container bot">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="message bot loading-message">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <div className="chat-input">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte sobre nosso menu, horários, reservas..."
                disabled={loading}
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="send-button"
              >
                <FaPaperPlane />
              </button>
            </div>
            <div className="chat-suggestions">
              <small>Sugestões: </small>
              <button 
                onClick={() => setInputMessage("Quais são os horários de funcionamento?")}
                disabled={loading}
              >
                Horários
              </button>
              <button 
                onClick={() => setInputMessage("Como faço uma reserva?")}
                disabled={loading}
              >
                Reservas
              </button>
              <button 
                onClick={() => setInputMessage("Qual é o prato do dia?")}
                disabled={loading}
              >
                Prato do dia
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChatWidget;