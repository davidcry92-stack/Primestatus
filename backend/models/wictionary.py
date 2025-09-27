from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId
from .common import PyObjectId

class WictionaryBase(BaseModel):
    term: str = Field(..., min_length=1, max_length=100)
    definition: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(..., pattern="^(slang|science|culture|strain)$")
    etymology: Optional[str] = None
    examples: list[str] = []
    related_terms: list[str] = []

class WictionaryCreate(WictionaryBase):
    pass

class WictionaryUpdate(BaseModel):
    term: Optional[str] = None
    definition: Optional[str] = None
    category: Optional[str] = None
    etymology: Optional[str] = None
    examples: Optional[list[str]] = None
    related_terms: Optional[list[str]] = None

class Wictionary(WictionaryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class WictionaryResponse(BaseModel):
    id: str
    term: str
    definition: str
    category: str
    etymology: Optional[str] = None
    examples: list[str]
    related_terms: list[str]
    created_at: datetime
    updated_at: datetime