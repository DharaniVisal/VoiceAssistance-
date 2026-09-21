from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from services.pipeline import process_voice
from services.response import generate_response
from services.tts import speak

from services.intent import detect_intent
from services.entities import extract_entities
from services.fuzzy import match_place
from services.transport import find_buses

from pathlib import Path
import shutil


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/audio",
    StaticFiles(directory="."),
    name="audio"
)


class TextRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {
        "message": "VoiceTransport backend is running"
    }


def process_text(text):

    intent = detect_intent(text)

    entities = extract_entities(text)

    if entities["source"]:
        entities["source"] = match_place(
            entities["source"]
        )

    if entities["destination"]:
        entities["destination"] = match_place(
            entities["destination"]
        )

    buses = []

    if (
        entities["source"]
        and entities["destination"]
    ):
        buses = find_buses(
            entities["source"],
            entities["destination"]
        )

    return {
        "text": text,
        "intent": intent,
        "entities": entities,
        "buses": buses
    }


@app.post("/voice")
async def voice(
    file: UploadFile = File(...)
):

    audio_path = Path("input.wav")

    with open(
        audio_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    result = process_voice(
        str(audio_path)
    )

    response = generate_response(
        result
    )

    speak(response)

    return {
        "text": result["text"],
        "intent": result["intent"],
        "entities": result["entities"],
        "buses": result["buses"],
        "response": response,
        "audio": "/audio/response.wav"
    }


@app.post("/text")
async def text_command(
    request: TextRequest
):

    result = process_text(
        request.text
    )

    response = generate_response(
        result
    )

    speak(response)

    return {
        "text": result["text"],
        "intent": result["intent"],
        "entities": result["entities"],
        "buses": result["buses"],
        "response": response,
        "audio": "/audio/response.wav"
    }