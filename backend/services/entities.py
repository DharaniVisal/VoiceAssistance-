import re

def extract_entities(text):
    text = text.strip(" ?!.,")
    
    entities = {
        "bus_number": None,
        "source": None,
        "destination": None
    }

    # Bus number
    match = re.search(r"\b\d+[A-Za-z]?\b", text)
    if match:
        entities["bus_number"] = match.group()

    # English: from X to Y
    match = re.search(r"from (.+?) to (.+)", text, re.I)

    if match:
        entities["source"] = match.group(1).strip(" ?!.,")
        entities["destination"] = match.group(2).strip(" ?!.,")

    # Tamil: X-இலிருந்து Y-க்கு
    match = re.search(r"(.+?)இலிருந்து\s+(.+?)(?:க்கு|க்குத்)", text)

    if match:
        entities["source"] = match.group(1).strip()
        entities["destination"] = match.group(2).strip()

    return entities