import random
import hashlib
import secrets
from database import get_db_connection, USE_MYSQL

SAMPLE_QUESTIONS = [
    # Programming & Tech
    {
        "category": "Programming & Tech",
        "difficulty": "Easy",
        "question": "Which HTML element is used to define the title of a webpage shown in the browser toolbar?",
        "options": ["<head>", "<title>", "<meta>", "<header>"],
        "correct_answer": "<title>",
        "explanation": "The <title> tag is required in HTML documents and defines the title of the document shown in the browser tab."
    },
    {
        "category": "Programming & Tech",
        "difficulty": "Medium",
        "question": "In JavaScript, what does 'typeof NaN' evaluate to?",
        "options": ["'undefined'", "'number'", "'NaN'", "'object'"],
        "correct_answer": "'number'",
        "explanation": "In JavaScript, NaN (Not-a-Number) is technically a numeric data type representing an unrepresentable number."
    },
    {
        "category": "Programming & Tech",
        "difficulty": "Easy",
        "question": "Which symbol is used for single-line comments in Python?",
        "options": ["//", "/*", "#", "--"],
        "correct_answer": "#",
        "explanation": "Python uses the hash character (#) to indicate the beginning of a single-line comment."
    },
    {
        "category": "Programming & Tech",
        "difficulty": "Medium",
        "question": "Which React hook is used to perform side effects in functional components?",
        "options": ["useState", "useEffect", "useMemo", "useCallback"],
        "correct_answer": "useEffect",
        "explanation": "useEffect lets you perform side effects such as data fetching, subscriptions, and DOM manipulations."
    },
    {
        "category": "Programming & Tech",
        "difficulty": "Hard",
        "question": "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
        "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
        "correct_answer": "O(log n)",
        "explanation": "In a balanced BST, each comparison cuts the search space in half, resulting in O(log n) time complexity."
    },
    {
        "category": "Programming & Tech",
        "difficulty": "Medium",
        "question": "Which SQL clause is used to filter results after grouping with GROUP BY?",
        "options": ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        "correct_answer": "HAVING",
        "explanation": "The HAVING clause was added to SQL because the WHERE keyword could not be used with aggregate functions."
    },

    # Science & Space
    {
        "category": "Science & Space",
        "difficulty": "Easy",
        "question": "What planet is known as the 'Red Planet'?",
        "options": ["Venus", "Mars", "Jupiter", "Mercury"],
        "correct_answer": "Mars",
        "explanation": "Mars appears reddish due to the high amount of iron oxide (rust) on its surface."
    },
    {
        "category": "Science & Space",
        "difficulty": "Medium",
        "question": "What is the most abundant gas in Earth's atmosphere?",
        "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
        "correct_answer": "Nitrogen",
        "explanation": "Nitrogen makes up approximately 78% of Earth's atmosphere, followed by oxygen at about 21%."
    },
    {
        "category": "Science & Space",
        "difficulty": "Hard",
        "question": "What particle is exchanged to mediate the strong nuclear force between quarks?",
        "options": ["Photon", "Gluon", "Graviton", "W Boson"],
        "correct_answer": "Gluon",
        "explanation": "Gluons act as the exchange particles for the strong force between quarks, analogous to photons in electromagnetism."
    },
    {
        "category": "Science & Space",
        "difficulty": "Easy",
        "question": "What process do plants use to convert sunlight into chemical energy?",
        "options": ["Respiration", "Photosynthesis", "Fermentation", "Transpiration"],
        "correct_answer": "Photosynthesis",
        "explanation": "Photosynthesis is the process by which green plants synthesize nutrients from carbon dioxide and water using sunlight."
    },
    {
        "category": "Science & Space",
        "difficulty": "Medium",
        "question": "What is the hardest natural substance found on Earth?",
        "options": ["Quartz", "Diamond", "Titanium", "Granite"],
        "correct_answer": "Diamond",
        "explanation": "Diamond is a solid form of carbon with a crystal lattice structure that makes it the hardest known natural mineral."
    },
    {
        "category": "Science & Space",
        "difficulty": "Hard",
        "question": "What is the speed of light in a vacuum (approximately)?",
        "options": ["300,000 km/s", "150,000 km/s", "500,000 km/s", "30,000 km/s"],
        "correct_answer": "300,000 km/s",
        "explanation": "Light in a vacuum travels at precisely 299,792,458 meters per second (~300,000 km/s)."
    },

    # World Geography
    {
        "category": "World Geography",
        "difficulty": "Easy",
        "question": "What is the largest ocean on Earth?",
        "options": ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        "correct_answer": "Pacific Ocean",
        "explanation": "The Pacific Ocean is the largest and deepest of the world ocean basins, covering more than 60 million square miles."
    },
    {
        "category": "World Geography",
        "difficulty": "Easy",
        "question": "What is the capital city of Australia?",
        "options": ["Sydney", "Melbourne", "Canberra", "Brisbane"],
        "correct_answer": "Canberra",
        "explanation": "Canberra was chosen as the capital in 1908 as a compromise between rival cities Sydney and Melbourne."
    },
    {
        "category": "World Geography",
        "difficulty": "Medium",
        "question": "Which is the longest river in the world?",
        "options": ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
        "correct_answer": "Nile River",
        "explanation": "The Nile River in northeast Africa is traditionally considered the longest river in the world, spanning about 6,650 km."
    },
    {
        "category": "World Geography",
        "difficulty": "Medium",
        "question": "Mount Kilimanjaro, the highest peak in Africa, is located in which country?",
        "options": ["Kenya", "Tanzania", "Ethiopia", "Uganda"],
        "correct_answer": "Tanzania",
        "explanation": "Kilimanjaro is a dormant volcano in northeastern Tanzania near the border with Kenya."
    },
    {
        "category": "World Geography",
        "difficulty": "Hard",
        "question": "Which country has the most natural lakes in the world?",
        "options": ["Russia", "Canada", "United States", "Finland"],
        "correct_answer": "Canada",
        "explanation": "Canada contains over 60% of all the world's lakes, with an estimated 2 million lakes within its borders."
    },

    # History & Arts
    {
        "category": "History & Arts",
        "difficulty": "Easy",
        "question": "Who painted the masterpiece 'Mona Lisa'?",
        "options": ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        "correct_answer": "Leonardo da Vinci",
        "explanation": "Leonardo da Vinci painted the Mona Lisa in the early 16th century, and it hangs in the Louvre Museum in Paris."
    },
    {
        "category": "History & Arts",
        "difficulty": "Medium",
        "question": "In which year did the Titanic sink?",
        "options": ["1905", "1912", "1918", "1923"],
        "correct_answer": "1912",
        "explanation": "The RMS Titanic sank on April 15, 1912, during its maiden voyage across the North Atlantic."
    },
    {
        "category": "History & Arts",
        "difficulty": "Hard",
        "question": "Who was the first emperor of a unified China (Qin Dynasty)?",
        "options": ["Qin Shi Huang", "Sun Tzu", "Kublai Khan", "Emperor Wu"],
        "correct_answer": "Qin Shi Huang",
        "explanation": "Qin Shi Huang conquered the other Warring States and founded China's first imperial dynasty in 221 BC."
    },
    {
        "category": "History & Arts",
        "difficulty": "Medium",
        "question": "The ancient city of Petra is located in which modern-day country?",
        "options": ["Egypt", "Jordan", "Lebanon", "Turkey"],
        "correct_answer": "Jordan",
        "explanation": "Petra is a historic archaeological city in southern Jordan famous for its rock-cut architecture."
    },

    # General Knowledge
    {
        "category": "General Knowledge",
        "difficulty": "Easy",
        "question": "How many continents are there on Earth?",
        "options": ["5", "6", "7", "8"],
        "correct_answer": "7",
        "explanation": "The 7 continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia."
    },
    {
        "category": "General Knowledge",
        "difficulty": "Easy",
        "question": "Which organ in the human body pumps blood?",
        "options": ["Brain", "Lungs", "Heart", "Liver"],
        "correct_answer": "Heart",
        "explanation": "The heart is a muscular organ that pumps blood through the blood vessels of the circulatory system."
    },
    {
        "category": "General Knowledge",
        "difficulty": "Medium",
        "question": "What is the primary ingredient in traditional Japanese miso soup?",
        "options": ["Soybeans", "Rice noodles", "Bamboo shoots", "Seaweed extract"],
        "correct_answer": "Soybeans",
        "explanation": "Miso is a traditional Japanese seasoning produced by fermenting soybeans with salt and kōji."
    },
    {
        "category": "General Knowledge",
        "difficulty": "Hard",
        "question": "What is the official currency of Switzerland?",
        "options": ["Euro", "Swiss Franc", "Krone", "Guilder"],
        "correct_answer": "Swiss Franc",
        "explanation": "The Swiss Franc (CHF) is the official currency and legal tender of Switzerland and Liechtenstein."
    }
]

