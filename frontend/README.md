# Spaced Repetition Review Tool - Frontend

Beautiful, refined frontend for the spaced repetition learning system.

## Features

- **Dashboard**: Overview of items due for review and statistics
- **Review Interface**: Spaced repetition review session
- **Add Items**: Create new learning items
- **Browse Items**: View and manage all learning items
- **Filter by Subject**: Organize items by category

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Design Philosophy

This frontend features a "Refined Study Space" aesthetic with:

- **Typography**: Fraunces (display serif) and DM Sans (body)
- **Colors**: Warm neutrals (cream, terracotta) with navy accents
- **Feel**: Calm, focused, sophisticated
- **Animations**: Smooth, purposeful transitions using Framer Motion
- **Layout**: Generous spacing, card-based design

## Project Structure

```
src/
├── components/         # Reusable components
│   └── Navigation.tsx  # Main navigation bar
├── pages/              # Main pages
│   ├── Dashboard.tsx   # Home page with stats and due items
│   ├── ReviewPage.tsx  # Review interface
│   ├── AddItem.tsx     # Add new item form
│   └── AllItems.tsx    # Browse all items
├── services/           # API communication
│   └── api.ts          # Backend API calls
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
├── App.tsx             # Main app component with routing
└── index.css           # Global styles
```

## Building for Production

```bash
npm run build
```

The optimized files will be in the `dist` directory.
