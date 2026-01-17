# RadiantAI - Radiology Insights UI

A modern medical radiology application built with React, TypeScript, and Tailwind CSS.

## Features

- Dashboard for radiology overview
- Patient management
- Medical studies tracking
- DICOM viewer
- AI-powered analysis
- Report generation
- Archive management
- System integrations

## Getting Started

### Prerequisites

- Node.js (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd radiant-insights-ui

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Linting
npm run lint             # Run ESLint
```

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Testing**: Vitest + React Testing Library

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Header, Sidebar, AppLayout)
│   └── ui/              # Reusable UI components (shadcn/ui)
├── pages/               # Page components for each route
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── test/                # Test setup and utilities
```

## License

All rights reserved.
