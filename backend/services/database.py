import sqlite3

buses = [
    ("TN38A1001", "Gandhipuram Local", "Gandhipuram", "Ukkadam", "08:00 AM", "08:25 AM", 15),
    ("TN38A1002", "Ukkadam Local", "Ukkadam", "Gandhipuram", "08:10 AM", "08:35 AM", 15),
    ("TN38A1003", "Gandhipuram Local", "Gandhipuram", "Singanallur", "08:15 AM", "08:45 AM", 15),
    ("TN38A1004", "Singanallur Local", "Singanallur", "Gandhipuram", "08:30 AM", "09:00 AM", 15),
    ("TN38A1005", "Gandhipuram Local", "Gandhipuram", "Peelamedu", "09:00 AM", "09:25 AM", 15),
    ("TN38A1006", "Peelamedu Local", "Peelamedu", "Gandhipuram", "09:15 AM", "09:40 AM", 15),
    ("TN38A1007", "Gandhipuram Local", "Gandhipuram", "Saravanampatti", "09:30 AM", "10:00 AM", 20),
    ("TN38A1008", "Saravanampatti Local", "Saravanampatti", "Gandhipuram", "09:45 AM", "10:15 AM", 20),
    ("TN38A1009", "Gandhipuram Local", "Gandhipuram", "Saibaba Colony", "10:00 AM", "10:20 AM", 15),
    ("TN38A1010", "Saibaba Colony Local", "Saibaba Colony", "Gandhipuram", "10:15 AM", "10:35 AM", 15),
    ("TN38A1011", "Gandhipuram Local", "Gandhipuram", "RS Puram", "10:30 AM", "10:50 AM", 15),
    ("TN38A1012", "RS Puram Local", "RS Puram", "Gandhipuram", "10:45 AM", "11:05 AM", 15),
    ("TN38A1013", "Ukkadam Local", "Ukkadam", "Town Hall", "11:00 AM", "11:15 AM", 10),
    ("TN38A1014", "Town Hall Local", "Town Hall", "Ukkadam", "11:15 AM", "11:30 AM", 10),
    ("TN38A1015", "Ukkadam Local", "Ukkadam", "Kuniyamuthur", "11:30 AM", "11:50 AM", 15),
    ("TN38A1016", "Kuniyamuthur Local", "Kuniyamuthur", "Ukkadam", "11:45 AM", "12:05 PM", 15),
    ("TN38A1017", "Gandhipuram Local", "Gandhipuram", "Thudiyalur", "12:00 PM", "12:30 PM", 20),
    ("TN38A1018", "Thudiyalur Local", "Thudiyalur", "Gandhipuram", "12:15 PM", "12:45 PM", 20),
    ("TN38A1019", "Singanallur Local", "Singanallur", "Sulur", "01:00 PM", "01:35 PM", 20),
    ("TN38A1020", "Sulur Local", "Sulur", "Singanallur", "01:15 PM", "01:50 PM", 20),
    ("TN38A1021", "Gandhipuram Local", "Gandhipuram", "Kovaipudur", "02:00 PM", "02:35 PM", 20),
    ("TN38A1022", "Kovaipudur Local", "Kovaipudur", "Gandhipuram", "02:15 PM", "02:50 PM", 20),
    ("TN38A1023", "Ukkadam Local", "Ukkadam", "Podanur", "03:00 PM", "03:25 PM", 15),
    ("TN38A1024", "Podanur Local", "Podanur", "Ukkadam", "03:15 PM", "03:40 PM", 15),
    ("TN38A1025", "Gandhipuram Local", "Gandhipuram", "Kuniyamuthur", "04:00 PM", "04:30 PM", 20),
    ("TN38A1026", "Kuniyamuthur Local", "Kuniyamuthur", "Gandhipuram", "04:15 PM", "04:45 PM", 20),
    ("TN38A1027", "Gandhipuram Local", "Gandhipuram", "Vadavalli", "05:00 PM", "05:30 PM", 20),
    ("TN38A1028", "Vadavalli Local", "Vadavalli", "Gandhipuram", "05:15 PM", "05:45 PM", 20),
    ("TN38A1029", "Gandhipuram Local", "Gandhipuram", "Marudamalai", "06:00 PM", "06:40 PM", 25),
    ("TN38A1030", "Marudamalai Local", "Marudamalai", "Gandhipuram", "06:15 PM", "06:55 PM", 25)
]

conn = sqlite3.connect("transport.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS buses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_number TEXT,
    bus_name TEXT,
    source TEXT,
    destination TEXT,
    departure TEXT,
    arrival TEXT,
    fare INTEGER
)
""")

cursor.execute("DELETE FROM buses")

cursor.executemany("""
INSERT INTO buses
(bus_number, bus_name, source, destination, departure, arrival, fare)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", buses)

conn.commit()
conn.close()

print("Database created successfully!")
print("30 bus routes added.")