const API_URL = 'http://127.0.0.1:8000';

export interface UserProfile {
  age: number;
  cigarettesPerDay: number;
  cigaretteType: string;
  startDate: string;
}

export interface WeeklyGoal {
  week: number;
  dailyLimit: number;
  strategies: string[];
  tips: string[];
}

export interface CessationPlan {
  weeklyGoals: WeeklyGoal[];
}

export interface DailyLog {
  date: string;
  cigarettesSmoked: number;
  mood: string;
  cravingIntensity: number;
  notes?: string;
}

export interface User {
  userId: string;
  profile: UserProfile;
  plan?: {
    weeklyGoals: WeeklyGoal[];
  };
  progress?: {
    dailyLogs: DailyLog[];
  };
}

export interface UserInput {
  age: number;
  cigarettesPerDay: number;
  cigaretteType: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface VideoResource {
  title: string;
  thumbnail: string;
  url: string;
  channel: string;
}

export interface WebResource {
  title: string;
  url: string;
}

export interface ChatResponse {
  chatId: string;
  message: string;
  videos?: VideoResource[];
  resources?: WebResource[];
}

const api = {
  /**
   * Create a new user with the given profile data
   */
  createUser: async (userData: UserInput): Promise<{ userId: string }> => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return response.json();
  },

  /**
   * Generate a cessation plan for the user
   */
  generatePlan: async (userId: string, userData: UserInput): Promise<CessationPlan> => {
    const response = await fetch(`${API_URL}/users/${userId}/plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error('Failed to generate plan:', await response.text());
      throw new Error('Failed to generate plan');
    }

    const data = await response.json();
    console.log('Plan response from backend:', data); // For debugging
    
    // Return the plan directly if it already has the right structure
    // otherwise return the whole response (plan might be the entire response)
    return data.plan || data;
  },

  /**
   * Get a user's cessation plan
   */
  getPlan: async (userId: string): Promise<CessationPlan> => {
    const response = await fetch(`${API_URL}/users/${userId}/plan`);

    if (!response.ok) {
      throw new Error('Failed to get plan');
    }

    return response.json();
  },

  /**
   * Add a daily log for the user
   */
  addDailyLog: async (userId: string, logData: Omit<DailyLog, 'id'>): Promise<void> => {
    const response = await fetch(`${API_URL}/users/${userId}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      throw new Error('Failed to add log');
    }
  },

  /**
   * Get all daily logs for a user
   */
  getDailyLogs: async (userId: string): Promise<DailyLog[]> => {
    const response = await fetch(`${API_URL}/users/${userId}/logs`);

    if (!response.ok) {
      throw new Error('Failed to get logs');
    }

    const data = await response.json();
    return data.dailyLogs;
  },

  /**
   * Get user information
   */
  getUser: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to get user information');
    }

    return response.json();
  },

  /**
   * Send a message to the chat assistant
   */
  sendChatMessage: async (userId: string, message: string, chatId?: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        message,
        chatId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  },

  /**
   * Get chat history for a specific chat
   */
  getChatHistory: async (chatId: string): Promise<{messages: ChatMessage[]}> => {
    const response = await fetch(`${API_URL}/chat/${chatId}`);

    if (!response.ok) {
      throw new Error('Failed to get chat history');
    }

    return response.json();
  },

  /**
   * Get all chats for a user
   */
  getUserChats: async (userId: string): Promise<{chats: Array<{chatId: string, userId: string, messages: ChatMessage[]}>}> => {
    const response = await fetch(`${API_URL}/users/${userId}/chats`);

    if (!response.ok) {
      throw new Error('Failed to get user chats');
    }

    return response.json();
  },
};

export default api;