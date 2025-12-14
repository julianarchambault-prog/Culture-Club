from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, Cookie
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    bio: Optional[str] = None
    is_premium: bool = False
    is_admin: bool = False
    subscription_tier: str = "free"
    subscription_status: str = "inactive"
    subscription_expires_at: Optional[datetime] = None
    paypal_subscription_id: Optional[str] = None
    posts_this_month: int = 0
    post_count_reset_date: Optional[datetime] = None
    fcm_token: Optional[str] = None
    notifications_enabled: bool = True
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    project_id: str
    user_id: str
    name: str
    fermentation_type: str
    start_date: datetime
    estimated_duration: int
    notes: Optional[str] = None
    photos: List[str] = []
    status: str = "active"
    created_at: datetime
    updated_at: datetime

class Reminder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    reminder_id: str
    project_id: str
    user_id: str
    reminder_type: str
    scheduled_time: datetime
    is_completed: bool = False
    created_at: datetime

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    post_id: str
    user_id: str
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    youtube_url: Optional[str] = None
    tags: List[str] = []
    likes_count: int = 0
    comments_count: int = 0
    created_at: datetime
    updated_at: datetime

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    comment_id: str
    post_id: str
    user_id: str
    content: str
    created_at: datetime

class Like(BaseModel):
    model_config = ConfigDict(extra="ignore")
    like_id: str
    post_id: str
    user_id: str
    created_at: datetime

class Recipe(BaseModel):
    model_config = ConfigDict(extra="ignore")
    recipe_id: str
    user_id: str
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    recipe_type: str
    tags: List[str] = []
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> Dict:
    token = session_token
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_doc

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")
    
    try:
        auth_response = requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        auth_response.raise_for_status()
        data = auth_response.json()
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    user_doc = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_data = {
            "user_id": user_id,
            "email": data["email"],
            "name": data.get("name", ""),
            "picture": data.get("picture"),
            "bio": None,
            "is_premium": False,
            "subscription_tier": "free",
            "subscription_status": "inactive",
            "subscription_expires_at": None,
            "paypal_subscription_id": None,
            "posts_this_month": 0,
            "post_count_reset_date": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_data)
        user_doc = user_data
    else:
        await db.users.update_one(
            {"email": data["email"]},
            {"$set": {
                "name": data.get("name", user_doc.get("name")),
                "picture": data.get("picture", user_doc.get("picture"))
            }}
        )
        user_doc = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_data = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.update_one(
        {"user_id": user_doc["user_id"]},
        {"$set": session_data},
        upsert=True
    )
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"user": user_doc}

@api_router.get("/auth/me")
async def get_me(user: Dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user: Dict = Depends(get_current_user)):
    await db.user_sessions.delete_one({"user_id": user["user_id"]})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.post("/auth/demo-login")
async def demo_login(response: Response):
    demo_user_id = "test_user_12345"
    
    user_doc = await db.users.find_one({"user_id": demo_user_id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Demo user not found")
    
    session_token = f"demo_session_{uuid.uuid4().hex[:12]}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_data = {
        "user_id": demo_user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.update_one(
        {"user_id": demo_user_id},
        {"$set": session_data},
        upsert=True
    )
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=False,
        secure=False,
        samesite="lax",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"user": user_doc, "message": "Demo login successful"}

@api_router.post("/subscription/demo-upgrade")
async def demo_upgrade(user: Dict = Depends(get_current_user)):
    """Demo endpoint to test premium features without PayPal"""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "subscription_tier": "premium",
            "subscription_status": "active",
            "subscription_expires_at": expires_at.isoformat(),
            "paypal_subscription_id": f"demo_{uuid.uuid4().hex[:12]}",
            "is_premium": True
        }}
    )
    
    return {"message": "Demo upgrade successful", "expires_at": expires_at.isoformat()}

