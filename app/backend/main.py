import os
from fastapi import FastAPI
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from celery import celery # to enqueue jobs


app = FastAPI()

class Item(BaseModel):
    name: str
    value: int 


@app.get("/")
async def read_root():
    return {"HELLO": "WORLD"}

@app.put("/item")
async def create_item(item: Item):
    
    return {'item': item, "name": item.name, "value": item.value}