def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pwd_hash, salt

def verify_password(stored_hash, salt, password):
    pwd_hash, _ = hash_password(password, salt)
    return pwd_hash == stored_hash

def register_user(username, email, password):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Check if username or email exists
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"SELECT id FROM users WHERE LOWER(username) = LOWER({ph}) OR LOWER(email) = LOWER({ph})", (username, email))
    existing = cursor.fetchone()
    if existing:
        cursor.close()
        conn.close()
        return None, "Username or email is already registered."

    pwd_hash, salt = hash_password(password)
    ph_ins = "%s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?"
    cursor.execute(f"""
        INSERT INTO users (username, email, password_hash, salt)
        VALUES ({ph_ins})
    """, (username, email, pwd_hash, salt))
    conn.commit()

    user_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return {
        "id": user_id,
        "username": username,
        "email": email
    }, None

def authenticate_user(identifier, password):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"""
        SELECT * FROM users
        WHERE LOWER(username) = LOWER({ph}) OR LOWER(email) = LOWER({ph})
    """, (identifier, identifier))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return None, "No account found with this username or email."

    if not verify_password(user["password_hash"], user["salt"], password):
        return None, "Incorrect password. Please try again."

    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "createdAt": str(user.get("created_at", ""))
    }, None

def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"SELECT id, username, email, created_at FROM users WHERE id = {ph}", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        return None
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "createdAt": str(user.get("created_at", ""))
    }

