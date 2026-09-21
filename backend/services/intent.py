def detect_intent(text):
    text = text.lower()

    # English
    if any(word in text for word in ["timing", "time", "when", "schedule"]):
        return "BUS_TIMING"

    if any(word in text for word in ["route", "travel", "from", "to"]):
        return "ROUTE_SEARCH"

    if any(word in text for word in ["fare", "price", "cost", "ticket"]):
        return "FARE_QUERY"

    if any(word in text for word in ["direction", "where", "location"]):
        return "DIRECTIONS"

    if any(word in text for word in ["bus", "available", "buses"]):
        return "AVAILABLE_BUSES"

    # Tamil
    if any(word in text for word in ["நேரம்", "எப்போது", "நேரங்கள்"]):
        return "BUS_TIMING"

    if any(word in text for word in ["வழி", "செல்வது", "செல்ல", "பயணம்"]):
        return "ROUTE_SEARCH"

    if any(word in text for word in ["கட்டணம்", "விலை", "டிக்கெட்"]):
        return "FARE_QUERY"

    if any(word in text for word in ["திசை", "இடம்", "எங்கே"]):
        return "DIRECTIONS"

    if any(word in text for word in ["பேருந்து", "பஸ்", "பஸ்கள்"]):
        return "AVAILABLE_BUSES"

    if any(word in text for word in ["உதவி", "வணக்கம்"]):
        return "HELP"

    return "UNKNOWN"