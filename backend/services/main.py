from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from services.pipeline import process_voice
from services.response import generate_response
from services.tts import speak

from pathlib import Path
import shutil


app = FastAPI()

# Allow React UI to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated audio
app.mount("/audio", StaticFiles(directory="."), name="audio")


@app.get("/")
def home():
    return {"message": "VoiceTransport backend is running"}


@app.post("/voice")
async def voice(file: UploadFile = File(...)):

    audio_path = Path("input.wav")

    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Whisper + intent + entities + fuzzy matching + database
    result = process_voice(str(audio_path))

    # Generate text response
    response = generate_response(result)

    # Generate and play Piper voice
    speak(response)

    return {
        "text": result["text"],
        "intent": result["intent"],
        "entities": result["entities"],
        "buses": result["buses"],
        "response": response,
        "audio": "/audio/response.wav"
    }class TextRequest(BaseModel):
    text: str


@app.post("/text")
async def text_command(request: TextRequest):

    text = request.text

    from services.intent import detect_intent
    from services.entities import extract_entities
    from services.fuzzy import match_place
    from services.transport import find_buses

    intent = detect_intent(text)
    entities = extract_entities(text)

    if entities["source"]:
        entities["source"] = match_place(entities["source"])

    if entities["destination"]:
        entities["destination"] = match_place(entities["destination"])

    buses = []

    if entities["source"] and entities["destination"]:
        buses = find_buses(
            entities["source"],
            entities["destination"]
        )

    result = {
        "text": text,
        "intent": intent,
        "entities": entities,
        "buses": buses
    }

    response = generate_response(result)

    speak(response)

    return {
        "text": text,
        "intent": intent,
        "entities": entities,
        "buses": buses,
        "response": response,
        "audio": "/audio/response.wav"
    }