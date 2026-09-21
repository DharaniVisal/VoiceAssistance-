from services.speech import transcribe
from services.intent import detect_intent
from services.entities import extract_entities
from services.fuzzy import match_place
from services.transport import find_buses


def process_voice(audio_file):

    text = transcribe(audio_file)

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

    return {
        "text": text,
        "intent": intent,
        "entities": entities,
        "buses": buses
    }