# Spaced Repetition Review Tool - Backend

FastAPI backend for the spaced repetition learning review system.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and adjust settings if needed:

```bash
cp .env.example .env
```

### 3. Run the Server

```bash
cd backend
python -m uvicorn app.main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py                   # FastAPI app entry
│   ├── config.py                 # Configuration
│   ├── database.py               # Database setup
│   ├── models/                   # SQLAlchemy models
│   ├── schemas/                  # Pydantic schemas
│   ├── api/v1/                   # API endpoints
│   ├── services/                 # Business logic
│   ├── repositories/             # Data access layer
│   └── core/                     # Core utilities
├── data/                         # SQLite database
├── requirements.txt
└── .env
```

## API Endpoints

### Learning Items
- `POST /api/v1/learning-items` - Create new item
- `GET /api/v1/learning-items` - List all items
- `GET /api/v1/learning-items/{id}` - Get single item
- `PUT /api/v1/learning-items/{id}` - Update item
- `DELETE /api/v1/learning-items/{id}` - Delete item
- `GET /api/v1/learning-items/subjects` - Get all subjects

### Reviews
- `GET /api/v1/reviews/due` - Get items due for review
- `POST /api/v1/reviews/{item_id}` - Mark item as reviewed
- `GET /api/v1/reviews/history/{item_id}` - Get review history
- `GET /api/v1/reviews/stats` - Get statistics

## Spaced Repetition Algorithm

Review intervals:
- Day 0: Same day (initial learning)
- Day 1: Next day
- Day 3: 3 days later
- Day 7: 7 days later
- Day 30: 30 days later (cycles back to Day 7 after this)

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

Follow PEP 8 style guidelines.
