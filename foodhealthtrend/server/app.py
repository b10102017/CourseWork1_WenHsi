from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB_PATH = "food.db"

@app.route("/")
def home():
    return "Flask server working"

@app.route("/test")
def test():
    return {"message": "API working"}

# ======= 搜尋食物 API ==========================================================================
@app.route("/food/<name>", methods=["GET"])
def search_food(name):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row # 讓查詢結果以 dict 形式返回。
    cursor = conn.cursor()

    query = "SELECT * FROM food WHERE LOWER(food_name) LIKE ?"
    cursor.execute(query, (f"%{name.lower()}%",))
    rows = cursor.fetchall()

    results = [dict(row) for row in rows]
    conn.close()
    return jsonify(results)

# ======= 新增食物 API ==========================================================================
@app.route("/food", methods=["POST"])
def add_food():
    data = request.get_json()  # 取得前端傳來的 JSON 資料

    # 避免錯誤欄位
    allowed_columns = [
        "food_name", "food_type", "calories", "protein_g", "fat_g",
        "carbs_g", "fiber_g", "sugar_g", "sodium_mg", "health_score"
    ]
    columns = []
    values = []

    for col in allowed_columns:
        if col in data:
            columns.append(col)
            values.append(data[col])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 產生新的 fdc_id
        cursor.execute("SELECT MAX(fdc_id) FROM food")
        max_id = cursor.fetchone()[0]
        if max_id is None or max_id >= 100000:  # 如果沒有資料，或已存在六位數以上的舊資料
            new_fdc_id = 1
        else:
            new_fdc_id = max_id + 1

        # 加入 fdc_id 到 INSERT
        columns.append("fdc_id")
        values.append(new_fdc_id)

        placeholders = ", ".join(["?"] * len(columns))
        columns_str = ", ".join(columns)

        # 執行 INSERT
        cursor.execute(
            f"INSERT INTO food ({columns_str}) VALUES ({placeholders})",
            tuple(values)
        )
        conn.commit()

        # 取出完整資料回傳給前端
        cursor.execute("SELECT * FROM food WHERE fdc_id = ?", (new_fdc_id,))
        new_food = cursor.fetchone()
        col_names = [description[0] for description in cursor.description]
        result = dict(zip(col_names, new_food))

        return jsonify(result), 201

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()

# ======= 更新食物 API ==========================================================================
@app.route("/food/<int:fdc_id>", methods=["PUT"])
def update_food(fdc_id):
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE food SET
            food_name=?,
            food_type=?,
            calories=?,
            protein_g=?,
            fat_g=?,
            carbs_g=?,
            fiber_g=?,
            sugar_g=?,
            sodium_mg=?,
            health_score=?
        WHERE fdc_id=?
    """, (
        data.get("food_name"),
        data.get("food_type"),
        data.get("calories"),
        data.get("protein_g"),
        data.get("fat_g"),
        data.get("carbs_g"),
        data.get("fiber_g"),
        data.get("sugar_g"),
        data.get("sodium_mg"),
        data.get("health_score"),
        fdc_id
    ))

    conn.commit()
    conn.close()
    return jsonify({"message": "更新成功"})

# ======= 刪除食物 API ==========================================================================
@app.route("/food/<int:fdc_id>", methods=["DELETE"])
def delete_food(fdc_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    query = "DELETE FROM food WHERE fdc_id = ?"
    cursor.execute(query, (fdc_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Food deleted!"})

# ====== 啟動 Flask 伺服器 ========================================================================
if __name__ == "__main__":
    app.run(debug=True)