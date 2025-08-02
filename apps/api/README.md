# HardverGo API

Backend API for HardverGo, a marketplace platform where users can list and sell their used electronic devices including computers, laptops, computer parts, phones, and other electronic equipment.

## Description

This is a NestJS-based REST API that provides the backend services for the HardverGo marketplace. The platform enables users to:

- Create listings for electronic devices
- Browse and search available items
- Manage user accounts
- Organize products by categories
- Apply filters to find specific devices

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## API Documentation

The API provides comprehensive documentation through two interfaces:

### Swagger UI
Interactive API documentation is available at `/swagger` when the server is running. This provides a user-friendly interface to explore and test API endpoints.

### Scalar API Reference
A modern, alternative API documentation interface is available at `/reference`. This offers a clean, developer-friendly way to browse the API specification.

Both documentation interfaces are automatically generated from the OpenAPI specification and provide the same underlying API information with different user experiences.

## API Endpoints

The API includes the following main resource endpoints:

- `/users` - User management and authentication
- `/categories` - Device categories (computers, phones, etc.)
- `/items` - Product listings and management
- `/filters` - Search and filtering capabilities

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Documentation**: OpenAPI/Swagger with Scalar API Reference
- **Package Manager**: pnpm
