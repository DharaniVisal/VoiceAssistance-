import sqlite3

def find_buses(source, destination):

    conn = sqlite3.connect("transport.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT bus_number, bus_name, departure, arrival, fare
    FROM buses
    WHERE source = ? AND destination = ?
    """, (source, destination))

    buses = cursor.fetchall()

    conn.close()

    return buses