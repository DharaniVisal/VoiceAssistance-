def generate_response(result):

    intent = result["intent"]
    entities = result["entities"]
    buses = result.get("buses", [])

    if intent == "BUS_TIMING":

        source = entities["source"]
        destination = entities["destination"]

        if not source or not destination:
            return "Please tell me the source and destination."

        if not buses:
            return f"No buses found from {source} to {destination}."

        response = f"Bus timings from {source} to {destination}:\n"

        for bus in buses:
            response += (
                f"Bus {bus[0]} - {bus[1]}, "
                f"Departure: {bus[2]}, "
                f"Arrival: {bus[3]}, "
                f"Fare: ₹{bus[4]}\n"
            )

        return response

    if intent == "ROUTE_SEARCH":
        return "I can help you find the bus route."

    if intent == "FARE_QUERY":
        return "I can help you find the bus fare."

    if intent == "DIRECTIONS":
        return "I can help you with directions."

    if intent == "AVAILABLE_BUSES":
        return "I can show you the available buses."

    if intent == "HELP":
        return "You can ask me about bus timings, routes, fares, or available buses."

    return "Sorry, I didn't understand your question."