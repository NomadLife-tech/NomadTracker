from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)


# ═══════════════════════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════════════════════

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# Sync Models
class SyncOperation(BaseModel):
    id: str
    type: str  # CREATE, UPDATE, DELETE
    entity: str  # visit, profile, passport, insurance, settings
    data: Dict[str, Any]
    timestamp: datetime
    retryCount: int = 0
    status: str = "pending"

class SyncBatchRequest(BaseModel):
    deviceId: str
    operations: List[SyncOperation]

class SyncBatchResponse(BaseModel):
    success: bool
    processedCount: int
    failedIds: List[str] = []
    serverTimestamp: datetime = Field(default_factory=datetime.utcnow)

# Visit Model for Cloud Storage
class VisitCreate(BaseModel):
    id: str
    countryCode: str
    countryName: str
    entryDate: str
    exitDate: Optional[str] = None
    visaType: str
    customVisaType: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None

class ProfileCreate(BaseModel):
    deviceId: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    avatar: Optional[str] = None
    avatarType: Optional[str] = None
    passports: List[Dict[str, Any]] = []
    insurances: List[Dict[str, Any]] = []

class UserDataResponse(BaseModel):
    visits: List[Dict[str, Any]] = []
    profile: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    lastSyncTimestamp: datetime = Field(default_factory=datetime.utcnow)


# ═══════════════════════════════════════════════════════════════════════════
# HEALTH CHECK ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@api_router.get("/")
async def root():
    return {"message": "Nomad Tracker API v1.0", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    try:
        # Check MongoDB connection
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(limit: int = 100, skip: int = 0):
    status_checks = await db.status_checks.find().skip(skip).limit(limit).to_list(limit)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ═══════════════════════════════════════════════════════════════════════════
# SYNC ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@api_router.post("/sync", response_model=SyncBatchResponse)
async def sync_data(request: SyncBatchRequest):
    """
    Process a batch of sync operations from the client.
    Each operation can be CREATE, UPDATE, or DELETE for different entities.
    """
    processed_count = 0
    failed_ids = []
    
    for op in request.operations:
        try:
            collection_name = f"{request.deviceId}_{op.entity}s"
            
            if op.type == "CREATE":
                # Insert new document
                await db[collection_name].insert_one({
                    **op.data,
                    "_syncedAt": datetime.utcnow()
                })
                processed_count += 1
                
            elif op.type == "UPDATE":
                # Update existing document
                result = await db[collection_name].update_one(
                    {"id": op.data.get("id")},
                    {"$set": {**op.data, "_syncedAt": datetime.utcnow()}}
                )
                if result.modified_count > 0 or result.matched_count > 0:
                    processed_count += 1
                else:
                    # If not found, create it
                    await db[collection_name].insert_one({
                        **op.data,
                        "_syncedAt": datetime.utcnow()
                    })
                    processed_count += 1
                    
            elif op.type == "DELETE":
                # Delete document
                result = await db[collection_name].delete_one({"id": op.data.get("id")})
                processed_count += 1
                
            logger.info(f"Processed {op.type} {op.entity} for device {request.deviceId}")
            
        except Exception as e:
            logger.error(f"Failed to process operation {op.id}: {str(e)}")
            failed_ids.append(op.id)
    
    return SyncBatchResponse(
        success=len(failed_ids) == 0,
        processedCount=processed_count,
        failedIds=failed_ids
    )


@api_router.get("/sync/{device_id}", response_model=UserDataResponse)
async def get_synced_data(device_id: str, since: Optional[str] = None):
    """
    Retrieve all synced data for a device.
    Optionally filter by timestamp to get only changes since last sync.
    """
    try:
        # Get visits
        visits_collection = f"{device_id}_visits"
        visits = await db[visits_collection].find().to_list(1000)
        
        # Get profile
        profile_collection = f"{device_id}_profiles"
        profile = await db[profile_collection].find_one()
        
        # Get settings
        settings_collection = f"{device_id}_settingss"  # Note: entity name is 'settings' so collection is 'settingss'
        settings = await db[settings_collection].find_one()
        
        # Clean up MongoDB _id fields
        cleaned_visits = []
        for v in visits:
            if '_id' in v:
                del v['_id']
            cleaned_visits.append(v)
        
        if profile and '_id' in profile:
            del profile['_id']
            
        if settings and '_id' in settings:
            del settings['_id']
        
        return UserDataResponse(
            visits=cleaned_visits,
            profile=profile,
            settings=settings
        )
        
    except Exception as e:
        logger.error(f"Failed to get synced data for device {device_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/sync/{device_id}")
async def clear_synced_data(device_id: str):
    """
    Clear all synced data for a device (for testing/reset purposes).
    """
    try:
        collections_to_clear = [
            f"{device_id}_visits",
            f"{device_id}_profiles",
            f"{device_id}_settingss",
            f"{device_id}_passports",
            f"{device_id}_insurances"
        ]
        
        for collection_name in collections_to_clear:
            await db[collection_name].delete_many({})
        
        return {"success": True, "message": f"Cleared all data for device {device_id}"}
        
    except Exception as e:
        logger.error(f"Failed to clear data for device {device_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# DIRECT ENTITY ROUTES (Alternative to batch sync)
# ═══════════════════════════════════════════════════════════════════════════

@api_router.post("/visits/{device_id}")
async def create_visit(device_id: str, visit: VisitCreate):
    """Create a new visit for a device."""
    collection_name = f"{device_id}_visits"
    await db[collection_name].insert_one({
        **visit.dict(),
        "_syncedAt": datetime.utcnow()
    })
    return {"success": True, "id": visit.id}


@api_router.put("/visits/{device_id}/{visit_id}")
async def update_visit(device_id: str, visit_id: str, visit: VisitCreate):
    """Update an existing visit."""
    collection_name = f"{device_id}_visits"
    result = await db[collection_name].update_one(
        {"id": visit_id},
        {"$set": {**visit.dict(), "_syncedAt": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Visit not found")
    return {"success": True}


@api_router.delete("/visits/{device_id}/{visit_id}")
async def delete_visit(device_id: str, visit_id: str):
    """Delete a visit."""
    collection_name = f"{device_id}_visits"
    result = await db[collection_name].delete_one({"id": visit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Visit not found")
    return {"success": True}


@api_router.get("/visits/{device_id}")
async def get_visits(device_id: str):
    """Get all visits for a device."""
    collection_name = f"{device_id}_visits"
    visits = await db[collection_name].find().to_list(1000)
    # Clean up MongoDB _id fields
    for v in visits:
        if '_id' in v:
            del v['_id']
    return {"visits": visits}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
