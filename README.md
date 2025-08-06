<div align="center">

# 🔄 HardverGo

**A community-driven marketplace for used electronic devices**

*Built with transparency, security, and sustainability in mind*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Levine-IT/hardvergo)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-GPL-green)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/pnpm-workspace-orange)](https://pnpm.io/)

[🚀 Features](#features) • [⚡ Quick Start](#quick-start) • [🏗️ Architecture](#architecture) • [🛠️ Development](#development) • [🤝 Contributing](#contributing)

</div>

---

| ⚠️ WARNING           |
|:----------------------------|
| This repo is in active development, working on fundamental features yet, breaking changes are going to occur! |


## 📖 About

HardverGo is an open-source marketplace designed specifically for buying and selling used electronic devices. Our platform emphasizes **community-driven development**, **transparency**, and **security** to create a trusted environment for electronic device trading.

### 🎯 Mission
- **Sustainability**: Extend the lifecycle of electronic devices through responsible reselling
- **Community**: Foster a transparent, trustworthy trading community
- **Security**: Ensure safe transactions with comprehensive user verification
- **Open Source**: Build in the open with community contributions

## Features

### 🏪 Marketplace Core
- **Device Categories**: Comprehensive categorization system for electronics
- **Smart Search**: Advanced filtering with category-specific attributes
- **Flexible Pricing**: Support for negotiations and price agreements
- **Location-Based Trading**: Local pickup and shipping options

### 👥 Community & Trust
- **User Ranking System**: Progressive ranking from newbie to top dealer
- **Rating System**: Comprehensive buyer/seller rating mechanism
- **Secure Messaging**: Built-in communication for negotiations
- **Verification**: User activity tracking and verification systems

### 🎨 Rich Media Support
- **Media Listings**: Support for user uploaded images
- **Image Variants**: Optimized images in multiple formats (WebP, JPEG, PNG, AVIF)
- **Responsive Design**: Mobile-first approach with modern UI

### 🔐 Security & Transparency
- **Order Tracking**: Complete transaction lifecycle management
- **Audit Trails**: Comprehensive activity logging
- **Data Protection**: Secure handling of user data and transactions

## Architecture

HardverGo is built as a **Turborepo monorepo** with independently deployable applications:

```
hardvergo/
├── apps/
│   ├── api/          # NestJS Backend API
│   └── frontend/     # Next.js Frontend Application
└── packages/
    ├── typescript-config/  # Shared TypeScript configurations
    └── biome-config/      # Shared Biome linting/formatting
```

### Tech Stack

#### Backend (`apps/api`)
- **Framework**: NestJS with Express
- **Database**: PostgreSQL with Drizzle ORM
- **API Documentation**: Swagger + Scalar API Reference
- **Authentication**: JWT-based authentication (Auth0 integration)
- **Validation**: Class-validator for DTO validation

#### Frontend (`apps/frontend`)
- **Framework**: Next.js 15 with React 19
- **Styling**: TailwindCSS with Radix UI components (Shadcn UI)
- **Testing**: Vitest with Testing Library
- **UI Development**: Storybook for component development
- **State Management**: React hooks with custom utilities

#### Shared Infrastructure
- **Language**: TypeScript 100%
- **Package Manager**: PNPM with workspaces
- **Code Quality**: Biome for linting and formatting
- **Version Management**: Changesets for semantic versioning
- **Git Hooks**: Lefthook for pre-commit quality checks

## Quick Start

### Prerequisites

- **Node.js** >= 22.0.0 ([Download](https://nodejs.org/))
- **PNPM** >= 9.15.4 (`npm install -g pnpm`)
- **PostgreSQL** >= 14 for database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Levine-IT/hardvergo.git
   cd hardvergo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp apps/api/.env.example apps/api/.env
   # Edit apps/api/.env with your database configuration
   ```

4. **Set up the database**
   ```bash
   # Generate and run migrations
   cd apps/api
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start development servers**
   ```bash
   # From project root - starts both frontend and backend
   pnpm dev
   
   # Or start individually:
   pnpm dev --filter=api      # Backend only
   pnpm dev --filter=frontend # Frontend only
   ```

### 🌐 Access Points

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:3001>
- **API Documentation**: <http://localhost:3001/reference>
- **Storybook**: <http://localhost:6006> (run `pnpm storybook`)

## Development

### Available Commands

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev --filter=api       # Start backend only
pnpm dev --filter=frontend  # Start frontend only

# Building
pnpm build                  # Build all apps for production
pnpm build --filter=api     # Build backend only

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix              # Fix linting issues
pnpm format                # Format code with Biome
pnpm type-check            # TypeScript type checking

# Testing
pnpm test                  # Run all tests
pnpm test --filter=frontend # Run frontend tests only

# Database Operations
cd apps/api
pnpm db:generate           # Generate database migrations
pnpm db:migrate            # Run database migrations  
pnpm db:push               # Push schema changes to database

# Versioning
pnpm changeset             # Create a changeset for version management
pnpm changeset:version     # Update versions based on changesets
```

### Database Schema

The application uses a comprehensive PostgreSQL schema supporting:

- **Users** with progressive ranking system
- **Categories** with hierarchical structure and dynamic attributes
- **Listings** with rich media support and flexible attributes
- **Orders** with complete transaction lifecycle
- **Ratings** and **Activity Tracking** for community trust

### Code Standards

- **TypeScript**: Strict mode enabled across all packages
- **Biome**: Unified linting and formatting (replaces ESLint + Prettier)
- **Testing**: Comprehensive test coverage with Vitest
- **Git Hooks**: Automatic formatting and linting on commit
- **Semantic Versioning**: Changesets for version management

## 📚 API Documentation

Comprehensive API documentation is available at:
- **Interactive Docs**: <http://localhost:3001/reference> (when running locally)
- **Swagger/OpenAPI**: Auto-generated from NestJS decorators
- **Scalar UI**: Modern, interactive API reference

### Key API Endpoints

- `POST /api/users` - User registration
- `GET /api/categories` - Browse device categories
- `POST /api/listings` - Create new listings
- `GET /api/listings` - Search and filter listings
- `POST /api/orders` - Place orders

## 🚀 Deployment

Both applications are designed for independent deployment:

### Backend Deployment
- **Environment**: Node.js runtime with PostgreSQL database
- **Build**: `pnpm build --filter=api`
- **Start**: `pnpm start --filter=api`

### Frontend Deployment
- **Platform**: Vercel, Netlify, or any Node.js hosting
- **Build**: `pnpm build --filter=frontend`
- **Static Export**: Supports static site generation

### Environment Variables

Refer to `.env.example` files in each app directory for required environment variables.

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- **Development Workflow**: Feature branches, pull requests, and code review
- **Code Standards**: TypeScript, Biome configuration, and testing requirements
- **Versioning**: Semantic versioning with changesets
- **Community Guidelines**: Code of conduct and communication standards

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run quality checks: `pnpm lint && pnpm test`
5. Create a changeset: `pnpm changeset`
6. Commit and push your changes
7. Open a Pull Request

## 📄 License

This project is licensed under the GPL v3 License - see the [LICENSE](LICENSE) file for details.

## 🌟 Community & Support

- **Issues**: [GitHub Issues](https://github.com/Levine-IT/hardvergo/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/Levine-IT/hardvergo/discussions)
- **Contact**: info@hardvergo.hu

---

<div align="center">

**Built with ❤️ by the HardverGo community**

*Promoting sustainable technology through community-driven marketplace solutions*

</div>
