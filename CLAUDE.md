# Review Tool - Spaced Repetition Learning System

A beautiful, full-stack spaced repetition learning review system built with FastAPI and React. This tool helps you remember what you learn through scientifically-backed spaced repetition intervals.

## 🎯 Overview

This application implements a complete spaced repetition system that helps users retain information by scheduling reviews at optimal intervals. The system tracks both scheduled reviews (which advance the spaced repetition algorithm) and manual reviews (which allow extra practice without affecting the schedule).

## ✨ Features

### Core Functionality
- **Spaced Repetition Algorithm**: Automatically schedules reviews at intervals of 0, 1, 3, 7, and 30 days
- **Learning Items Management**: Create, read, update, and delete learning items with subject categorization
- **Dual Review System**:
  - **Scheduled Reviews**: Advance through spaced repetition intervals
  - **Manual Reviews**: Extra practice without affecting the schedule
- **Review History**: Complete timeline of all reviews (both scheduled and manual)
- **Subject Filtering**: Organize and filter items by subject
- **Dashboard**: Overview of items due today, this week, and overall statistics

### User Experience
- Beautiful "Refined Study Space" design aesthetic
- Smooth animations with Framer Motion
- Responsive layout for all screen sizes
- Real-time updates after actions
- Clear visual distinction between scheduled and manual reviews

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **React Router**: Client-side routing
- **Framer Motion**: Animation library
- **Vite**: Build tool and dev server

### Architecture
- **Repository Pattern**: Data access layer
- **Service Layer**: Business logic
- **RESTful API**: Clean API design
- **Type Safety**: End-to-end TypeScript types

## 📁 Project Structure

```
review-tool/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                 # Dependency injection
│   │   │   └── v1/
│   │   │       ├── learning_items.py   # CRUD endpoints
│   │   │       └── reviews.py          # Review endpoints
│   │   ├── core/
│   │   │   ├── config.py               # Configuration
│   │   │   └── exceptions.py           # Custom exceptions
│   │   ├── models/
│   │   │   ├── learning_item.py        # Learning item model
│   │   │   └── review_history.py       # Review history model
│   │   ├── repositories/
│   │   │   ├── learning_item_repository.py
│   │   │   └── review_history_repository.py
│   │   ├── schemas/
│   │   │   ├── learning_item.py        # Pydantic schemas
│   │   │   └── review.py               # Review schemas
│   │   ├── services/
│   │   │   ├── learning_item_service.py
│   │   │   └── spaced_repetition_service.py
│   │   ├── database.py                 # Database setup
│   │   └── main.py                     # FastAPI app
│   ├── data/
│   │   └── review_tool.db              # SQLite database
│   ├── migrate.py                      # Database migration script
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navigation.tsx          # Navigation bar
    │   ├── pages/
    │   │   ├── AddItem.tsx             # Create new item
    │   │   ├── AllItems.tsx            # Browse all items
    │   │   ├── Dashboard.tsx           # Main dashboard
    │   │   ├── EditItem.tsx            # Edit existing item
    │   │   ├── ItemDetail.tsx          # View item details
    │   │   └── ReviewPage.tsx          # Review interface
    │   ├── services/
    │   │   └── api.ts                  # API client
    │   ├── types/
    │   │   └── index.ts                # TypeScript types
    │   ├── App.tsx                     # Main app component
    │   ├── App.css                     # Global styles
    │   └── main.tsx                    # Entry point
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run database migration (if needed):
```bash
python migrate.py
```

5. Start the backend server:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage Guide

### Creating Learning Items

1. Navigate to "Add Item" page
2. Enter:
   - **Subject**: Category (e.g., "Python Programming", "English", "Math")
   - **Title**: Brief title (e.g., "List Comprehensions")
   - **Content**: The material you want to learn
3. Click "Create Item"
4. The item will be scheduled for immediate review (Day 0)

### Scheduled Reviews

1. Go to "Review" page
2. Click "Start Review" for an item
3. Read the content
4. Click "Mark as Reviewed"
5. The item advances to the next interval:
   - Review 1: Next review in 1 day
   - Review 2: Next review in 3 days
   - Review 3: Next review in 7 days
   - Review 4+: Next review in 30 days

### Manual Reviews

1. Open any item's detail page
2. Click the "🔄 Manual Review" button
3. Manual review count increments
4. **Important**: This does NOT affect the scheduled review date
5. Use for extra practice without disrupting your spaced repetition schedule

### Viewing Items

- **Dashboard**: See items due today and this week
- **All Items**: Browse all items with subject filtering
- **Item Detail**: View full content, review stats, and history timeline

### Editing Items

1. Go to "All Items" or item detail page
2. Click the "✏️ Edit" button
3. Modify subject, title, or content
4. Save changes
5. Review schedule is preserved

## 🔌 API Documentation

### Learning Items Endpoints

#### Create Item
```http
POST /api/v1/learning-items/
Content-Type: application/json

{
  "subject": "Python Programming",
  "title": "List Comprehensions",
  "content": "List comprehensions provide a concise way to create lists..."
}
```

#### Get All Items
```http
GET /api/v1/learning-items/
GET /api/v1/learning-items/?subject=Python Programming
```

#### Get Single Item
```http
GET /api/v1/learning-items/{item_id}
```

#### Update Item
```http
PUT /api/v1/learning-items/{item_id}
Content-Type: application/json

