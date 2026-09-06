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

def register_user(username, email, password, role="user"):
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
    user_role = role if role in ["admin", "user"] else "user"
    ph_ins = "%s, %s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?, ?"
    cursor.execute(f"""
        INSERT INTO users (username, email, password_hash, salt, role)
        VALUES ({ph_ins})
    """, (username, email, pwd_hash, salt, user_role))
    conn.commit()

    user_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return {
        "id": user_id,
        "username": username,
        "email": email,
        "role": user_role
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
        "role": user.get("role", "user"),
        "createdAt": str(user.get("created_at", ""))
    }, None

def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"SELECT id, username, email, role, created_at FROM users WHERE id = {ph}", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        return None
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "user"),
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


def seed_default_admin():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"SELECT id FROM users WHERE LOWER(username) = LOWER({ph}) OR role = {ph}", ("admin", "admin"))
    admin = cursor.fetchone()
    cursor.close()
    conn.close()

    if not admin:
        print("[QuizSpark] Seeding default admin account (admin / admin123)...")
        register_user("admin", "admin@quizspark.com", "admin123", role="admin")

def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               COUNT(l.id) as games_played
        FROM users u
        LEFT JOIN leaderboard l ON u.id = l.user_id
        GROUP BY u.id, u.username, u.email, u.role, u.created_at
        ORDER BY u.id ASC
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [{
        "id": r["id"],
        "username": r["username"],
        "email": r["email"],
        "role": r.get("role", "user"),
        "createdAt": str(r.get("created_at", "")),
        "gamesPlayed": r.get("games_played", 0)
    } for r in rows]

def update_user_role(user_id, role):
    if role not in ["admin", "user"]:
        return False, "Invalid role. Must be 'admin' or 'user'."
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"UPDATE users SET role = {ph} WHERE id = {ph}", (role, user_id))
    conn.commit()
    updated = cursor.rowcount > 0
    cursor.close()
    conn.close()
    if updated:
        return True, "User role updated successfully!"
    return False, "User not found."

