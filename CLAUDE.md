# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RadiantAI (radiant-insights-ui) is a medical radiology application built with React and TypeScript. The application provides a dashboard for managing radiology studies, patient information, AI-powered analysis, and DICOM image viewing.

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linting
npm run lint

# Run tests (single run)
npm test

# Run tests in watch mode
npm run test:watch

# Preview production build
npm run preview
```

## Architecture

### Core Structure

- **Entry Point**: `src/main.tsx` renders the root `App` component
- **Routing**: React Router v6 with all routes defined in `src/App.tsx`
- **Layout**: All pages wrapped in `AppLayout` component which provides Header + Sidebar layout
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with custom medical-themed design tokens

### Application Routes

All routes are defined in `src/App.tsx:28-38`:
- `/` - Dashboard
- `/patients` - Patient management
- `/studies` - Medical studies
- `/viewer` - DICOM viewer
- `/analysis` - AI analysis
- `/reports` - Report generation
- `/archive` - Archive management
- `/integrations` - System integrations
- `/settings` - Application settings
- `*` - 404 Not Found page

### Component Organization

**Layout Components** (`src/components/layout/`):
- `AppLayout.tsx` - Main layout wrapper with Header + Sidebar
- `Header.tsx` - Top navigation bar
- `Sidebar.tsx` - Left navigation sidebar

**UI Components** (`src/components/ui/`):
- Extensive shadcn/ui component library (40+ components)
- Custom medical components:
  - `stat-card.tsx` - Dashboard statistics with variants (default, accent, warning, success)
  - `status-indicator.tsx` - System health indicators

**Page Components** (`src/pages/`):
- Each route has a corresponding page component
- Pages use a consistent structure with headers and content sections

### Path Aliases

The project uses `@/*` path alias for imports:
- `@/` maps to `src/`
- Configured in `tsconfig.json` and `vite.config.ts`

Example: `import { Button } from "@/components/ui/button"`

### Styling System

**Design Tokens** (defined in `src/index.css`):
- **Medical color palette**: Deep navy primary, teal accents
- **Status colors**: success (green), warning (yellow), error (red), info (blue)
- **Custom CSS classes**:
  - `.stat-card` - Dashboard statistics cards
  - `.medical-card` - Medical content cards
  - `.status-badge-*` - Status badges (success/warning/error/info)
  - `.viewer-toolbar` - DICOM viewer controls
  - `.medical-gradient`, `.accent-gradient` - Background gradients

**Custom animations** (in `tailwind.config.ts`):
- `animate-fade-in` - Fade in animation
- `animate-slide-in-right` - Slide from right
- `animate-scale-in` - Scale up animation
- `animate-pulse-subtle` - Subtle pulsing

### Utility Functions

`src/lib/utils.ts` provides:
- `cn()` - Combines clsx and tailwind-merge for conditional class names

### Testing

- **Framework**: Vitest with jsdom environment
- **Test files**: Located in `src/test/` or colocated with `*.test.ts(x)` pattern
- **Setup**: Global test setup in `src/test/setup.ts`
- Testing library: React Testing Library included

## TypeScript Configuration

- **Relaxed mode**: TypeScript is configured with relaxed settings (`noImplicitAny: false`, `strictNullChecks: false`)
- Path aliases configured for `@/*` imports
- Separate configs for app (`tsconfig.app.json`) and node (`tsconfig.node.json`)

## Build Tool

- **Vite** with React SWC plugin for fast builds
- Development server on port 8080 with IPv6 support
- HMR overlay disabled

## Medical Application Context

This is a **radiology/medical imaging application** with specific domain concepts:
- DICOM image viewing
- AI-powered analysis (references to "MedGemma Engine")
- Patient management and privacy considerations
- Study workflow (pending, complete, review statuses)
- Offline-first capabilities with sync functionality
- System health monitoring for medical services

When adding features, maintain the professional medical aesthetic and be mindful of healthcare data sensitivity.
