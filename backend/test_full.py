from services.pipeline import process_voice
from services.response import generate_response
from services.tts import speak

result = process_voice("voice.wav")

print("\nRecognized Text:")
print(result["text"])

print("\nIntent:")
print(result["intent"])

print("\nEntities:")
print(result["entities"])

response = generate_response(result)

print("\nResponse:")
print(response)

speak(response)