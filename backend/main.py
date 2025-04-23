from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import uuid
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from dotenv import load_dotenv
import re
import requests
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize the FastAPI app
app = FastAPI(title="No Smoke API", description="Backend API for No Smoke cessation app")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Set up Gemini API (will need an API key)
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

# Data file paths
DATA_DIR = "data"
USER_DATA_FILE = os.path.join(DATA_DIR, "users.json")
CHAT_DATA_FILE = os.path.join(DATA_DIR, "chats.json")

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize users data file if it doesn't exist
if not os.path.exists(USER_DATA_FILE):
    with open(USER_DATA_FILE, "w") as f:
        json.dump({"users": []}, f)

# Initialize chat data file if it doesn't exist
if not os.path.exists(CHAT_DATA_FILE):
    with open(CHAT_DATA_FILE, "w") as f:
        json.dump({"chats": []}, f)

# Models
class UserProfile(BaseModel):
    age: int
    cigarettesPerDay: int
    cigaretteType: str
    startDate: str

class WeeklyGoal(BaseModel):
    week: int
    dailyLimit: int
    strategies: List[str]
    tips: List[str]

class DailyLog(BaseModel):
    date: str
    cigarettesSmoked: int
    mood: str
    cravingIntensity: int
    notes: Optional[str] = None

class User(BaseModel):
    userId: str
    profile: UserProfile
    plan: Optional[Dict[str, List[WeeklyGoal]]] = None
    progress: Optional[Dict[str, List[DailyLog]]] = None

class UserInput(BaseModel):
    age: int
    cigarettesPerDay: int
    cigaretteType: str

class DailyLogInput(BaseModel):
    date: str
    cigarettesSmoked: int
    mood: str
    cravingIntensity: int
    notes: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatInput(BaseModel):
    message: str
    userId: str
    chatId: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    resources: Optional[List[Dict[str, str]]] = None
    videos: Optional[List[Dict[str, str]]] = None

# Helper functions
def load_users():
    with open(USER_DATA_FILE, "r") as f:
        return json.load(f)

