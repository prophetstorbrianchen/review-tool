"""
Migration script to add manual review fields.
"""
import sqlite3
import sys

def migrate():
    conn = sqlite3.connect('data/review_tool.db')
    cursor = conn.cursor()

    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(learning_items)")
        columns = [col[1] for col in cursor.fetchall()]

        # Add manual_review_count if it doesn't exist
        if 'manual_review_count' not in columns:
            print("Adding manual_review_count column to learning_items...")
            cursor.execute("ALTER TABLE learning_items ADD COLUMN manual_review_count INTEGER DEFAULT 0 NOT NULL")
            print("[OK] Added manual_review_count column")
        else:
            print("[OK] manual_review_count column already exists")

        # Check review_history table
        cursor.execute("PRAGMA table_info(review_history)")
        columns = [col[1] for col in cursor.fetchall()]

        # Add is_manual if it doesn't exist
        if 'is_manual' not in columns:
            print("Adding is_manual column to review_history...")
            cursor.execute("ALTER TABLE review_history ADD COLUMN is_manual BOOLEAN DEFAULT 0 NOT NULL")
            print("[OK] Added is_manual column")
        else:
            print("[OK] is_manual column already exists")

        conn.commit()
        print("\n[SUCCESS] Migration completed successfully!")

    except Exception as e:
        print(f"\n[ERROR] Migration failed: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
