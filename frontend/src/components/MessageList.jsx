import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    // Auto scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-3xl text-gray-500 font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-500 to-gray-700">How can I help you today?</h2>
        <p className="text-gray-600 text-center max-w-md">Start typing below to interact with your selected AI agent. Try asking for code, images, or web searches!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
      <div className="max-w-4xl mx-auto flex flex-col w-full pb-32">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
