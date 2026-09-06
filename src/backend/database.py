
import os
import sqlite3
import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Password",
    "database": "quiz_app"
}

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "quiz_app.db")

def is_mysql_available():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.close()
        return True
    except Exception:
        return False

USE_MYSQL = is_mysql_available()

class SQLiteDictCursor:
    def __init__(self, cursor):
        self.cursor = cursor
    def __getattr__(self, name):
        return getattr(self.cursor, name)
    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        return dict(row)
    def fetchall(self):
        rows = self.cursor.fetchall()
        return [dict(r) for r in rows]

class SQLiteConnectionWrapper:
    def __init__(self, conn):
        self.conn = conn
        self.conn.row_factory = sqlite3.Row
    def cursor(self, dictionary=False):
        c = self.conn.cursor()
        if dictionary:
            return SQLiteDictCursor(c)
        return c
    def commit(self):
        self.conn.commit()
    def close(self):
        self.conn.close()

def get_db_connection():
    if USE_MYSQL:
        try:
            return mysql.connector.connect(**DB_CONFIG)
        except Exception:
            pass
    
    conn = sqlite3.connect(SQLITE_PATH)
    return SQLiteConnectionWrapper(conn)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    if USE_MYSQL:
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                salt VARCHAR(64) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        try:
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user'")
        except Exception:
            pass

        # Questions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(100) NOT NULL DEFAULT 'General Knowledge',
                difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
                question TEXT NOT NULL,
                option_a VARCHAR(255) NOT NULL,
                option_b VARCHAR(255) NOT NULL,
                option_c VARCHAR(255) NOT NULL,
                option_d VARCHAR(255) NOT NULL,
                correct_answer VARCHAR(255) NOT NULL,
                explanation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Add columns if they don't exist in existing table
        for col_def in [
            ("category", "VARCHAR(100) NOT NULL DEFAULT 'General Knowledge'"),
            ("difficulty", "VARCHAR(50) NOT NULL DEFAULT 'Medium'"),
            ("explanation", "TEXT"),
            ("created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
        ]:
            try:
                cursor.execute(f"ALTER TABLE questions ADD COLUMN {col_def[0]} {col_def[1]}")
            except Exception:
                pass

        # Leaderboard table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                player_name VARCHAR(100) NOT NULL,
                score INT NOT NULL,
                total_questions INT NOT NULL,
                percentage INT NOT NULL,
                category VARCHAR(100) NOT NULL,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        try:
            cursor.execute("ALTER TABLE leaderboard ADD COLUMN user_id INT NULL")
        except Exception:
            pass

        # Word Puzzles Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS word_puzzles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                word VARCHAR(100) NOT NULL,
                clue TEXT NOT NULL,
                category VARCHAR(100) NOT NULL DEFAULT 'General Knowledge',
                difficulty VARCHAR(50) NOT NULL DEFAULT 'Medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
    else:
        # SQLite
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")
        except Exception:
            pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL DEFAULT 'General Knowledge',
                difficulty TEXT NOT NULL DEFAULT 'Medium',
                question TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                explanation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NULL,
                player_name TEXT NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage INTEGER NOT NULL,
                category TEXT NOT NULL,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS word_puzzles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                clue TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'General Knowledge',
                difficulty TEXT NOT NULL DEFAULT 'Medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

    conn.commit()
    cursor.close()
    conn.close()