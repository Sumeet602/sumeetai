import React from 'react';
import { PlusCircle, MessageSquare, LogOut, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = ({ conversations, onSelect, activeId, onNew, onLogout }) => {
  const { currentUser } = useSelector(state => state.user);

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 px-4 transition-colors font-medium shadow-md hover:shadow-blue-500/20"
        >
          <PlusCircle className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {conversations?.map((conv) => (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left truncate ${
              activeId === conv._id 
                ? 'bg-gray-800 text-white font-medium' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <MessageSquare className={`w-4 h-4 shrink-0 ${activeId === conv._id ? 'text-blue-400' : ''}`} />
            <span className="truncate text-sm">{conv.title || 'New Conversation'}</span>
          </button>
        ))}
      </div>

      {/* User Profile footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={currentUser?.photoURL || 'https://via.placeholder.com/40'} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border border-gray-700"
          />
          <div className="flex-1 truncate">
            <p className="text-sm font-semibold text-white truncate">{currentUser?.displayName}</p>
            <p className="text-xs text-green-400 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> {currentUser?.credits} Credits
            </p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
