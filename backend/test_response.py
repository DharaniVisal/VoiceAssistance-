from services.response import generate_response

result = {
    "intent": "BUS_TIMING",
    "entities": {
        "bus_number": None,
        "source": "Coimbatore",
        "destination": "Chennai"
    }
}

print(generate_response(result))