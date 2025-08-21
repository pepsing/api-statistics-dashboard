# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based API statistics dashboard for monitoring Claude API usage. The application displays API key usage statistics, costs, and rate limiting information through a web interface with authentication.

## Key Commands

### Development
- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Testing
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI mode
- `npm run test:e2e:report` - Show Playwright test report

## Project Structure

The main application is located in `api-statistics-dashboard/` directory:

### Core Architecture
- **React 19 + TypeScript + Vite** - Modern React setup with fast development
- **Ant Design (antd)** - UI component library with Chinese localization
- **Axios** - HTTP client with interceptors for API communication
- **Authentication Flow** - Token-based auth with automatic validation

### Key Directories
- `src/components/` - Modular React components organized by feature
- `src/services/` - API service layer and data transformation logic  
- `src/types/` - TypeScript type definitions for API and app data
- `src/hooks/` - Custom React hooks for reusable logic

### Data Flow
1. Authentication through `AuthComponent` validates tokens
2. `DashboardComponent` fetches API usage data via `ApiService`
3. `DataTransformer` processes raw API data for table display
4. Components use custom hooks (`useAuth`, `useSorting`, `useRetry`) for state management

### API Integration
- Proxied through Vite dev server (`/admin` → `https://cc.digix.icu`)
- Bearer token authentication with automatic retry logic
- Comprehensive error handling for network/auth/API errors
- Auto-refresh every 5 minutes

## Development Notes

- All components are written in TypeScript with strict typing
- Chinese UI text throughout the application
- Export functionality generates CSV files with Chinese headers
- Responsive design with mobile viewport support in testing
- Error boundaries and loading states for robust UX