def check_subscription(user: Dict) -> Dict:
    """Check if user has active premium subscription or is admin"""
    # Admin users bypass all checks
    is_admin = user.get("is_admin", False)
    if is_admin:
        return {
            "is_premium": True,
            "is_admin": True,
            "tier": "admin",
            "status": "active"
        }
    
    is_premium = user.get("subscription_tier") == "premium" and user.get("subscription_status") == "active"
    if is_premium and user.get("subscription_expires_at"):
        expires_at = user["subscription_expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            is_premium = False
    return {
        "is_premium": is_premium,
        "is_admin": False,
        "tier": user.get("subscription_tier", "free"),
        "status": user.get("subscription_status", "inactive")
    }

@api_router.get("/projects")
async def get_projects(user: Dict = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    for project in projects:
        if isinstance(project.get("start_date"), str):
            project["start_date"] = datetime.fromisoformat(project["start_date"])
        if isinstance(project.get("created_at"), str):
            project["created_at"] = datetime.fromisoformat(project["created_at"])
        if isinstance(project.get("updated_at"), str):
            project["updated_at"] = datetime.fromisoformat(project["updated_at"])
    return projects

@api_router.post("/projects")
async def create_project(project_data: Dict, user: Dict = Depends(get_current_user)):
    subscription = check_subscription(user)
    
    if not subscription["is_premium"]:
        project_count = await db.projects.count_documents({"user_id": user["user_id"], "status": "active"})
        if project_count >= 3:
            raise HTTPException(status_code=403, detail="Free tier limited to 3 active projects. Upgrade to premium for unlimited projects.")
    
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    project = {
        "project_id": project_id,
        "user_id": user["user_id"],
        "name": project_data["name"],
        "fermentation_type": project_data["fermentation_type"],
        "start_date": datetime.fromisoformat(project_data["start_date"]).isoformat() if isinstance(project_data["start_date"], str) else now.isoformat(),
        "estimated_duration": project_data.get("estimated_duration", 7),
        "notes": project_data.get("notes", ""),
        "photos": project_data.get("photos", []),
        "status": "active",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.projects.insert_one(project)
    return project

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: Dict = Depends(get_current_user)):
    project = await db.projects.find_one({"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project.get("start_date"), str):
        project["start_date"] = datetime.fromisoformat(project["start_date"])
    if isinstance(project.get("created_at"), str):
        project["created_at"] = datetime.fromisoformat(project["created_at"])
    if isinstance(project.get("updated_at"), str):
        project["updated_at"] = datetime.fromisoformat(project["updated_at"])
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, project_data: Dict, user: Dict = Depends(get_current_user)):
    existing = await db.projects.find_one({"project_id": project_id, "user_id": user["user_id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    if "name" in project_data:
        update_data["name"] = project_data["name"]
    if "notes" in project_data:
        update_data["notes"] = project_data["notes"]
    if "status" in project_data:
        update_data["status"] = project_data["status"]
    if "photos" in project_data:
        update_data["photos"] = project_data["photos"]
    
    await db.projects.update_one({"project_id": project_id}, {"$set": update_data})
    return {"message": "Project updated"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: Dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"project_id": project_id, "user_id": user["user_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.reminders.delete_many({"project_id": project_id})
    return {"message": "Project deleted"}

@api_router.get("/reminders")
async def get_reminders(user: Dict = Depends(get_current_user), project_id: Optional[str] = None):
    query = {"user_id": user["user_id"]}
    if project_id:
        query["project_id"] = project_id
    reminders = await db.reminders.find(query, {"_id": 0}).sort("scheduled_time", 1).to_list(100)
    for reminder in reminders:
        if isinstance(reminder.get("scheduled_time"), str):
            reminder["scheduled_time"] = datetime.fromisoformat(reminder["scheduled_time"])
        if isinstance(reminder.get("created_at"), str):
            reminder["created_at"] = datetime.fromisoformat(reminder["created_at"])
    return reminders

@api_router.post("/reminders")
async def create_reminder(reminder_data: Dict, user: Dict = Depends(get_current_user)):
    subscription = check_subscription(user)
    
    if not subscription["is_premium"]:
        raise HTTPException(status_code=403, detail="Smart reminders are a premium feature. Upgrade to get notifications for your fermentation projects.")
    
    reminder_id = f"rem_{uuid.uuid4().hex[:12]}"
    reminder = {
        "reminder_id": reminder_id,
        "project_id": reminder_data["project_id"],
        "user_id": user["user_id"],
        "reminder_type": reminder_data["reminder_type"],
        "scheduled_time": datetime.fromisoformat(reminder_data["scheduled_time"]).isoformat() if isinstance(reminder_data["scheduled_time"], str) else datetime.now(timezone.utc).isoformat(),
        "is_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reminders.insert_one(reminder)
    return reminder

@api_router.put("/reminders/{reminder_id}")
async def update_reminder(reminder_id: str, reminder_data: Dict, user: Dict = Depends(get_current_user)):
    result = await db.reminders.update_one(
        {"reminder_id": reminder_id, "user_id": user["user_id"]},
        {"$set": reminder_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Reminder updated"}

@api_router.get("/feed")
async def get_feed(user: Dict = Depends(get_current_user), skip: int = 0, limit: int = 20):
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for post in posts:
        if isinstance(post.get("created_at"), str):
            post["created_at"] = datetime.fromisoformat(post["created_at"])
        if isinstance(post.get("updated_at"), str):
            post["updated_at"] = datetime.fromisoformat(post["updated_at"])
        post_user = await db.users.find_one({"user_id": post["user_id"]}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1})
        post["user"] = post_user
        post["is_liked"] = await db.likes.find_one({"post_id": post["post_id"], "user_id": user["user_id"]}) is not None
    return posts

@api_router.post("/posts")
async def create_post(post_data: Dict, user: Dict = Depends(get_current_user)):
    subscription = check_subscription(user)
    
    if not subscription["is_premium"]:
        now = datetime.now(timezone.utc)
        reset_date = user.get("post_count_reset_date")
        if reset_date:
            if isinstance(reset_date, str):
                reset_date = datetime.fromisoformat(reset_date)
            if reset_date.tzinfo is None:
                reset_date = reset_date.replace(tzinfo=timezone.utc)
        
        if not reset_date or (now - reset_date).days >= 30:
            await db.users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"posts_this_month": 0, "post_count_reset_date": now.isoformat()}}
            )
            posts_this_month = 0
        else:
            posts_this_month = user.get("posts_this_month", 0)
        
        if posts_this_month >= 2:
            raise HTTPException(status_code=403, detail="Free tier limited to 2 posts per month. Upgrade to premium for unlimited posts.")
        
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$inc": {"posts_this_month": 1}}
        )
    
    post_id = f"post_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    post = {
        "post_id": post_id,
        "user_id": user["user_id"],
        "content": post_data["content"],
        "media_url": post_data.get("media_url"),
        "media_type": post_data.get("media_type"),
        "youtube_url": post_data.get("youtube_url"),
        "tags": post_data.get("tags", []),
        "likes_count": 0,
        "comments_count": 0,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.posts.insert_one(post)
    return post

@api_router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str, user: Dict = Depends(get_current_user)):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    for comment in comments:
        if isinstance(comment.get("created_at"), str):
            comment["created_at"] = datetime.fromisoformat(comment["created_at"])
        comment_user = await db.users.find_one({"user_id": comment["user_id"]}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1})
        comment["user"] = comment_user
    return comments

@api_router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment_data: Dict, user: Dict = Depends(get_current_user)):
    comment_id = f"comm_{uuid.uuid4().hex[:12]}"
    comment = {
        "comment_id": comment_id,
        "post_id": post_id,
        "user_id": user["user_id"],
        "content": comment_data["content"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.comments.insert_one(comment)
    await db.posts.update_one({"post_id": post_id}, {"$inc": {"comments_count": 1}})
    return comment

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, user: Dict = Depends(get_current_user)):
    existing = await db.likes.find_one({"post_id": post_id, "user_id": user["user_id"]})
    if existing:
        await db.likes.delete_one({"post_id": post_id, "user_id": user["user_id"]})
        await db.posts.update_one({"post_id": post_id}, {"$inc": {"likes_count": -1}})
        return {"liked": False}
    else:
        like_id = f"like_{uuid.uuid4().hex[:12]}"
        like = {
            "like_id": like_id,
            "post_id": post_id,
            "user_id": user["user_id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.likes.insert_one(like)
        await db.posts.update_one({"post_id": post_id}, {"$inc": {"likes_count": 1}})
        return {"liked": True}

@api_router.get("/recipes")
async def get_recipes(skip: int = 0, limit: int = 20):
    recipes = await db.recipes.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    for recipe in recipes:
        if isinstance(recipe.get("created_at"), str):
            recipe["created_at"] = datetime.fromisoformat(recipe["created_at"])
        if isinstance(recipe.get("updated_at"), str):
            recipe["updated_at"] = datetime.fromisoformat(recipe["updated_at"])
        recipe_user = await db.users.find_one({"user_id": recipe["user_id"]}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1})
        recipe["user"] = recipe_user
    return recipes

@api_router.post("/recipes")
async def create_recipe(recipe_data: Dict, user: Dict = Depends(get_current_user)):
    subscription = check_subscription(user)
    
    if not subscription["is_premium"]:
        raise HTTPException(status_code=403, detail="Recipe submission is a premium feature. Upgrade to submit your own recipes.")
    
    recipe_id = f"recipe_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    recipe = {
        "recipe_id": recipe_id,
        "user_id": user["user_id"],
        "title": recipe_data["title"],
        "description": recipe_data["description"],
        "ingredients": recipe_data["ingredients"],
        "instructions": recipe_data["instructions"],
        "recipe_type": recipe_data["recipe_type"],
        "tags": recipe_data.get("tags", []),
        "photo_url": recipe_data.get("photo_url"),
        "is_premium": True,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    await db.recipes.insert_one(recipe)
    return recipe

@api_router.get("/recipes/{recipe_id}")
async def get_recipe(recipe_id: str):
    recipe = await db.recipes.find_one({"recipe_id": recipe_id}, {"_id": 0})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    if isinstance(recipe.get("created_at"), str):
        recipe["created_at"] = datetime.fromisoformat(recipe["created_at"])
    if isinstance(recipe.get("updated_at"), str):
        recipe["updated_at"] = datetime.fromisoformat(recipe["updated_at"])
    recipe_user = await db.users.find_one({"user_id": recipe["user_id"]}, {"_id": 0, "user_id": 1, "name": 1, "picture": 1})
    recipe["user"] = recipe_user
    return recipe

@api_router.get("/users/{user_id}")
async def get_user_profile(user_id: str):
    user_profile = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    projects_count = await db.projects.count_documents({"user_id": user_id})
    posts_count = await db.posts.count_documents({"user_id": user_id})
    recipes_count = await db.recipes.count_documents({"user_id": user_id})
    
    user_profile["stats"] = {
        "projects": projects_count,
        "posts": posts_count,
        "recipes": recipes_count
    }
    
    return user_profile

@api_router.put("/users/profile")
async def update_profile(profile_data: Dict, user: Dict = Depends(get_current_user)):
    update_data = {}
    if "name" in profile_data:
        update_data["name"] = profile_data["name"]
    if "bio" in profile_data:
        update_data["bio"] = profile_data["bio"]
    if "picture" in profile_data:
        update_data["picture"] = profile_data["picture"]
    
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    return {"message": "Profile updated"}

@api_router.get("/subscription/status")
async def get_subscription_status(user: Dict = Depends(get_current_user)):
    subscription = check_subscription(user)
    return {
        "is_premium": subscription["is_premium"],
        "is_admin": subscription.get("is_admin", False),
        "tier": subscription["tier"],
        "status": subscription["status"],
        "expires_at": user.get("subscription_expires_at"),
        "posts_remaining": 2 - user.get("posts_this_month", 0) if not subscription["is_premium"] else None,
        "active_projects": await db.projects.count_documents({"user_id": user["user_id"], "status": "active"}),
        "project_limit": None if subscription["is_premium"] else 3
    }

@api_router.post("/subscription/create")
async def create_subscription(subscription_data: Dict, user: Dict = Depends(get_current_user)):
    paypal_subscription_id = subscription_data.get("subscription_id")
    order_id = subscription_data.get("order_id")
    
    if not paypal_subscription_id and not order_id:
        raise HTTPException(status_code=400, detail="PayPal subscription ID or order ID required")
    
    # TODO: Verify subscription with PayPal API
    # For now, we trust the frontend (in production, MUST verify with PayPal)
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=30)
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "subscription_tier": "premium",
            "subscription_status": "active",
            "subscription_expires_at": expires_at.isoformat(),
            "paypal_subscription_id": paypal_subscription_id or order_id,
            "is_premium": True
        }}
    )
    
    return {"message": "Subscription activated", "expires_at": expires_at.isoformat()}

@api_router.post("/webhooks/paypal")
async def paypal_webhook(request: Request):
    """Handle PayPal webhook events for subscription updates"""
    body = await request.json()
    event_type = body.get("event_type")
    
    # TODO: Verify webhook signature with PayPal
    
    if event_type == "BILLING.SUBSCRIPTION.ACTIVATED":
        subscription_id = body.get("resource", {}).get("id")
        # Update user subscription status
        await db.users.update_one(
            {"paypal_subscription_id": subscription_id},
            {"$set": {"subscription_status": "active"}}
        )
    elif event_type == "BILLING.SUBSCRIPTION.CANCELLED":
        subscription_id = body.get("resource", {}).get("id")
        await db.users.update_one(
            {"paypal_subscription_id": subscription_id},
            {"$set": {"subscription_status": "cancelled"}}
        )
    elif event_type == "BILLING.SUBSCRIPTION.EXPIRED":
        subscription_id = body.get("resource", {}).get("id")
        await db.users.update_one(
            {"paypal_subscription_id": subscription_id},
            {"$set": {
                "subscription_status": "inactive",
                "subscription_tier": "free",
                "is_premium": False
            }}
        )
    
    return {"status": "success"}

@api_router.post("/subscription/cancel")
async def cancel_subscription(user: Dict = Depends(get_current_user)):
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "subscription_status": "cancelled"
        }}
    )
    
    return {"message": "Subscription cancelled. Access continues until expiration date."}

