from pydantic import BaseModel


class CourseResponse(BaseModel):
    id: int
    url: str
    title: str