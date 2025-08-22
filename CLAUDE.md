# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based API statistics dashboard for monitoring Claude API usage. The application displays comprehensive API key usage statistics across four time dimensions (today, 7 days, monthly, total) with costs and rate limiting information through a single-page interface with authentication.

## Key Commands

**Important**: All commands must be run from the `api-statistics-dashboard/` directory.

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
2. `DashboardComponent` fetches comprehensive API usage data via `ApiService`
3. Four parallel API requests retrieve data for different time ranges (today, 7days, monthly, all)
4. `DataTransformer` processes and merges raw API data for unified display
5. Components use custom hooks (`useAuth`, `useSorting`, `useRetry`) for state management
6. Single-page layout displays all time dimensions simultaneously

### API Integration
- Proxied through Vite dev server (`/admin` → `https://cc.digix.icu`) for CORS handling
- Bearer token authentication with automatic retry logic
- **Multi-timerange data fetching**: Parallel requests to `/admin/api-keys?timeRange={today|7days|monthly|all}`
- Comprehensive error handling for network/auth/API errors (401/403/404/500/network)
- Auto-refresh every 5 minutes with configurable polling
- Environment variable support: `VITE_API_BASE_URL` for production deployments

## Development Notes

- All components are written in TypeScript with strict typing
- Chinese UI text throughout the application (uses antd zhCN locale)
- **Multi-dimensional data display**: Single interface shows today/7days/monthly/total data
- Export functionality generates comprehensive CSV files with all time dimensions
- Screenshot export captures complete dashboard for sharing
- Responsive design with mobile viewport support and 100 items per page default
- Error boundaries and loading states for robust UX
- Class-based `ApiService` for HTTP client management with interceptors
- Custom hooks pattern for reusable state logic (`useAuth`, `useSorting`, `useRetry`, `useResponsive`)

## Important Implementation Details

- Authentication tokens are stored in localStorage and validated on app init
- **Parallel API architecture**: Four simultaneous requests merge into unified data structure
- API service uses axios with request/response interceptors for auth and error handling
- Development proxy configuration handles CORS issues with external API
- **Comprehensive table columns**: Basic info + 4 time dimensions + daily averages (17 total columns)
- Three-state sorting: descending → ascending → no sort for all columns
- Component testing uses Playwright for E2E scenarios including mobile viewports
- Build process includes TypeScript compilation followed by Vite bundling