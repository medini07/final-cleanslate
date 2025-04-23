import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import api, { ChatMessage, VideoResource, WebResource } from '../../services/api';

interface SupportChatProps {
  userId: string;
  initialChatId?: string;
  className?: string;
}

const SupportChat: React.FC<SupportChatProps> = ({ userId, initialChatId, className = '' }) => {
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [resources, setResources] = useState<WebResource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [realTimeResults, setRealTimeResults] = useState<VideoResource[]>([]);
  const [showRealTimeResults, setShowRealTimeResults] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial chat history if chatId is provided
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId);
    } else {
      // Welcome message if no chat history
      setMessages([{
        role: 'assistant',
        content: "Hi there! I'm your Cleanslate support assistant. How are you feeling today? You can talk to me about any challenges you're facing with quitting smoking, ask for advice, or just chat about how things are going.",
      }]);
    }
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when component loads
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Real-time search as user types
  const handleRealTimeSearch = useCallback((query: string) => {
    if (query.length < 4) {
      setShowRealTimeResults(false);
      return;
    }

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for the search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // This would be a real API call in production
        // For now, we'll simulate by sending a message to our chat endpoint with a special prefix
        const searchQuery = `search_videos: ${query}`;
        const response = await api.sendChatMessage(userId, searchQuery, chatId);
        
        if (response.videos && response.videos.length > 0) {
          setRealTimeResults(response.videos);
          setShowRealTimeResults(true);
        } else {
          setShowRealTimeResults(false);
        }
      } catch (err) {
        console.error('Real-time search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce
  }, [userId, chatId]);

  useEffect(() => {
    if (inputValue.toLowerCase().includes('video') || 
        inputValue.toLowerCase().includes('watch') ||
        inputValue.toLowerCase().includes('craving') ||
        inputValue.length > 15) {
      handleRealTimeSearch(inputValue);
    } else {
      setShowRealTimeResults(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue, handleRealTimeSearch]);

  const loadChatHistory = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await api.getChatHistory(id);
      setMessages(response.messages);
    } catch (err) {
      setError('Failed to load chat history. Starting a new conversation.');
      setMessages([{
        role: 'assistant',
        content: "Hi there! I'm your Cleanslate support assistant. How can I help you today?"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setShowRealTimeResults(false);
    
    // Optimistically add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      setIsLoading(true);
      setVideos([]);
      setResources([]);
      
      const response = await api.sendChatMessage(userId, userMessage, chatId);
      
      // Set chatId if this is a new conversation
      if (!chatId) {
        setChatId(response.chatId);
      }
      
      // Add assistant's response
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      
      // Set videos and resources if any
      if (response.videos) setVideos(response.videos);
      if (response.resources) setResources(response.resources);
      
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = () => {
    return [
      "I'm having a strong craving right now",
      "I had a relapse yesterday",
      "What should I do when I feel like smoking?",
      "Can you suggest some coping techniques?",
      "How long do nicotine cravings usually last?",
      "I'm feeling anxious without cigarettes"
    ];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowRealTimeResults(false);
    inputRef.current?.focus();
  };

  const handleVideoClick = (video: VideoResource) => {
    // Add this video to the search query
    setInputValue(`I'd like to watch videos about ${video.title.toLowerCase()}`);
    setShowRealTimeResults(false);
    inputRef.current?.focus();
  };

  return (
    <Card className={`flex flex-col h-[700px] bg-white shadow-xl border-0 rounded-xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
        <h2 className="font-bold text-lg">Cleanslate Support Assistant</h2>
        <p className="text-sm opacity-80">Get help with cravings, relapses, or any questions</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <span className="text-sm">🚭</span>
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-purple-400 text-black rounded-tr-none shadow-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
              }`}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
              <span className="text-sm">🚭</span>
            </div>
            <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <span className="flex gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></span>
              </span>
            </div>
          </div>
        )}

        {/* Videos section */}
        {videos.length > 0 && (
          <div className="mb-4 pl-12">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Recommended Videos:</h3>
            <div className="grid grid-cols-1 gap-2">
              {videos.map((video, idx) => (
                <a 
                  key={idx}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-16 bg-gray-100 flex-shrink-0">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2 flex-1">
                    <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-gray-500">{video.channel}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resources section */}
        {resources.length > 0 && (
          <div className="mb-4 pl-12">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">Helpful Resources:</h3>
            <div className="flex flex-col gap-1">
              {resources.map((resource, idx) => (
                <a 
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  {resource.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Suggestions:</div>
        <div className="flex flex-wrap gap-1">
          {getSuggestions().map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs hover:bg-primary/10 transition-colors"
            >
              {suggestion.length > 25 ? suggestion.substring(0, 25) + '...' : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
          {/* Real-time search results */}
          {showRealTimeResults && realTimeResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Video Suggestions</h4>
                <button 
                  type="button"
                  onClick={() => setShowRealTimeResults(false)}
                  className="text-xs bg-red-600 rounded-4xl text-white hover:text-gray-600"
                >
                  Hide
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {realTimeResults.map((video, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleVideoClick(video)}
                    className="cursor-pointer flex-shrink-0 w-52 border border-gray-100 rounded-md overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="h-24 bg-gray-100">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <h5 className="text-xs font-medium line-clamp-2">{video.title}</h5>
                      <p className="text-xs text-gray-500">{video.channel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search status indicator */}
          {isSearching && (
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 mr-2 rounded-full border-2 border-gray-300 border-t-primary animate-spin"></div>
              <span className="text-xs text-gray-500">Finding relevant videos...</span>
            </div>
          )}

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              disabled={isLoading}
              ref={inputRef}
            />
            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isLoading} 
              className="px-6"
            >
              <span className="mr-1">Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </Button>
          </div>
          {inputValue.length > 0 && !showRealTimeResults && (
            <div className="text-xs text-gray-500 mt-1 ml-1">
              {inputValue.toLowerCase().includes('video') || inputValue.toLowerCase().includes('craving') ? 
                'Type more to see related video suggestions' : 
                'Ask about videos or specific topics'}
            </div>
          )}
        </form>
      </div>
    </Card>
  );
};

export default SupportChat;