import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

type Question = {
  id: string;
  text: string;
  responseType: 'age' | 'number' | 'select';
  options?: string[];
};

type UserAnswers = {
  age: number;
  cigarettesPerDay: number;
  cigaretteType: string;
};

const QUESTIONS: Question[] = [
  {
    id: 'age',
    text: 'How old are you?',
    responseType: 'age',
  },
  {
    id: 'cigarettesPerDay',
    text: 'How many cigarettes do you smoke per day?',
    responseType: 'number',
  },
  {
    id: 'cigaretteType',
    text: 'What type of cigarettes do you prefer?',
    responseType: 'select',
    options: ['Light', 'Regular', 'Menthol', 'Strong'],
  },
];

interface ChatBotProps {
  onComplete: (userData: UserAnswers) => void;
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ onComplete, className = '' }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({ age: 0, cigarettesPerDay: 0, cigaretteType: '' });
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'bot' | 'user', text: string }>>([
    { type: 'bot', text: "Hi there! 👋 I'm your personal quit smoking assistant. Let me help you create a personalized 8-week plan to quit smoking." },
    { type: 'bot', text: "Let's start with a few questions about your smoking habits." },
    { type: 'bot', text: "How old are you?" }
  ]);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const allQuestionsAnswered = answers.age > 0 && answers.cigarettesPerDay > 0 && answers.cigaretteType !== '';

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus input field when questions change
  useEffect(() => {
    if (inputRef.current && !isLastQuestion) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentQuestionIndex, isLastQuestion]);

  const simulateTyping = (callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1000); // Slightly longer typing delay for more realism
  };

  const handleAnswer = (answer: string | number) => {
    // Add user's answer to chat history
    setChatHistory([...chatHistory, { type: 'user', text: String(answer) }]);
    setInputValue('');
    
    // Update answers state with proper typing
    setAnswers(prev => {
      if (currentQuestion.id === 'age') {
        return { ...prev, age: Number(answer) };
      } else if (currentQuestion.id === 'cigarettesPerDay') {
        return { ...prev, cigarettesPerDay: Number(answer) };
      } else if (currentQuestion.id === 'cigaretteType') {
        return { ...prev, cigaretteType: String(answer) };
      }
      return prev;
    });
    
    // If not the last question, show the next question
    if (!isLastQuestion) {
      simulateTyping(() => {
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: QUESTIONS[currentQuestionIndex + 1].text 
        }]);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      });
    } else {
      simulateTyping(() => {
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: "Great! Now I have all the information I need to create your personalized plan. Click the button below whenever you're ready!" 
        }]);
      });
    }
  };

  const handleAgeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const age = Number(formData.get('age'));
    if (age > 0) {
      handleAnswer(age);
    }
  };

  const handleCigarettesSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const count = Number(formData.get('count'));
    if (count >= 0) {
      handleAnswer(count);
    }
  };

  const generatePlan = () => {
    setIsSubmitting(true);
    
    setChatHistory(prev => [...prev, { 
      type: 'bot', 
      text: "I'm using Gemini AI to create your personalized 8-week cessation plan based on your specific information. This will include weekly goals, personalized strategies, and motivational tips just for you..." 
    }]);
    
    setTimeout(() => {
      onComplete(answers);
    }, 1000);
  };

  const renderResponseInput = () => {
    if (isLastQuestion && allQuestionsAnswered) {
      return null;
    }

    switch (currentQuestion?.responseType) {
      case 'age':
        return (
          <form onSubmit={handleAgeSubmit} className="flex gap-2 items-center w-full">
            <input
              type="number"
              name="age"
              min="18"
              max="120"
              placeholder="Enter your age"
              className="flex-1 p-3 border border-pru rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              required
              autoFocus
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button type="submit" variant="primary" className="px-6">
              <span className="mr-1">Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </Button>
          </form>
        );
      
      case 'number':
        return (
          <form onSubmit={handleCigarettesSubmit} className="flex gap-2 items-center w-full">
            <input
              type="number"
              name="count"
              min="1"
              placeholder="Number of cigarettes"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              required
              autoFocus
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Button type="submit" variant="primary" className="px-6">
              <span className="mr-1">Send</span> <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </Button>
          </form>
        );
      
      case 'select':
        return (
          <div className="grid grid-cols-2 gap-3 w-full">
            {currentQuestion.options?.map((option) => (
              <Button 
                key={option} 
                variant="primary" 
                onClick={() => handleAnswer(option)}
                className="py-3 hover:bg-primary/20 transition-colors"
              >
                {option}
              </Button>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={`flex flex-col h-[600px] bg-white shadow-xl border-0 rounded-xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center">
        <div>
          <h3 className="font-bold">Cleanslate Assistant</h3>
          <p className="text-xs">Online | Powered by AI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'bot' && (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <span className="text-sm">🚭</span>
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-primary text-gray-800 rounded-tr-none shadow-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
              }`}
            >
              {message.text}
            </div>
            {message.type === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
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
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4 bg-white">
        {allQuestionsAnswered && isLastQuestion ? (
          <Button 
            fullWidth 
            onClick={generatePlan} 
            size="lg"
            isLoading={isSubmitting}
            className="py-4 shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-primary to-secondary"
          >
            <span className="mr-2">Generate My 8-Week Plan</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </Button>
        ) : (
          renderResponseInput()
        )}
      </div>
    </Card>
  );
};

export default ChatBot;