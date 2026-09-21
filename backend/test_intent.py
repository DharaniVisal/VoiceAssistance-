from services.intent import detect_intent

text = input("Enter your question: ")

print("Intent:", detect_intent(text))