@api_router.get("/analytics")
async def get_analytics(user: Dict = Depends(get_current_user)):
    subscription = check_subscription(user)
    
    if not subscription["is_premium"]:
        raise HTTPException(status_code=403, detail="Analytics dashboard is a premium feature. Upgrade to access insights.")
    
    projects = await db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    posts = await db.posts.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    recipes = await db.recipes.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    
    completed_projects = len([p for p in projects if p.get("status") == "complete"])
    active_projects = len([p for p in projects if p.get("status") == "active"])
    
    total_likes = sum(p.get("likes_count", 0) for p in posts)
    total_comments = sum(p.get("comments_count", 0) for p in posts)
    
    fermentation_types = {}
    for project in projects:
        ftype = project.get("fermentation_type", "Unknown")
        fermentation_types[ftype] = fermentation_types.get(ftype, 0) + 1
    
    avg_duration = 0
    if completed_projects > 0:
        durations = [p.get("estimated_duration", 0) for p in projects if p.get("status") == "complete"]
        avg_duration = sum(durations) / len(durations) if durations else 0
    
    return {
        "total_projects": len(projects),
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "total_posts": len(posts),
        "total_recipes": len(recipes),
        "total_likes": total_likes,
        "total_comments": total_comments,
        "fermentation_types": fermentation_types,
        "avg_project_duration": round(avg_duration, 1),
        "engagement_rate": round((total_likes + total_comments) / len(posts), 2) if posts else 0
    }

app.include_router(api_router)

cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    cors_origins = ['http://localhost:3000', 'https://fermentstation.preview.emergentagent.com']
else:
    cors_origins = cors_origins.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
