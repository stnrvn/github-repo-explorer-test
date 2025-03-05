# GitHub Repositories Explorer

## Project Overview

A modern React application that enables users to search for GitHub users and explore their repositories. This project demonstrates best practices in React development, state management, and API integration while providing a seamless user experience.

## Features

- Search for GitHub users by username
- Display up to 5 users with similar usernames
- View repositories for selected GitHub users
- Responsive design for mobile and desktop
- Real-time search results
- Error handling and loading states

## Technical Architecture

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: Redux Toolkit with Redux Saga for complex state flows
- **Styling**: Tailwind CSS for utility-first styling
- **Testing**: Jest and React Testing Library for unit tests, Cypress for E2E testing
- **API Integration**: GitHub REST API via Octokit
- **Code Quality**: ESLint and Prettier for consistent code style

### Architecture Overview
The application follows a feature-based architecture with clear separation of concerns:

```
src/
├── api/          # API integration and services
├── components/   # Reusable UI components
├── features/     # Feature-based modules
├── hooks/        # Custom React hooks
├── store/        # Redux store configuration
├── types/        # TypeScript type definitions
└── utils/        # Utility functions
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Setup Steps

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd github-repos-explorer
   ```

2. Install dependencies:
   ```bash
   yarn
   ```

3. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   ```

4. Add your GitHub API token to the `.env` file:
   ```
   VITE_GITHUB_API_TOKEN=your_token_here
   ```

## Development Environment

### Starting the Development Server

```bash
yarn dev
```
The application will be available at `http://localhost:5173`

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn test` - Run Jest tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Generate test coverage report


### Development Workflow

1. Fork the repository
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Write or update tests as needed
5. Run tests and ensure all pass:
   ```bash
   yarn test
   yarn cypress:run
   ```
6. Commit your changes following conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```
7. Push to your fork and submit a pull request

### Code Style Guidelines

- Follow the ESLint and Prettier configurations
- Write meaningful commit messages following conventional commits
- Include tests for new features
- Update documentation as needed

### Pull Request Process

1. Ensure all tests pass
2. Update the README.md with details of changes if applicable
3. Request review from at least one maintainer
4. Merge after approval

## Environment Configuration

### Local Development
1. Copy `.env.example` to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   - `VITE_GITHUB_API_TOKEN`: Your GitHub Personal Access Token
   - `VITE_API_BASE_URL`: GitHub API base URL (default: https://api.github.com)
   - `VITE_NODE_ENV`: Environment (development/production)

### GitHub Deployment
For deploying to GitHub Pages or using GitHub Actions:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following repository secrets:
   - `GITHUB_TOKEN`: Automatically provided by GitHub
   - `VITE_GITHUB_API_TOKEN`: Your GitHub Personal Access Token
   
Example GitHub Actions workflow for deployment:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: yarn install
        
      - name: Build
        env:
          VITE_GITHUB_API_TOKEN: ${{ secrets.VITE_GITHUB_API_TOKEN }}
          VITE_NODE_ENV: production
        run: yarn build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