def save_users(data):
    with open(USER_DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_user(user_id):
    data = load_users()
    for user in data["users"]:
        if user["userId"] == user_id:
            return user
    return None

def load_chats():
    with open(CHAT_DATA_FILE, "r") as f:
        return json.load(f)

def save_chats(data):
    with open(CHAT_DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def get_chat(chat_id):
    data = load_chats()
    for chat in data["chats"]:
        if chat["chatId"] == chat_id:
            return chat
    return None

# Function to extract YouTube video info from query
def search_youtube_videos(query, max_results=3):
    try:
        # In a production environment, you would use YouTube Data API
        # For now, we'll implement a more sophisticated mock function with keyword matching
        
        # Standardize query for comparison
        query_lower = query.lower()
        
        # Define categories of videos with relevant keywords
        categories = {
            "cravings": ["craving", "urge", "need", "want", "desperate", "help me", "can't control", "hard", "difficult"],
            "relapse": ["relapse", "fell back", "smoked again", "started smoking", "gave in", "failed"],
            "motivation": ["motivation", "encourage", "why quit", "benefits", "health", "inspire"],
            "techniques": ["technique", "method", "how to", "strategy", "ways to", "tips", "help"],
            "withdrawal": ["withdrawal", "symptom", "feeling", "anxiety", "irritable", "stress", "mood"],
            "success": ["success", "story", "testimony", "quit", "stopped", "free from"]
        }
        
        # Video database - organized by category
        video_database = {
            "cravings": [
                {
                    "title": "5 Quick Ways to Stop Cigarette Cravings",
                    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "channel": "Quit Smoking Tips",
                    "keywords": ["craving", "urge", "quick", "stop", "immediate relief"]
                },
                {
                    "title": "Understanding and Managing Nicotine Cravings",
                    "thumbnail": "https://i.ytimg.com/vi/e_FpIt3P2QM/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=e_FpIt3P2QM",
                    "channel": "Addiction Recovery",
                    "keywords": ["craving", "nicotine", "manage", "understand"]
                },
                {
                    "title": "Emergency Toolkit: When Cravings Strike Hard",
                    "thumbnail": "https://i.ytimg.com/vi/K9cLRBy4UQ8/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=K9cLRBy4UQ8",
                    "channel": "Ex-Smoker Support",
                    "keywords": ["emergency", "intense craving", "help", "strong urge", "toolkit"]
                },
            ],
            "relapse": [
                {
                    "title": "Recovering from a Smoking Relapse - Don't Give Up!",
                    "thumbnail": "https://i.ytimg.com/vi/cTWnKnRnVZ0/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=cTWnKnRnVZ0",
                    "channel": "Recovery Journey",
                    "keywords": ["relapse", "recovery", "don't give up", "bounce back"]
                },
                {
                    "title": "What to Do After a Smoking Setback",
                    "thumbnail": "https://i.ytimg.com/vi/oVYkfZsZ1dU/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=oVYkfZsZ1dU",
                    "channel": "Health Steps",
                    "keywords": ["setback", "relapse", "after", "next steps"]
                },
                {
                    "title": "Why Relapses Happen and How to Prevent Them",
                    "thumbnail": "https://i.ytimg.com/vi/P9z0MHBUYmQ/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=P9z0MHBUYmQ",
                    "channel": "Addiction Psychology",
                    "keywords": ["relapse", "prevention", "why", "happen", "cause"]
                }
            ],
            "motivation": [
                {
                    "title": "What Happens When You Stop Smoking - Timeline",
                    "thumbnail": "https://i.ytimg.com/vi/zGppUZUwX9s/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=zGppUZUwX9s",
                    "channel": "Medical Explanations",
                    "keywords": ["health", "benefits", "timeline", "body recovery"]
                },
                {
                    "title": "Ex-Smokers Share Their Life-Changing Success Stories",
                    "thumbnail": "https://i.ytimg.com/vi/kMz7QP2hRaY/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=kMz7QP2hRaY", 
                    "channel": "Inspiration Daily",
                    "keywords": ["success", "stories", "inspiration", "motivation", "testimonials"]
                },
                {
                    "title": "The Financial Benefits of Quitting Smoking",
                    "thumbnail": "https://i.ytimg.com/vi/KbFeWVj7KqI/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=KbFeWVj7KqI",
                    "channel": "Financial Health",
                    "keywords": ["money", "savings", "financial", "benefits", "calculator"]
                }
            ],
            "techniques": [
                {
                    "title": "Mindfulness Techniques to Fight Cigarette Cravings",
                    "thumbnail": "https://i.ytimg.com/vi/pBs4G2C8RLk/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=pBs4G2C8RLk",
                    "channel": "Mindful Recovery",
                    "keywords": ["mindfulness", "meditation", "techniques", "fight cravings"]
                },
                {
                    "title": "Breathing Exercises for Nicotine Withdrawal",
                    "thumbnail": "https://i.ytimg.com/vi/QcNzEDFDwAg/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=QcNzEDFDwAg",
                    "channel": "Wellness Practices",
                    "keywords": ["breathing", "exercises", "techniques", "withdrawal", "relief"]
                },
                {
                    "title": "The 4 D's Method to Quit Smoking",
                    "thumbnail": "https://i.ytimg.com/vi/zZleZpIo-h8/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=zZleZpIo-h8",
                    "channel": "Quit Coach",
                    "keywords": ["method", "techniques", "strategy", "delay", "distract"]
                }
            ],
            "withdrawal": [
                {
                    "title": "Managing Nicotine Withdrawal Symptoms",
                    "thumbnail": "https://i.ytimg.com/vi/J4dxV9K2t_Y/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=J4dxV9K2t_Y",
                    "channel": "Health Recovery",
                    "keywords": ["withdrawal", "symptoms", "nicotine", "manage", "cope"]
                },
                {
                    "title": "Natural Remedies for Smoking Withdrawal",
                    "thumbnail": "https://i.ytimg.com/vi/0gLr3N4Nlmk/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=0gLr3N4Nlmk",
                    "channel": "Natural Health",
                    "keywords": ["natural", "remedies", "withdrawal", "herbs", "supplements"]
                },
                {
                    "title": "Managing Anxiety and Irritability After Quitting",
                    "thumbnail": "https://i.ytimg.com/vi/r4Vz_CSxMJ8/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=r4Vz_CSxMJ8",
                    "channel": "Mental Wellness",
                    "keywords": ["anxiety", "irritability", "mood", "emotions", "mental health"]
                }
            ],
            "success": [
                {
                    "title": "How I Quit After 15 Years of Smoking",
                    "thumbnail": "https://i.ytimg.com/vi/JlI5uzB9gZA/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=JlI5uzB9gZA",
                    "channel": "Health & Wellness",
                    "keywords": ["success story", "quit", "personal", "journey", "long-term smoker"]
                },
                {
                    "title": "One Year Smoke-Free: The Changes In My Body",
                    "thumbnail": "https://i.ytimg.com/vi/SXc2pP8Fc8U/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=SXc2pP8Fc8U", 
                    "channel": "Health Transformations",
                    "keywords": ["success", "smoke-free", "body changes", "health improvements", "one year"]
                },
                {
                    "title": "Tips From Successfully Quit Smokers",
                    "thumbnail": "https://i.ytimg.com/vi/vMVz5yGc2zc/hqdefault.jpg",
                    "url": "https://www.youtube.com/watch?v=vMVz5yGc2zc",
                    "channel": "Quit Success",
                    "keywords": ["tips", "success", "advice", "ex-smokers", "quit", "former smokers"]
                }
            ]
        }
        
        # Match query with categories
        matched_categories = []
        for category, keywords in categories.items():
            for keyword in keywords:
                if keyword in query_lower:
                    matched_categories.append(category)
                    break
        
        # If no specific categories matched, include all
        if not matched_categories:
            matched_categories = list(categories.keys())
        
        # Get unique categories (no duplicates)
        matched_categories = list(set(matched_categories))
        
        # Collect videos from matched categories
        relevant_videos = []
        for category in matched_categories:
            relevant_videos.extend(video_database[category])
        
        # Score videos based on keyword relevance to query
        scored_videos = []
        for video in relevant_videos:
            score = 0
            # Check title keywords
            query_words = query_lower.split()
            title_lower = video["title"].lower()
            
            # Score based on title matches
            for word in query_words:
                if len(word) > 3 and word in title_lower:  # Only match meaningful words
                    score += 3
            
            # Score based on keyword matches
            for keyword in video["keywords"]:
                if keyword in query_lower:
                    score += 2
            
            # Add to scored list
            scored_videos.append((video, score))
        
        # Sort by relevance score (highest first)
        scored_videos.sort(key=lambda x: x[1], reverse=True)
        
        # Return top videos (remove score)
        top_videos = [video for video, _ in scored_videos[:max_results]]
        
        # If we still don't have enough videos, add some general ones
        if len(top_videos) < max_results:
            import random
            all_videos = []
            for category_videos in video_database.values():
                all_videos.extend(category_videos)
                
            random.shuffle(all_videos)
            
            # Add random videos until we reach max_results
            for video in all_videos:
                if video not in top_videos:
                    top_videos.append(video)
                if len(top_videos) >= max_results:
                    break
                    
        return top_videos
            
    except Exception as e:
        logger.error(f"Error searching YouTube videos: {e}")
        return []

# Generate a plan using Gemini
async def generate_plan(user_info: UserInput):
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        Create an 8-week smoking cessation plan for:
        - Age: {user_info.age}
        - Current cigarettes per day: {user_info.cigarettesPerDay}
        - Cigarette type: {user_info.cigaretteType}
        
        For each week, include:
        1. Daily cigarette limit for that week (as an integer number)
        2. 3-5 practical strategies to help meet that goal
        3. 2-3 motivational tips
        
        Your response must be JSON formatted exactly like this example:
        {{
          "weeklyGoals": [
            {{
              "week": 1,
              "dailyLimit": 10,
              "strategies": [
                "Strategy 1: detailed description",
                "Strategy 2: detailed description",
                "Strategy 3: detailed description"
              ],
              "tips": [
                "Tip 1: detailed description",
                "Tip 2: detailed description"
              ]
            }},
            ... and so on for all 8 weeks
          ]
        }}
        
        Make sure to create a personalized plan with gradual reduction based on the user's information.
        """
        
        response = model.generate_content(prompt)
        text_response = response.text
        
        try:
            json_match = re.search(r'(\{.*\})', text_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                plan_data = json.loads(json_str)
                return plan_data
            else:
                raise ValueError("Could not find JSON in response")
                
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from Gemini: {e}")
            print(f"Raw response: {text_response}")
            raise
            
    except Exception as e:
        print(f"Error generating plan with Gemini API: {e}")
        weeks = []
        initial_cigarettes = user_info.cigarettesPerDay
        
        for week in range(1, 9):
            reduction = initial_cigarettes * (week * 0.125)
            daily_limit = max(0, round(initial_cigarettes - reduction))
            
            strategies = []
            if week == 1:
                strategies.append(f"Start by delaying your first cigarette of the day by 30 minutes")
            else:
                strategies.append(f"Delay your first cigarette by {week * 30} minutes")
                
            if user_info.cigaretteType.lower() in ["menthol", "flavored"]:
                strategies.append("Try switching to unflavored cigarettes this week to reduce appeal")
            
            strategies.extend([
                f"Identify your top {week} triggers and create an avoidance plan",
                "Practice 5-minute deep breathing when cravings hit",
                f"Find {week} smoke-free activities to replace smoking moments"
            ])
            
            tips = []
            if user_info.age < 30:
                tips.append("Calculate how much money you'll save this month and plan a reward")
            elif user_info.age < 50:
                tips.append("Consider how quitting now can significantly improve your long-term health")
            else:
                tips.append("Remember it's never too late to quit and see health improvements")
                
            tips.append("Track your progress daily and celebrate small victories")
            
            weeks.append({
                "week": week,
                "dailyLimit": daily_limit,
                "strategies": strategies,
                "tips": tips
            })
        
        return {"weeklyGoals": weeks}

# Chat with user about relapse and other topics using Gemini
async def chat_with_user(user_id: str, message: str, chat_history=None):
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        user = get_user(user_id)
        user_context = ""
        
        if user:
            user_context = f"""
            User information:
            - Age: {user['profile']['age']}
            - Cigarettes per day initially: {user['profile']['cigarettesPerDay']}
            - Cigarette type: {user['profile']['cigaretteType']}
            - Start date of cessation plan: {user['profile']['startDate']}
            """
        
        suggest_videos = False
        if any(keyword in message.lower() for keyword in ["video", "youtube", "watch", "cant control", "craving", "help me", "hard to resist"]):
            suggest_videos = True
        
        prompt = f"""
        You are an AI assistant for a smoking cessation app called Cleanslate. Your role is to help users who are trying to quit smoking.
        
        {user_context}
        
        Current user message: "{message}"
        
        If the user is talking about a relapse, be supportive and encouraging. Don't judge them, but help them get back on track.
        If they're experiencing cravings, suggest practical techniques to overcome them.
        Answer any questions about smoking, nicotine addiction, or health in a factual but supportive way.
        Keep responses concise (under 150 words), supportive, and actionable.
        
        If the user is asking about videos or resources, or mentions strong cravings, suggest that they might find videos helpful.
        
        Don't mention that you're an AI unless specifically asked.
        """
        
        if chat_history and len(chat_history) > 0:
            recent_history = chat_history[-5:] if len(chat_history) > 5 else chat_history
            history_text = "\n".join([f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}" for msg in recent_history])
            prompt = f"{prompt}\n\nRecent conversation history:\n{history_text}"
        
        response = model.generate_content(prompt)
        text_response = response.text
        
        videos = []
        if suggest_videos:
            videos = search_youtube_videos(message)
        
        resources = []
        if "quit" in message.lower() or "stop smoking" in message.lower():
            resources = [
                {
                    "title": "CDC - How to Quit Smoking",
                    "url": "https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/"
                },
                {
                    "title": "Smokefree.gov - Build Your Quit Plan",
                    "url": "https://smokefree.gov/build-your-quit-plan"
                }
            ]
        elif "relapse" in message.lower():
            resources = [
                {
                    "title": "Managing Smoking Relapse",
                    "url": "https://www.cancer.org/cancer/risk-prevention/tobacco/guide-quitting-smoking/dealing-with-relapse.html"
                }
            ]
            
        return {
            "message": text_response,
            "videos": videos if videos else None,
            "resources": resources if resources else None
        }
            
    except Exception as e:
        logger.error(f"Error generating chat response with Gemini API: {e}")
        return {
            "message": "I'm having trouble connecting right now. If you're experiencing a craving, try taking deep breaths for 2 minutes, drinking a glass of water, or going for a short walk to distract yourself. I'll be here when you get back.",
            "videos": None,
            "resources": None
        }

@app.get("/")
async def root():
    return {"message": "Welcome to the Cleanslate API"}

@app.post("/users")
async def create_user(user_input: UserInput):
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    new_user = {
        "userId": str(uuid.uuid4()),
        "profile": {
            "age": user_input.age,
            "cigarettesPerDay": user_input.cigarettesPerDay,
            "cigaretteType": user_input.cigaretteType,
            "startDate": current_date
        },
        "plan": None,
        "progress": {
            "dailyLogs": []
        }
    }
    
    data = load_users()
    data["users"].append(new_user)
    save_users(data)
    
    return {"userId": new_user["userId"], "message": "User created successfully"}

@app.post("/users/{user_id}/plan")
async def create_plan(user_id: str, user_input: UserInput):
    logger.info(f"Generating plan for user {user_id} with data: {user_input}")
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    plan = await generate_plan(user_input)
    logger.info(f"Generated plan structure: {list(plan.keys())}")
    
    data = load_users()
    for i, u in enumerate(data["users"]):
        if u["userId"] == user_id:
            data["users"][i]["plan"] = plan
            break
    
    save_users(data)
    
    return plan

@app.get("/users/{user_id}/plan")
async def get_plan(user_id: str):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.get("plan"):
        raise HTTPException(status_code=404, detail="No plan found for this user")
    
    return user["plan"]

@app.post("/users/{user_id}/logs")
async def add_log(user_id: str, log_input: DailyLogInput):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_log = {
        "date": log_input.date,
        "cigarettesSmoked": log_input.cigarettesSmoked,
        "mood": log_input.mood,
        "cravingIntensity": log_input.cravingIntensity,
        "notes": log_input.notes
    }
    
    data = load_users()
    for i, u in enumerate(data["users"]):
        if u["userId"] == user_id:
            if "progress" not in data["users"][i]:
                data["users"][i]["progress"] = {"dailyLogs": []}
            elif "dailyLogs" not in data["users"][i]["progress"]:
                data["users"][i]["progress"]["dailyLogs"] = []
            
            data["users"][i]["progress"]["dailyLogs"].append(new_log)
            break
    
    save_users(data)
    
    return {"message": "Log added successfully"}

@app.get("/users/{user_id}/logs")
async def get_logs(user_id: str):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.get("progress") or not user["progress"].get("dailyLogs"):
        return {"dailyLogs": []}
    
    return {"dailyLogs": user["progress"]["dailyLogs"]}

@app.get("/users/{user_id}")
async def get_user_info(user_id: str):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@app.post("/chat")
async def chat(chat_input: ChatInput):
    user_id = chat_input.userId
    message = chat_input.message
    chat_id = chat_input.chatId
    
    if not chat_id:
        chat_id = str(uuid.uuid4())
        new_chat = {
            "chatId": chat_id,
            "userId": user_id,
            "messages": []
        }
        chats = load_chats()
        chats["chats"].append(new_chat)
        save_chats(chats)
    
    chat_data = get_chat(chat_id)
    if not chat_data:
        chat_data = {"chatId": chat_id, "userId": user_id, "messages": []}
        chats = load_chats()
        chats["chats"].append(chat_data)
        save_chats(chats)
    
    chat_data["messages"].append({
        "role": "user",
        "content": message,
        "timestamp": str(datetime.now().isoformat())
    })
    
    response = await chat_with_user(user_id, message, chat_data["messages"])
    
    chat_data["messages"].append({
        "role": "assistant",
        "content": response["message"],
        "timestamp": str(datetime.now().isoformat())
    })
    
    chats = load_chats()
    for i, chat in enumerate(chats["chats"]):
        if chat["chatId"] == chat_id:
            chats["chats"][i] = chat_data
            break
    else:
        chats["chats"].append(chat_data)
    
    save_chats(chats)
    
    return {
        "chatId": chat_id,
        "message": response["message"],
        "videos": response["videos"],
        "resources": response["resources"]
    }

@app.get("/chat/{chat_id}")
async def get_chat_history(chat_id: str):
    chat = get_chat(chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    return chat

@app.get("/users/{user_id}/chats")
async def get_user_chats(user_id: str):
    chats = load_chats()
    user_chats = [chat for chat in chats["chats"] if chat["userId"] == user_id]
    
    return {"chats": user_chats}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)