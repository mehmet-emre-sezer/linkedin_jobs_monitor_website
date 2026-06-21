from datetime import datetime
from pydantic import BaseModel


class ErrorLogResponse(BaseModel):
    id: int
    timestamp: datetime
    severity: str
    source: str
    user_id: int | None
    message: str
    stack_trace: str | None

    class Config:
        from_attributes = True
