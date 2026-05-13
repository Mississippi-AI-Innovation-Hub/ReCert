
import sqlite3

conn = sqlite3.connect("database/certs.db")
cursor = conn.cursor()

f = open("database/schema.sql", "r")
sql = f.read()
f.close()

cursor.executescript(sql)

conn.commit()
conn.close()

print("database created")
