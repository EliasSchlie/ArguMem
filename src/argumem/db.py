import sqlite3
from pathlib import Path


SCHEMA_PATH = Path(__file__).with_name("schema.sql")


def get_db(db_path: str = "argumem.db") -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db(db_path: str = "argumem.db") -> sqlite3.Connection:
    conn = get_db(db_path)
    with SCHEMA_PATH.open("r", encoding="utf-8") as f:
        conn.executescript(f.read())
    return conn


def clear_db(db_path: str = "argumem.db"):
    """Clear all data from the database."""
    conn = get_db(db_path)
    cursor = conn.cursor()
    
    try:
        # Delete all data from tables
        cursor.execute("DELETE FROM argument_proposition")
        cursor.execute("DELETE FROM argument_quotation")
        cursor.execute("DELETE FROM arguments")
        cursor.execute("DELETE FROM propositions")
        cursor.execute("DELETE FROM quotations")
        cursor.execute("DELETE FROM sources")

        # Reset auto-increment counters for all affected tables (if sqlite_sequence exists)
        try:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name IN ('sources', 'quotations', 'propositions', 'arguments')")
        except sqlite3.OperationalError:
            # sqlite_sequence table doesn't exist yet (no auto-increment tables used)
            pass
        
        conn.commit()
    finally:
        conn.close()


