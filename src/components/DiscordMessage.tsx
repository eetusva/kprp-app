import React from 'react';
import { Message } from '../types';

interface DiscordMessageProps {
  message: Message;
}

const DiscordMessage: React.FC<DiscordMessageProps> = ({ message }) => {
  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="py-2 px-4 hover:bg-[#32353b] transition-colors message-container group">
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          <img
            src={message.user.avatar}
            alt={message.user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-baseline">
            <h3 className="font-medium text-[#f2f3f5] mr-2">
              {message.user.username}
            </h3>
            <span className="text-xs text-[#a3a6aa]">
              {formatMessageTime(message.timestamp)}
            </span>
            <span className="hidden group-hover:inline-block text-xs text-[#a3a6aa] ml-2">
              {formatMessageDate(message.timestamp)}
            </span>
          </div>
          
          <div className="text-[#dcddde] whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordMessage;
