import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Phone, Mail } from 'lucide-react';
import { ChatService } from '../services/firebase';
import { Message, UserConversation } from '../types/firebase';
import { useAuth } from '../contexts/AuthContext';
import { GroqApiService } from '../services/groqApi';

interface MessageWithId extends Message {
  id: string;
}

export default function ChatSupport() {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For demo purposes, using a static patient ID
  // In a real app, this would come from authentication
  // currentUser?.uid is now the current user's UID

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing conversations for the patient
  const loadConversations = async () => {
    try {
      // In a real app, you'd have a service method to get conversations by patient
      // For now, we'll use localStorage to simulate persistence
      const storedConversations = localStorage.getItem(`conversations_${currentUser?.uid}`);
      if (storedConversations) {
        const parsedConversations = JSON.parse(storedConversations);
        setConversations(parsedConversations);
        
        // Get the most recent active conversation
        const activeConversation = parsedConversations.find((conv: any) => conv.status === 'active');
        if (activeConversation) {
          setConversationId(activeConversation.id);
          return activeConversation.id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error loading conversations:', error);
      return null;
    }
  };

  const initializeConversation = async () => {
    try {
      setLoading(true);
      
      // First try to load existing conversations
      const existingConversationId = await loadConversations();
      
      if (existingConversationId) {
        // Load messages for existing conversation
        const storedMessages = localStorage.getItem(`messages_${existingConversationId}`);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
        setIsConnected(true);
        return;
      }
      
      // Create new conversation if none exists
      const conversation: Omit<UserConversation, 'id'> = {
        participants: {
          supportAgent: 'agent_001'
        },
        conversationInfo: {
          type: 'general',
          status: 'active',
          priority: 'normal',
          category: 'general',
          subject: 'General Support',
          language: 'en'
        },
        timestamps: {
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        metadata: {
          tags: ['general', 'support'],
          escalated: false
        }
      };

      if (!currentUser) {
        alert('Please log in to start a conversation');
        return;
      }

      const newConversationId = await ChatService.createConversation(currentUser.uid, conversation);
      setConversationId(newConversationId);

      // Store conversation locally
      const newConversationData = {
        id: newConversationId,
        ...conversation,
        status: 'active'
      };
      
      const updatedConversations = [...conversations, newConversationData];
      setConversations(updatedConversations);
      localStorage.setItem(`conversations_${currentUser?.uid}`, JSON.stringify(updatedConversations));

      // Send welcome message
      const welcomeMessage: Omit<Message, 'id'> = {
        senderId: 'ai_agent',
        senderType: 'support',
        content: {
          text: 'Hello! Welcome to MediCare Hospital AI support. I\'m here to help you with your medical inquiries, appointment scheduling, and general hospital information. How can I assist you today?',
          type: 'text',
          attachments: []
        },
        timestamps: {
          sentAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString(),
          readAt: new Date().toISOString()
        },
        status: 'read',
        isEdited: false,
        editedAt: null,
        replyTo: null
      };

      await ChatService.sendMessage(currentUser.uid, newConversationId, welcomeMessage);
      
      // Store welcome message locally
      const welcomeMessageWithId = { id: 'welcome_' + Date.now(), ...welcomeMessage };
      setMessages([welcomeMessageWithId]);
      localStorage.setItem(`messages_${newConversationId}`, JSON.stringify([welcomeMessageWithId]));
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    // Set up real-time listener for messages
    if (!currentUser) return;
    const unsubscribe = ChatService.onUserMessagesChange(currentUser.uid, conversationId, (messagesData) => {
      if (messagesData) {
        const messagesArray = Object.entries(messagesData)
          .map(([id, message]) => ({ id, ...message }))
          .sort((a, b) => new Date(a.timestamps.sentAt).getTime() - new Date(b.timestamps.sentAt).getTime());
        
        setMessages(messagesArray);
      }
    });

    return unsubscribe;
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;

    const messageText = message.trim();
    setMessage('');

    try {
      const newMessage: Omit<Message, 'id'> = {
        senderId: currentUser?.uid || 'unknown',
        senderType: 'patient',
        content: {
          text: messageText,
          type: 'text',
          attachments: []
        },
        timestamps: {
          sentAt: new Date().toISOString(),
          deliveredAt: new Date().toISOString()
        },
        status: 'delivered',
        isEdited: false,
        editedAt: null,
        replyTo: null
      };

      // Add message to local state immediately
      const messageWithId = { id: 'msg_' + Date.now(), ...newMessage };
      const updatedMessages = [...messages, messageWithId];
      setMessages(updatedMessages);
      
      // Store messages locally
      localStorage.setItem(`messages_${conversationId}`, JSON.stringify(updatedMessages));

      if (!currentUser) return;
      await ChatService.sendMessage(currentUser.uid, conversationId, newMessage);

      // Get AI response from Groq API
      setTimeout(async () => {
        try {
          // Call Groq API to get AI response
          const aiResponse = await GroqApiService.sendMessage(messageText);

          const supportMessage: Omit<Message, 'id'> = {
            senderId: 'ai_agent',
            senderType: 'support',
            content: {
              text: aiResponse,
              type: 'text',
              attachments: []
            },
            timestamps: {
              sentAt: new Date().toISOString(),
              deliveredAt: new Date().toISOString()
            },
            status: 'delivered',
            isEdited: false,
            editedAt: null,
            replyTo: null
          };

          // Add support message to local state
          const supportMessageWithId = { id: 'ai_' + Date.now(), ...supportMessage };
          const finalMessages = [...updatedMessages, supportMessageWithId];
          setMessages(finalMessages);
          
          // Store updated messages locally
          localStorage.setItem(`messages_${conversationId}`, JSON.stringify(finalMessages));

          if (currentUser) {
            await ChatService.sendMessage(currentUser.uid, conversationId, supportMessage);
          }
        } catch (error) {
          console.error('Error getting AI response:', error);
          
          // Fallback message if AI fails
          const fallbackMessage: Omit<Message, 'id'> = {
            senderId: 'ai_agent',
            senderType: 'support',
            content: {
              text: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or contact our support team directly for immediate assistance.',
              type: 'text',
              attachments: []
            },
            timestamps: {
              sentAt: new Date().toISOString(),
              deliveredAt: new Date().toISOString()
            },
            status: 'delivered',
            isEdited: false,
            editedAt: null,
            replyTo: null
          };

          const fallbackMessageWithId = { id: 'fallback_' + Date.now(), ...fallbackMessage };
          const finalMessages = [...updatedMessages, fallbackMessageWithId];
          setMessages(finalMessages);
          
          localStorage.setItem(`messages_${conversationId}`, JSON.stringify(finalMessages));

          if (currentUser) {
            await ChatService.sendMessage(currentUser.uid, conversationId, fallbackMessage);
          }
        }
      }, 1000); // Reduced delay since AI response might take some time

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getSenderName = (message: MessageWithId) => {
    switch (message.senderType) {
      case 'patient':
        return 'You';
      case 'support':
        return message.senderId === 'ai_agent' ? 'AI Assistant' : 'Support Agent';
      case 'doctor':
        return 'Doctor';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">AI Chat Support</h1>
          <p className="text-xl text-blue-100">Get instant help from our AI-powered support assistant</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-sm text-gray-600">+880 1799-725100</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-gray-600">support@medicare.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Live Chat</div>
                    <div className="text-sm text-gray-600">Available 24/7</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Emergency Contact</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-600 text-lg">🚨</span>
                  <span className="font-medium text-red-800">Emergency Line</span>
                </div>
                <div className="text-lg font-bold text-red-600"> 999-HELP</div>
                <div className="text-sm text-red-600 mt-1">For medical emergencies only</div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Chat Status</h3>
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {loading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Chat History */}
            <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Chat History</h3>
                <button
                  onClick={() => setShowConversationList(!showConversationList)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showConversationList ? 'Hide' : 'Show'} History
                </button>
              </div>
              
              {showConversationList && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-gray-500 text-sm">No previous conversations</p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          if (conv.id !== conversationId) {
                            setConversationId(conv.id);
                            const storedMessages = localStorage.getItem(`messages_${conv.id}`);
                            if (storedMessages) {
                              setMessages(JSON.parse(storedMessages));
                            } else {
                              setMessages([]);
                            }
                          }
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                          conv.id === conversationId 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        } border`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {conv.conversationInfo?.subject || 'General Support'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(conv.timestamps?.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`px-2 py-1 text-xs rounded-full ${
                            conv.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {conv.status}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {conversations.length > 0 && (
                    <button
                      onClick={async () => {
                        // Mark current conversation as resolved and create new one
                        if (conversationId) {
                          const updatedConversations = conversations.map(conv => 
                            conv.id === conversationId ? { ...conv, status: 'resolved' } : conv
                          );
                          setConversations(updatedConversations);
                          localStorage.setItem(`conversations_${currentUser?.uid}`, JSON.stringify(updatedConversations));
                        }
                        
                        // Reset state for new conversation
                        setConversationId(null);
                        setMessages([]);
                        setIsConnected(false);
                        
                        // Create new conversation
                        await initializeConversation();
                        setShowConversationList(false);
                      }}
                      className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      Start New Conversation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">AI Support Chat</h3>
                    <p className="text-sm text-blue-100">
                      {loading ? 'Connecting...' : 'Powered by AI - We\'re here to help you'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Connecting to support...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.senderType === 'patient'
                            ? 'bg-blue-600 text-white'
                            : msg.senderType === 'support'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <div className="text-sm">{typeof msg.content.text === 'string' ? msg.content.text : JSON.stringify(msg.content.text)}</div>
                        <div className={`text-xs mt-1 flex justify-between items-center ${
                          msg.senderType === 'patient' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{getSenderName(msg)}</span>
                          <span>{String(formatTime(msg.timestamps.sentAt))}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={loading ? "Connecting..." : "Type your message..."}
                    disabled={loading || !isConnected}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !isConnected || !message.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}