{
  "subject": "Python",
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Item
```http
DELETE /api/v1/learning-items/{item_id}
```

#### Get All Subjects
```http
GET /api/v1/learning-items/subjects
```

### Review Endpoints

#### Get Due Items
```http
GET /api/v1/reviews/due
GET /api/v1/reviews/due?subject=Python Programming
```

#### Mark as Reviewed (Scheduled)
```http
POST /api/v1/reviews/{item_id}
```

#### Manual Review
```http
POST /api/v1/reviews/{item_id}/manual
```

#### Get Review History
```http
GET /api/v1/reviews/history/{item_id}
```

#### Get Review Stats
```http
GET /api/v1/reviews/stats
```

## 🗄️ Database Schema

### learning_items Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| subject | VARCHAR(255) | Category/subject |
| title | VARCHAR(500) | Item title |
| content | TEXT | Learning content |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |
| review_count | INTEGER | Number of scheduled reviews |
| next_review_date | DATE | Next scheduled review date |
| current_interval_days | INTEGER | Current interval in days |
| manual_review_count | INTEGER | Number of manual reviews |
| is_deleted | BOOLEAN | Soft delete flag |

### review_history Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(36) | Primary key (UUID) |
| learning_item_id | VARCHAR(36) | Foreign key to learning_items |
| reviewed_at | DATETIME | Review timestamp |
| interval_days | INTEGER | Interval used for this review |
| next_review_date | DATE | Next review date after this review |
| review_number | INTEGER | Review sequence number |
| is_manual | BOOLEAN | Manual review flag |

## 🧮 Spaced Repetition Algorithm

The system uses a fixed interval schedule:

```python
REVIEW_INTERVALS = [0, 1, 3, 7, 30]  # Days
```

**Review Schedule**:
1. **Day 0**: Initial learning (same day as creation)
2. **Day 1**: First review (after 1 day)
3. **Day 4**: Second review (after 3 days)
4. **Day 11**: Third review (after 7 days)
5. **Day 41+**: Subsequent reviews (every 30 days)

**Manual Reviews**:
- Do NOT advance the schedule
- Tracked separately in `manual_review_count`
- Recorded in history with `is_manual=true`
- Perfect for extra practice

## 🎨 Design System

### Color Palette
- **Navy**: `#2C3E50` - Primary text and headers
- **Terracotta**: `#D97757` - Accent color, CTAs
- **Forest**: `#487D5B` - Success states, manual reviews
- **Cream**: `#F8F6F1` - Backgrounds, subtle highlights
- **Gray Soft**: `#B8BCC4` - Secondary text

### Typography
- **Display Font**: Fraunces (serif) - For headings
- **Body Font**: DM Sans - For content

### Components
- Cards with subtle shadows
- Rounded corners (8-12px)
- Smooth transitions and animations
- Hover effects for interactive elements

## 🔧 Development Notes

### Key Design Decisions

1. **Dual Review System**:
   - Scheduled reviews advance the algorithm
   - Manual reviews are independent for extra practice
   - Both tracked separately to provide full insight

2. **Repository Pattern**:
   - Separates data access from business logic
   - Makes testing easier
   - Allows for easy database switching

3. **Soft Delete**:
   - Items marked as deleted, not removed
   - Preserves review history
   - Allows for data recovery

4. **Type Safety**:
   - Pydantic schemas on backend
   - TypeScript interfaces on frontend
   - End-to-end type checking

### Running Migrations

If you add new database fields:

1. Update the model in `app/models/`
2. Update the migration script `migrate.py`
3. Run: `python migrate.py`
4. Update schemas in `app/schemas/`
5. Update TypeScript types in `frontend/src/types/`

### Common Tasks

**Reset Database**:
```bash
cd backend
rm data/review_tool.db
python -c "from app.database import init_db; init_db()"
```

**Check Database Schema**:
```python
import sqlite3
conn = sqlite3.connect('data/review_tool.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(learning_items)")
print(cursor.fetchall())
```

**Build Frontend for Production**:
```bash
cd frontend
npm run build
```

## 📊 API Response Examples

### Learning Item Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "subject": "Python Programming",
  "title": "List Comprehensions",
  "content": "List comprehensions provide...",
  "created_at": "2025-12-08T10:00:00Z",
  "updated_at": "2025-12-08T10:00:00Z",
  "review_count": 3,
  "next_review_date": "2025-12-15",
  "current_interval_days": 7,
  "manual_review_count": 2,
  "is_deleted": false
}
```

### Review History Response
```json
{
  "id": "789e4567-e89b-12d3-a456-426614174001",
  "learning_item_id": "123e4567-e89b-12d3-a456-426614174000",
  "reviewed_at": "2025-12-08T14:30:00Z",
  "interval_days": 7,
  "next_review_date": "2025-12-15",
  "review_number": 3,
  "is_manual": false
}
```

### Due Items Response
```json
{
  "items": [...],
  "total_due": 5,
  "by_subject": {
    "Python Programming": 3,
    "English": 2
  }
}
```

## 🎯 Future Enhancements

Potential features to add:
- User authentication and multi-user support
- Customizable review intervals
- Performance analytics and charts
- Import/export functionality
- Tags and advanced filtering
- Search functionality
- Mobile app
- Markdown support in content
- Attachments and images
- Difficulty ratings
- Study streak tracking

## 📝 License

This project was created as a learning management tool. Feel free to use and modify as needed.

## 🙏 Acknowledgments

Built with Claude Code - AI-powered coding assistant by Anthropic.

---

**Generated with [Claude Code](https://claude.com/claude-code)**

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
