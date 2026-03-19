import pandas as pd
import sqlite3
import os

# 指定 dataset 資料夾
DATASET_FOLDER = "archive"
# 指定要使用的 CSV 檔名
CSV_FILE = "comprehensive_foods_usda.csv"
# 完整路徑
path = os.path.join(DATASET_FOLDER, CSV_FILE)

# 連接 SQLite，沒有就會自動建立
conn = sqlite3.connect("food.db")

# 讀 CSV
print("loading", CSV_FILE)
df = pd.read_csv(path)
print(df.columns.tolist())

# 確認 CSV 有 food_name 欄位
if "food_name" in df.columns:
    # 將所有欄位寫入 SQLite，保留完整資料
    # 如果 table 已存在就覆蓋，確保欄位完整對應
    df.to_sql("food", conn, if_exists="replace", index=False)
    print("Database created and CSV imported with all columns!")
else:
    print(f"{CSV_FILE} 沒有 'food_name' 欄位")

conn.close()