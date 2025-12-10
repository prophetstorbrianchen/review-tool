# 🧠 Spaced Repetition Review Tool

A beautiful, intelligent learning system that helps you remember what you've learned using scientifically-proven spaced repetition techniques.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tech Stack](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Deploy](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

## ✨ Features

- **Smart Review Scheduling**: Automatically schedules reviews based on proven memory retention intervals (0, 1, 3, 7, 30 days)
- **Beautiful UI**: Refined, sophisticated interface inspired by premium stationery and study journals
- **Subject Organization**: Organize learning items by subject for better management
- **Progress Tracking**: View statistics and track your learning journey
- **Auto-timestamps**: Automatic timestamp tracking for all learning items
- **Smooth Animations**: Delightful micro-interactions powered by Framer Motion

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Start the backend server:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Backend will be running at: http://localhost:8000
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Start the frontend development server:
```bash
npm run dev
```

Frontend will be running at: http://localhost:3000

## 📚 How It Works

### Spaced Repetition Algorithm

The system uses a simple but effective spaced repetition schedule:

1. **Day 0** (Today): Initial learning - review right away
2. **Day 1**: First review - review the next day
3. **Day 3**: Second review - review 3 days later
4. **Day 7**: Third review - review 7 days later
5. **Day 30**: Fourth review and beyond - review monthly

After completing all intervals, items cycle back to the 7-day interval to maintain long-term retention.

### User Flow

1. **Add Learning Items**: Create new items with subject, title, and content
2. **Daily Reviews**: Open the app to see what's due today
3. **Review Process**: Read each item and mark as reviewed
4. **Automatic Scheduling**: System calculates next review date
5. **Track Progress**: Monitor your learning statistics

## 🎨 Design Philosophy

The frontend features a **"Refined Study Space"** aesthetic:

- **Typography**: Fraunces (elegant serif) + DM Sans (modern sans-serif)
- **Colors**: Warm cream background with terracotta accents and navy highlights
- **Layout**: Card-based design with generous spacing
- **Animations**: Purposeful transitions that enhance usability
- **Feel**: Calm, focused, and sophisticated

## 🏗️ Architecture

### Backend (FastAPI + PostgreSQL/SQLite)

```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Configuration management
│   ├── database.py                # SQLAlchemy setup
│   ├── models/                    # Database models
│   │   ├── learning_item.py       # Learning item model
│   │   └── review_history.py      # Review history model
│   ├── schemas/                   # Pydantic schemas
│   │   ├── learning_item.py       # Request/response models
│   │   └── review.py              # Review schemas
│   ├── api/v1/                    # API endpoints
│   │   ├── learning_items.py      # CRUD endpoints
│   │   └── reviews.py             # Review endpoints
│   ├── services/                  # Business logic
│   │   ├── learning_item_service.py
│   │   └── spaced_repetition_service.py
│   └── repositories/              # Data access layer
│       ├── learning_item_repository.py
│       └── review_history_repository.py
└── data/                          # SQLite database
```

### Frontend (React + TypeScript + Vite)

```
frontend/
├── src/
│   ├── components/                # Reusable components
│   │   └── Navigation.tsx         # Navigation bar
│   ├── pages/                     # Main pages
│   │   ├── Dashboard.tsx          # Home page
│   │   ├── ReviewPage.tsx         # Review interface
│   │   ├── AddItem.tsx            # Add new item
│   │   └── AllItems.tsx           # Browse all items
│   ├── services/                  # API client
│   │   └── api.ts                 # HTTP requests
│   ├── types/                     # TypeScript types
│   │   └── index.ts               # Type definitions
│   ├── App.tsx                    # Main app with routing
│   └── index.css                  # Global styles
```

## 📡 API Endpoints

### Learning Items

- `POST /api/v1/learning-items/` - Create new item
- `GET /api/v1/learning-items/` - List all items (with filters)
- `GET /api/v1/learning-items/{id}` - Get single item
- `PUT /api/v1/learning-items/{id}` - Update item
- `DELETE /api/v1/learning-items/{id}` - Delete item (soft delete)
- `GET /api/v1/learning-items/subjects` - Get all subjects

### Reviews

- `GET /api/v1/reviews/due` - Get items due for review
- `POST /api/v1/reviews/{item_id}` - Mark item as reviewed
- `GET /api/v1/reviews/history/{item_id}` - Get review history
- `GET /api/v1/reviews/stats` - Get statistics

## 🧪 Testing

The backend has been tested with the following workflow:

1. Create a learning item
2. Verify it appears in "due today" list
3. Mark it as reviewed
4. Verify next review date is calculated correctly
5. Check statistics are updated

You can test the API using:
- Interactive docs at http://localhost:8000/docs
- curl commands
- Postman or similar tools

## 🌐 Deployment

### Quick Deploy to Vercel (Recommended - Free!)

Deploy the entire full-stack app to Vercel in 3 steps:

```bash
# 1. Create free PostgreSQL database (Neon)
Visit neon.tech → Get DATABASE_URL

# 2. Initialize database tables
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql://...
python -c "from app.database import init_db; init_db()"

# 3. Deploy to Vercel
cd ..
vercel --prod
```

**📖 Deployment Guides:**
- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - 3-step Vercel deployment
- **[VERCEL_FULL_STACK.md](./VERCEL_FULL_STACK.md)** - Detailed Vercel guide
- **[RENDER_QUICK_START.md](./RENDER_QUICK_START.md)** - Render + Vercel deployment
- **[POSTGRESQL_MIGRATION.md](./POSTGRESQL_MIGRATION.md)** - PostgreSQL setup

### Database Options

**Local Development:**
- **SQLite** - Zero config, works out of the box ✅

**Production (Choose one):**
- **Neon** - Free PostgreSQL, 3GB storage (recommended)
- **Supabase** - Free 500MB with admin UI
- **Vercel Postgres** - Integrated with Vercel

## 💾 Database Support

This app supports both **SQLite** (local dev) and **PostgreSQL** (production):

```env
# Local development
DATABASE_URL=sqlite:///./data/review_tool.db

# Production (Neon example)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

No code changes needed - it auto-detects the database type!

## 📝 Future Enhancements

Potential features to add:

- [ ] Quality ratings (Easy/Good/Hard) to adjust intervals
- [ ] Study streaks tracking
- [ ] Export/import functionality
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick capture
- [ ] Tags system for better organization
- [ ] Advanced analytics and insights

## 🤝 Contributing

This is a personal learning tool, but feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use and modify as needed.

## 🙏 Acknowledgments

- Spaced repetition research by Piotr Wozniak (SuperMemo)
- Design inspiration from premium stationery brands
- Built with modern web technologies

---

**Happy Learning! 🚀📚**

*Remember: Consistency is key. Review regularly and watch your knowledge grow!*