def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"DELETE FROM leaderboard WHERE user_id = {ph}", (user_id,))
    cursor.execute(f"DELETE FROM users WHERE id = {ph}", (user_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close()
    conn.close()
    return deleted

def delete_leaderboard_entry(entry_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"DELETE FROM leaderboard WHERE id = {ph}", (entry_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close()
    conn.close()
    return deleted

def get_admin_analytics():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as total_users, SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins FROM users")
    u_stats = cursor.fetchone() or {}

    cursor.execute("SELECT COUNT(*) as total_questions FROM questions")
    q_stats = cursor.fetchone() or {}

    cursor.execute("SELECT category, COUNT(*) as count FROM questions GROUP BY category")
    cat_rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) as total_games, AVG(percentage) as avg_accuracy FROM leaderboard")
    lb_stats = cursor.fetchone() or {}

    cursor.close()
    conn.close()

    return {
        "totalUsers": u_stats.get("total_users") or 0,
        "totalAdmins": u_stats.get("total_admins") or 0,
        "totalQuestions": q_stats.get("total_questions") or 0,
        "totalGamesPlayed": lb_stats.get("total_games") or 0,
        "averageAccuracy": round(float(lb_stats.get("avg_accuracy") or 0), 1),
        "categories": [{"category": r["category"], "count": r["count"]} for r in cat_rows]
    }


def generate_ai_questions(topic="General Knowledge", difficulty="Medium", count=3):
    count = max(1, min(int(count), 10))
    clean_topic = (topic or "General Knowledge").strip()
    
    # Pre-crafted dynamic templates per domain with randomized variations
    topic_lower = clean_topic.lower()
    
    templates = []
    
    if "python" in topic_lower or "code" in topic_lower or "program" in topic_lower:
        templates = [
            {
                "question": f"In {clean_topic}, which built-in function returns the length of an object?",
                "options": ["len()", "size()", "count()", "length()"],
                "correct_answer": "len()",
                "explanation": f"The len() function in {clean_topic} returns the total number of items in an object."
            },
            {
                "question": f"Which keyword is used to define a function or method in {clean_topic}?",
                "options": ["def", "func", "function", "define"],
                "correct_answer": "def",
                "explanation": f"The 'def' keyword introduces a new function definition in {clean_topic}."
            },
            {
                "question": f"What data structure in {clean_topic} stores key-value pairs and guarantees element uniqueness for keys?",
                "options": ["Dictionary (dict)", "List (list)", "Tuple (tuple)", "Array (array)"],
                "correct_answer": "Dictionary (dict)",
                "explanation": f"Dictionaries in {clean_topic} store mappings of unique keys to associated values."
            },
            {
                "question": f"Which operator is used for integer floor division in {clean_topic}?",
                "options": ["//", "/", "%", "**"],
                "correct_answer": "//",
                "explanation": "Floor division // divides two numbers and rounds down to the nearest whole integer."
            },
            {
                "question": f"What module in {clean_topic} is commonly used for working with regular expressions?",
                "options": ["re", "regex", "regexp", "string"],
                "correct_answer": "re",
                "explanation": "The 're' module provides regular expression matching operations."
            }
        ]
    elif "space" in topic_lower or "planet" in topic_lower or "astronomy" in topic_lower or "science" in topic_lower:
        templates = [
            {
                "question": f"In astronomy regarding {clean_topic}, what is the celestial object with a gravitational pull so strong that even light cannot escape?",
                "options": ["Black Hole", "Neutron Star", "White Dwarf", "Supernova"],
                "correct_answer": "Black Hole",
                "explanation": "A black hole is a region of spacetime where gravity is so intense that nothing can escape it."
            },
            {
                "question": f"Which planet in our solar system has the most extensive ring system?",
                "options": ["Saturn", "Jupiter", "Uranus", "Neptune"],
                "correct_answer": "Saturn",
                "explanation": "Saturn is famous for its prominent ring system composed mostly of ice particles and rocky debris."
            },
            {
                "question": f"What phenomenon occurs when the Moon passes directly between the Earth and the Sun?",
                "options": ["Solar Eclipse", "Lunar Eclipse", "Equinox", "Solstice"],
                "correct_answer": "Solar Eclipse",
                "explanation": "A solar eclipse occurs when the Moon moves in front of the Sun from Earth's perspective."
            },
            {
                "question": f"What unit of distance in astronomy is equivalent to approximately 9.46 trillion kilometers?",
                "options": ["Light-year", "Astronomical Unit (AU)", "Parsec", "Gigameter"],
                "correct_answer": "Light-year",
                "explanation": "A light-year is the distance that light travels in a vacuum in one Julian year."
            }
        ]
    elif "history" in topic_lower or "war" in topic_lower or "ancient" in topic_lower:
        templates = [
            {
                "question": f"In historical studies on {clean_topic}, which ancient civilization built the Great Pyramids of Giza?",
                "options": ["Ancient Egyptians", "Mesopotamians", "Ancient Greeks", "Romans"],
                "correct_answer": "Ancient Egyptians",
                "explanation": "The Great Pyramids were constructed by the Ancient Egyptians during the Old Kingdom period."
            },
            {
                "question": f"Which historical global conflict ended in 1945 following the surrender of Axis forces?",
                "options": ["World War II", "World War I", "The Cold War", "The Seven Years' War"],
                "correct_answer": "World War II",
                "explanation": "World War II officially ended in September 1945."
            },
            {
                "question": f"Who was the famous military leader and emperor of France who expanded control over continental Europe in the early 19th century?",
                "options": ["Napoleon Bonaparte", "Julius Caesar", "Charlemagne", "King Louis XIV"],
                "correct_answer": "Napoleon Bonaparte",
                "explanation": "Napoleon Bonaparte dominated European and global affairs for over a decade."
            }
        ]
    else:
        # Fallback dynamic trivia generation engine for any custom user prompt topic
        templates = [
            {
                "question": f"What is a fundamental principle or key concept associated with {clean_topic}?",
                "options": [
                    f"Core Foundations of {clean_topic}",
                    f"Secondary Analysis of {clean_topic}",
                    f"Linear Transformation of {clean_topic}",
                    f"Random Hypothesis of {clean_topic}"
                ],
                "correct_answer": f"Core Foundations of {clean_topic}",
                "explanation": f"Understanding the core foundations is essential to mastering {clean_topic}."
            },
            {
                "question": f"When examining {clean_topic} at a {difficulty} level, which metric is most widely evaluated?",
                "options": ["Efficiency & Accuracy", "Total Cost", "Surface Area", "Color Palette"],
                "correct_answer": "Efficiency & Accuracy",
                "explanation": f"Evaluating efficiency and accuracy provides actionable insights into {clean_topic}."
            },
            {
                "question": f"Which domain or discipline is most closely connected with advancements in {clean_topic}?",
                "options": ["Applied Science & Technology", "Astrology", "Alchemy", "Mythology"],
                "correct_answer": "Applied Science & Technology",
                "explanation": f"Applied Science & Technology directly drives innovation in {clean_topic}."
            },
            {
                "question": f"What is considered a primary best practice when working with {clean_topic}?",
                "options": [
                    "Structured Analysis & Modular Design",
                    "Ignoring Documentation",
                    "Random Guesswork",
                    "Unverified Assumptions"
                ],
                "correct_answer": "Structured Analysis & Modular Design",
                "explanation": "Modular design and systematic analysis prevent errors and improve reproducibility."
            },
            {
                "question": f"In modern applications of {clean_topic}, what primary advantage does optimization offer?",
                "options": [
                    "Enhanced Speed & Reliability",
                    "Increased Latency",
                    "Higher Error Rates",
                    "Manual Overdrive"
                ],
                "correct_answer": "Enhanced Speed & Reliability",
                "explanation": "Optimization maximizes performance while maintaining overall stability."
            }
        ]

    random.shuffle(templates)
    selected = templates[:count]
    
    # Format each question with category & difficulty metadata
    results = []
    for t in selected:
        opts = list(t["options"])
        random.shuffle(opts)
        results.append({
            "category": clean_topic,
            "difficulty": difficulty.capitalize(),
            "question": t["question"],
            "options": opts,
            "correctAnswer": t["correct_answer"],
            "explanation": t["explanation"]
        })
        
    return results

def get_user_history_and_stats(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    ph = "%s" if USE_MYSQL else "?"
    
    # User Profile Info
    cursor.execute(f"SELECT id, username, email, role, created_at FROM users WHERE id = {ph}", (user_id,))
    user_row = cursor.fetchone()
    
    if not user_row:
        cursor.close()
        conn.close()
        return None
        
    # Game History
    cursor.execute(f"""
        SELECT id, player_name, score, total_questions, percentage, category, played_at
        FROM leaderboard
        WHERE user_id = {ph}
        ORDER BY played_at DESC
    """, (user_id,))
    history_rows = cursor.fetchall()
    
    # Statistics calculations
    total_games = len(history_rows)
    avg_accuracy = round(sum(r["percentage"] for r in history_rows) / max(total_games, 1), 1) if total_games > 0 else 0
    personal_best = max((r["percentage"] for r in history_rows), default=0)
    
    # Favorite Category
    cat_counts = {}
    for r in history_rows:
        cat = r.get("category", "General Knowledge")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
        
    fav_category = max(cat_counts, key=cat_counts.get) if cat_counts else "None Yet"
    
    cursor.close()
    conn.close()
    
    return {
        "user": {
            "id": user_row["id"],
            "username": user_row["username"],
            "email": user_row["email"],
            "role": user_row.get("role", "user"),
            "createdAt": str(user_row.get("created_at", ""))
        },
        "stats": {
            "totalGamesPlayed": total_games,
            "averageAccuracy": avg_accuracy,
            "personalBest": personal_best,
            "favoriteCategory": fav_category
        },
        "history": [{
            "id": r["id"],
            "playerName": r["player_name"],
            "score": r["score"],
            "totalQuestions": r["total_questions"],
            "percentage": r["percentage"],
            "category": r["category"],
            "playedAt": str(r.get("played_at", ""))
        } for r in history_rows]
    }


SAMPLE_WORD_PUZZLES = [
    {
        "word": "ALGORITHM",
        "clue": "A step-by-step procedure or set of rules for solving a problem.",
        "category": "Programming & Tech",
        "difficulty": "Medium"
    },
    {
        "word": "VARIABLE",
        "clue": "A named storage location in programming that holds data which can change.",
        "category": "Programming & Tech",
        "difficulty": "Easy"
    },
    {
        "word": "RECURSION",
        "clue": "A method where the solution to a problem depends on smaller instances of the same problem (function calling itself).",
        "category": "Programming & Tech",
        "difficulty": "Hard"
    },
    {
        "word": "SUPERNOVA",
        "clue": "A colossal explosion that occurs at the end of a massive star's life cycle.",
        "category": "Science & Space",
        "difficulty": "Medium"
    },
    {
        "word": "GRAVITY",
        "clue": "The fundamental universal force that attracts objects with mass toward one another.",
        "category": "Science & Space",
        "difficulty": "Easy"
    },
    {
        "word": "PYRAMID",
        "clue": "A monumental stone structure with triangular sides built in ancient Egypt.",
        "category": "History & Arts",
        "difficulty": "Easy"
    },
    {
        "word": "CANBERRA",
        "clue": "The purpose-built capital city of Australia.",
        "category": "World Geography",
        "difficulty": "Medium"
    },
    {
        "word": "KILIMANJARO",
        "clue": "The highest dormant volcanic mountain peak in Africa.",
        "category": "World Geography",
        "difficulty": "Hard"
    }
]

def scramble_word(word):
    chars = list(word.upper())
    if len(chars) <= 1:
        return chars
    for _ in range(10):
        random.shuffle(chars)
        if "".join(chars) != word.upper():
            break
    return chars

def get_word_puzzles(category=None, difficulty=None, limit=10):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    query = "SELECT * FROM word_puzzles WHERE 1=1"
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

    puzzles = []
    for r in rows:
        target = r["word"].strip().upper()
        puzzles.append({
            "id": r["id"],
            "word": target,
            "clue": r["clue"],
            "category": r.get("category", "General Knowledge"),
            "difficulty": r.get("difficulty", "Medium"),
            "scrambled": scramble_word(target)
        })
        
    random.shuffle(puzzles)
    if limit and limit > 0:
        puzzles = puzzles[:limit]
        
    return puzzles

def add_word_puzzle(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?"
    cursor.execute(f"""
        INSERT INTO word_puzzles (word, clue, category, difficulty)
        VALUES ({ph})
    """, (
        data["word"].strip().upper(),
        data["clue"].strip(),
        data.get("category", "General Knowledge"),
        data.get("difficulty", "Medium")
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return True

def delete_word_puzzle(puzzle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    ph = "%s" if USE_MYSQL else "?"
    cursor.execute(f"DELETE FROM word_puzzles WHERE id = {ph}", (puzzle_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close()
    conn.close()
    return deleted

def generate_ai_word_puzzles(topic="General Knowledge", difficulty="Medium", count=3):
    count = max(1, min(int(count), 10))
    clean_topic = (topic or "General Knowledge").strip()
    topic_lower = clean_topic.lower()

    pool = []
    if "code" in topic_lower or "python" in topic_lower or "tech" in topic_lower:
        pool = [
            {"word": "FUNCTION", "clue": "A block of organized, reusable code used to perform a single action."},
            {"word": "COMPILER", "clue": "A program that translates source code into machine code."},
            {"word": "DATABASE", "clue": "An organized collection of structured data stored electronically."},
            {"word": "BOOLEAN", "clue": "A data type that can hold one of two values: True or False."},
            {"word": "OVERFLOW", "clue": "Condition that occurs when a calculation produces a result larger than memory capacity."}
        ]
    elif "space" in topic_lower or "science" in topic_lower or "planet" in topic_lower:
        pool = [
            {"word": "ASTRONAUT", "clue": "A person trained to travel in a spacecraft into outer space."},
            {"word": "TELESCOPE", "clue": "An optical instrument used to observe distant celestial objects."},
            {"word": "ATMOSPHERE", "clue": "The layer of gases surrounding a planet or cosmic body."},
            {"word": "ECLIPSE", "clue": "An astronomical event where one celestial body passes into the shadow of another."}
        ]
    else:
        pool = [
            {"word": "CHAMPION", "clue": "A person or player who has defeated all rivals in a competition."},
            {"word": "DISCOVERY", "clue": "The act of detecting or learning something new for the first time."},
            {"word": "STRATEGY", "clue": "A plan of action designed to achieve a long-term goal."},
            {"word": "ADVENTURE", "clue": "An exciting, daring, or remarkable experience."}
        ]

    random.shuffle(pool)
    selected = pool[:count]

    return [{
        "word": item["word"],
        "clue": item["clue"],
        "category": clean_topic,
        "difficulty": difficulty.capitalize(),
        "scrambled": scramble_word(item["word"])
    } for item in selected]

def insert_sample_word_puzzles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM word_puzzles")
    count_row = cursor.fetchone()
    count = count_row[0] if isinstance(count_row, (tuple, list)) else (count_row.get("COUNT(*)") if isinstance(count_row, dict) else 0)

    if count < 5:
        ph = "%s, %s, %s, %s" if USE_MYSQL else "?, ?, ?, ?"
        for p in SAMPLE_WORD_PUZZLES:
            cursor.execute(f"""
                INSERT INTO word_puzzles (word, clue, category, difficulty)
                VALUES ({ph})
            """, (p["word"], p["clue"], p["category"], p["difficulty"]))
        conn.commit()
    cursor.close()
    conn.close()

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