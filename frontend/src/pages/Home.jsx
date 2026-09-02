import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import api from '../utils/axios';
import { loginStart, loginSuccess, loginFailure, logoutUser } from '../redux/userSlice';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';
import { MessageSquare, Code, Image as ImageIcon, Search, BrainCircuit } from 'lucide-react';

const agents = [
  { id: 'chat', name: 'Standard Chat', icon: MessageSquare },
  { id: 'coding', name: 'Coding Agent', icon: Code },
  { id: 'vision', name: 'Vision Agent', icon: ImageIcon },
  { id: 'search', name: 'Search Agent', icon: Search },
  { id: 'thinker', name: 'Deep Thinker (o1)', icon: BrainCircuit },
];
const Home = () => {
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [agentType, setAgentType] = useState('chat'); // chat, coding, vision, search

  useEffect(() => {
    // Check if session exists on load
    const checkSession = async () => {
      try {
        const res = await api.get('/me');
        dispatch(loginSuccess(res.data));
      } catch (error) {
        dispatch(logoutUser());
      }
    };
    checkSession();
  }, [dispatch]);

  // Example mock for conversations until API is fully tied in UI state
  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      dispatch(loginStart());
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      // Send token to gateway/auth service
      const res = await api.post('/auth/login', { idToken });
      dispatch(loginSuccess(res.data.user));
    } catch (error) {
      console.error('Login failed', error);
      dispatch(loginFailure(error.message));
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutUser());
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
            Multi-Agent AI Studio
          </h1>
          <p className="text-gray-400 mb-8 text-lg">Your intelligent team of AI agents awaits.</p>
          <button 
            onClick={handleLogin}
            className="px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl"
          >
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSelectConversation = async (id) => {
    setActiveConversationId(id);
    try {
      const res = await api.get(`/chat/conversations/${id}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post('/chat/conversations', { title: 'New Conversation', agentUsed: agentType });
      setConversations([res.data, ...conversations]);
      setActiveConversationId(res.data._id);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (text) => {
    let convId = activeConversationId;
    if (!convId) {
      try {
        const res = await api.post('/chat/conversations', { title: text.substring(0, 30), agentUsed: agentType });
        convId = res.data._id;
        setConversations([res.data, ...conversations]);
        setActiveConversationId(convId);
      } catch (e) {
        return console.error(e);
      }
    }

    const newMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, newMessage]);
    setIsSending(true);

    try {
      // In a real flow, you'd save the user message to DB first, then call agent
      const res = await api.post('/agent/execute', { prompt: text, agentType });
      
      const assistantMessage = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to agent.' }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      <Sidebar 
        conversations={conversations} 
        onSelect={handleSelectConversation} 
        activeId={activeConversationId}
        onNew={handleNewConversation}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between bg-gray-900/50 backdrop-blur-sm z-10">
          <h2 className="font-semibold text-gray-300">
            {conversations.find(c => c._id === activeConversationId)?.title || 'New Conversation'}
          </h2>
          
          <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isActive = agentType === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setAgentType(agent.id)}
                  title={agent.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{agent.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} />

        {/* Input */}
        <ChatInput onSend={handleSendMessage} isLoading={isSending} />
      </div>
    </div>
  );
};

export default Home;
