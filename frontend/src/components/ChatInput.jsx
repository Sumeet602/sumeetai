import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSend, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSend(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-10 pb-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto relative">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end w-full bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to the agents..."
            className="w-full bg-transparent text-white placeholder-gray-400 p-4 max-h-48 resize-none focus:outline-none"
            rows="1"
            style={{ minHeight: '60px' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <div className="text-center mt-3 text-xs text-gray-500">
          AI can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
