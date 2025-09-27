from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .common import PyObjectId

class WictionaryBase(BaseModel):
    term: str = Field(..., min_length=1, max_length=100)
    definition: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(..., pattern="^(slang|science|culture|legal)$")
    etymology: Optional[str] = None

class WictionaryCreate(WictionaryBase):
    pass

class WictionarySuggest(BaseModel):
    term: str = Field(..., min_length=1, max_length=100)
    definition: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(..., pattern="^(slang|science|culture|legal)$")
    etymology: Optional[str] = None
    suggested_by: str  # user email

class Wictionary(WictionaryBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

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
    created_at: datetime