def map_row_to_question(row):
    return {
        "id": row["id"],
        "category": row.get("category", "General Knowledge"),
        "difficulty": row.get("difficulty", "Medium"),
        "question": row["question"],
        "options": [row["option_a"], row["option_b"], row["option_c"], row["option_d"]],
        "correctAnswer": row["correct_answer"],
        "explanation": row.get("explanation") or f"The correct answer is {row['correct_answer']}."
    }

def get_filtered_questions(category=None, difficulty=None, limit=10):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM questions WHERE 1=1"
    params = []

    if category and category.lower() != "all":
        query += " AND LOWER(category) = LOWER(%s)" if USE_MYSQL else " AND LOWER(category) = LOWER(?)"
        params.append(category)

    if difficulty and difficulty.lower() != "all":
        query += " AND LOWER(difficulty) = LOWER(%s)" if USE_MYSQL else " AND LOWER(difficulty) = LOWER(?)"
        params.append(difficulty)

    cursor.execute(query, tuple(params) if params else ())
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    questions = [map_row_to_question(r) for r in rows]
    random.shuffle(questions)
    
    if limit and limit > 0:
        questions = questions[:limit]
        
    return questions

def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT category, COUNT(*) as count FROM questions GROUP BY category ORDER BY count DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{"category": r["category"], "count": r["count"]} for r in rows]

def add_new_question(data):
    conn = get_db_connection()
    cursor = conn.cursor()

    ph = "%s, %s, %s, %s, %s, %s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?, ?, ?, ?, ?, ?"
    cursor.execute(f"""
        INSERT INTO questions (category, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
        VALUES ({ph})
    """, (
        data.get("category", "General Knowledge"),
        data.get("difficulty", "Medium"),
        data["question"],
        data["options"][0],
        data["options"][1],
        data["options"][2],
        data["options"][3],
        data["correctAnswer"],
        data.get("explanation", "")
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return True

def save_leaderboard_score(player_name, score, total_questions, percentage, category, user_id=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s, %s, %s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?, ?, ?"
    cursor.execute(f"""
        INSERT INTO leaderboard (player_name, score, total_questions, percentage, category, user_id)
        VALUES ({ph})
    """, (player_name, score, total_questions, percentage, category, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    return True

def get_leaderboard(limit=20):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(f"SELECT * FROM leaderboard ORDER BY percentage DESC, score DESC, played_at DESC LIMIT {int(limit)}")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{
        "id": r["id"],
        "userId": r.get("user_id"),
        "playerName": r["player_name"],
        "score": r["score"],
        "totalQuestions": r["total_questions"],
        "percentage": r["percentage"],
        "category": r["category"],
        "playedAt": str(r.get("played_at", ""))
    } for r in rows]

def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"DELETE FROM questions WHERE id = {ph}", (question_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close()
    conn.close()
    return deleted

def get_app_stats():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT COUNT(*) as total_questions FROM questions")
    q_count = cursor.fetchone()["total_questions"]

    cursor.execute("SELECT COUNT(*) as total_games, AVG(percentage) as avg_score FROM leaderboard")
    lb_stats = cursor.fetchone()
    cursor.close()
    conn.close()

    return {
        "totalQuestions": q_count or 0,
        "totalGamesPlayed": lb_stats.get("total_games") or 0,
        "averageScore": round(float(lb_stats.get("avg_score") or 0), 1)
    }


def insert_sample_questions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM questions")
    count_row = cursor.fetchone()
    count = count_row[0] if isinstance(count_row, (tuple, list)) else (count_row.get("COUNT(*)") if isinstance(count_row, dict) else 0)

    if count < 10:
        ph = "%s, %s, %s, %s, %s, %s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?, ?, ?, ?, ?, ?"
        for q in SAMPLE_QUESTIONS:
            cursor.execute(f"""
                INSERT INTO questions (category, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, explanation)
                VALUES ({ph})
            """, (
                q["category"],
                q["difficulty"],
                q["question"],
                q["options"][0],
                q["options"][1],
                q["options"][2],
                q["options"][3],
                q["correct_answer"],
                q["explanation"]
            ))
        conn.commit()
    cursor.close()
    conn.close()