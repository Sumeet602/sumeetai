import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar.jsx";
import MessageList from "./MessageList.jsx";
import ChatInput from "./ChatInput.jsx";
import Artifact from "./Artifact.jsx";
import { getConversations, getMessages } from "../utils/api.js";
import { setConversations } from "../store/conversationSlice.js";
import { setMessages, clearMessages } from "../store/messageSlice.js";

const MainChat = () => {
  const dispatch = useDispatch();
  const selectedConversation = useSelector((state) => state.conversations.selectedConversation);
  const messages = useSelector((state) => state.messages.list);
  const [activeArtifact, setActiveArtifact] = useState(null);

  useEffect(() => {
    // Check if the latest message has a code artifact to automatically open it
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.artifacts?.length > 0) {
        const codeArtifact = lastMsg.artifacts.find(a => a.type === "code");
        if (codeArtifact) setActiveArtifact(codeArtifact);
      }
    }
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await getConversations();
        if (res.data.success) {
          dispatch(setConversations(res.data.conversations));
        }
      } catch (error) {
        console.error("Failed to load conversations", error);
      }
    };
    fetchConversations();
  }, [dispatch]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMsgs = async () => {
        try {
          const res = await getMessages(selectedConversation._id);
          if (res.data.success) {
            dispatch(setMessages(res.data.messages));
          }
        } catch (error) {
          console.error("Failed to load messages", error);
        }
      };
      fetchMsgs();
    } else {
      dispatch(clearMessages());
      setActiveArtifact(null);
    }
  }, [selectedConversation, dispatch]);

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full bg-zinc-950">
        {/* Nav header */}
        <div className="h-14 border-b border-zinc-800 flex items-center px-6 gap-3 text-white font-medium">
          <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          {selectedConversation ? selectedConversation.title : "New Conversation"}
          {messages.length > 0 && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-zinc-800/50 text-zinc-400 text-xs font-normal border border-zinc-800">
              {messages.length} Messages
            </span>
          )}
        </div>
        
        <MessageList onArtifactClick={(art) => setActiveArtifact(art)} />
        <ChatInput />
      </div>
      {activeArtifact && <Artifact artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />}
    </div>
  );
};

export default MainChat;
