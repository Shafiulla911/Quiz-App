from flask import Flask, jsonify, request
from flask_cors import CORS
from database import init_db
from models import (
    get_filtered_questions,
    get_categories,
    add_new_question,
    delete_question,
    save_leaderboard_score,
    get_leaderboard,
    get_app_stats,
    insert_sample_questions,
    register_user,
    authenticate_user,
    get_user_by_id,
    seed_default_admin,
    get_all_users,
    update_user_role,
    delete_user,
    delete_leaderboard_entry,
    get_admin_analytics,
    generate_ai_questions,
    get_user_history_and_stats,
    get_word_puzzles,
    add_word_puzzle,
    delete_word_puzzle,
    generate_ai_word_puzzles,
    insert_sample_word_puzzles
)


app = Flask(__name__)
CORS(app)

@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip()
        password = data.get("password") or ""

        if not username or len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters long."}), 400

        if not email or "@" not in email or "." not in email:
            return jsonify({"error": "Please provide a valid email address."}), 400

        if not password or len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long."}), 400

        user, err = register_user(username, email, password)
        if err:
            return jsonify({"error": err}), 409

        return jsonify({
            "message": "User registered successfully!",
            "user": user
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        identifier = (data.get("identifier") or "").strip()
        password = data.get("password") or ""

        if not identifier or not password:
            return jsonify({"error": "Username/email and password are required."}), 400

        user, err = authenticate_user(identifier, password)
        if err:
            return jsonify({"error": err}), 401

        return jsonify({
            "message": "Login successful!",
            "user": user
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/user/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    try:
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/categories", methods=["GET"])
def categories():
    try:
        data = get_categories()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/questions", methods=["GET"])
def questions():
    try:
        category = request.args.get("category", "All")
        difficulty = request.args.get("difficulty", "All")
        limit = request.args.get("limit", default=10, type=int)

        data = get_filtered_questions(category=category, difficulty=difficulty, limit=limit)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/questions", methods=["POST"])
def create_question():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        required_fields = ["question", "options", "correctAnswer"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        if len(data["options"]) != 4:
            return jsonify({"error": "Exactly 4 options are required"}), 400

        if data["correctAnswer"] not in data["options"]:
            return jsonify({"error": "Correct answer must match one of the 4 options"}), 400

        add_new_question(data)
        return jsonify({"message": "Question added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/questions/<int:question_id>", methods=["DELETE"])
def remove_question(question_id):
    try:
        success = delete_question(question_id)
        if not success:
            return jsonify({"error": "Question not found or already deleted"}), 404
        return jsonify({"message": "Question deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/leaderboard", methods=["GET"])

def leaderboard_list():
    try:
        limit = request.args.get("limit", default=20, type=int)
        data = get_leaderboard(limit=limit)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/leaderboard", methods=["POST"])
def submit_score():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        player_name = data.get("playerName", "Anonymous").strip() or "Anonymous"
        score = int(data.get("score", 0))
        total_questions = int(data.get("totalQuestions", 1))
        percentage = int(data.get("percentage", round((score / max(total_questions, 1)) * 100)))
        category = data.get("category", "General Knowledge")
        user_id = data.get("userId")

        save_leaderboard_score(player_name, score, total_questions, percentage, category, user_id)
        return jsonify({"message": "Score submitted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "QuizSpark Backend Server is active"}), 200

@app.route("/api/stats", methods=["GET"])
def stats():
    try:
        data = get_app_stats()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# ADMIN API ENDPOINTS
# ==============================================================================

@app.route("/api/admin/users", methods=["GET"])
def admin_get_users():
    try:
        users_list = get_all_users()
        return jsonify(users_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/users/<int:user_id>/role", methods=["PATCH"])
def admin_update_role(user_id):
    try:
        data = request.get_json() or {}
        new_role = data.get("role")
        success, msg = update_user_role(user_id, new_role)
        if not success:
            return jsonify({"error": msg}), 400
        return jsonify({"message": msg}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
def admin_delete_user(user_id):
    try:
        success = delete_user(user_id)
        if not success:
            return jsonify({"error": "User not found or already deleted"}), 404
        return jsonify({"message": "User deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/leaderboard/<int:entry_id>", methods=["DELETE"])
def admin_delete_leaderboard_entry(entry_id):
    try:
        success = delete_leaderboard_entry(entry_id)
        if not success:
            return jsonify({"error": "Leaderboard entry not found or already deleted"}), 404
        return jsonify({"message": "Leaderboard entry deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/analytics", methods=["GET"])
def admin_analytics():
    try:
        data = get_admin_analytics()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/generate-questions", methods=["POST"])
def admin_generate_questions():
    try:
        data = request.get_json() or {}
        topic = data.get("topic", "General Knowledge")
        difficulty = data.get("difficulty", "Medium")
        count = data.get("count", 3)

        generated = generate_ai_questions(topic=topic, difficulty=difficulty, count=count)
        return jsonify(generated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<int:user_id>/history", methods=["GET"])
def get_user_history(user_id):
    try:
        data = get_user_history_and_stats(user_id)
        if not data:
            return jsonify({"error": "User not found"}), 404
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# WORD PUZZLE API
# ==============================================================================

@app.route("/api/word-puzzles", methods=["GET"])
def word_puzzles_list():
    try:
        category = request.args.get("category", "All")
        difficulty = request.args.get("difficulty", "All")
        limit = request.args.get("limit", default=10, type=int)

        data = get_word_puzzles(category=category, difficulty=difficulty, limit=limit)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/word-puzzles", methods=["POST"])
def create_word_puzzle():
    try:
        data = request.get_json() or {}
        word = (data.get("word") or "").strip()
        clue = (data.get("clue") or "").strip()

        if not word or len(word) < 2:
            return jsonify({"error": "Target word must be at least 2 letters long."}), 400
        if not clue:
            return jsonify({"error": "A clue/definition is required."}), 400

        add_word_puzzle(data)
        return jsonify({"message": "Word puzzle created successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/word-puzzles/<int:puzzle_id>", methods=["DELETE"])
def remove_word_puzzle(puzzle_id):
    try:
        success = delete_word_puzzle(puzzle_id)
        if not success:
            return jsonify({"error": "Word puzzle not found or already deleted"}), 404
        return jsonify({"message": "Word puzzle deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/generate-word-puzzles", methods=["POST"])
def admin_generate_word_puzzles():
    try:
        data = request.get_json() or {}
        topic = data.get("topic", "General Knowledge")
        difficulty = data.get("difficulty", "Medium")
        count = data.get("count", 3)

        generated = generate_ai_word_puzzles(topic=topic, difficulty=difficulty, count=count)
        return jsonify(generated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    init_db()
    insert_sample_questions()
    insert_sample_word_puzzles()
    seed_default_admin()
    print("[QuizSpark] Backend Server running on http://127.0.0.1:5001")
    app.run(debug=True, host="0.0.0.0", port=5001)