from services.speech import transcribe

text = transcribe("voice.wav")

print("Recognized text:")
print(text)