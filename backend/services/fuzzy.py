from rapidfuzz import process


PLACES = [
    "Gandhipuram",
    "Ukkadam",
    "Singanallur",
    "Peelamedu",
    "Saravanampatti",
    "Saibaba Colony",
    "RS Puram",
    "Town Hall",
    "Kuniyamuthur",
    "Thudiyalur",
    "Sulur",
    "Kovaipudur",
    "Podanur",
    "Vadavalli",
    "Marudamalai"
]


def match_place(name):

    if not name:
        return None

    name = name.strip(
        " ?!.,"
    )

    corrections = {

        # Gandhipuram
        "gandhi param": "Gandhipuram",
        "gandhi puram": "Gandhipuram",
        "gandipuram": "Gandhipuram",
        "gandhipuram": "Gandhipuram",

        # Ukkadam
       # Ukkadam
        # Ukkadam
        "god": "Ukkadam",
        "god i am": "Ukkadam",
        "kadam": "Ukkadam",
        "okadam": "Ukkadam",
        "oka ram": "Ukkadam",
        "oka dam": "Ukkadam",
        "oka kadam": "Ukkadam",
        "ukkadham": "Ukkadam",
        "ukkadam": "Ukkadam",
        # Peelamedu
        "peela medu": "Peelamedu",
        "peelamedu": "Peelamedu",

        # Singanallur
        "singan allur": "Singanallur",
        "singanallur": "Singanallur",

        # Saravanampatti
        "saravana patti": "Saravanampatti",
        "saravanampaty": "Saravanampatti",

        # Marudamalai
        "marudhamalai": "Marudamalai",
        "maruthamalai": "Marudamalai",
        "marudmalai": "Marudamalai",
        "mardamalai": "Marudamalai",
        "mardhamalai": "Marudamalai"
    }

    lower_name = name.lower()

    if lower_name in corrections:
        return corrections[lower_name]

    for place in PLACES:

        if lower_name == place.lower():
            return place

    result = process.extractOne(
        name,
        PLACES
    )

    if result and result[1] >= 70:
        return result[0]

    return None