# NestJS GraphQL Authentication API

This project implements a RESTful API service using NestJS with TypeScript that supports user authentication (standard and biometric), registration, and utilizes Prisma as the ORM. The API is exposed through GraphQL.

## Features

- User registration with email and password
- Standard login with email and password
- Biometric login with a biometricKey
- JWT-based authentication
- GraphQL API
- Prisma ORM with PostgreSQL

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- npm or yarn

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/Likeaprayer/biometric-test-task
cd biometric-test-task
```

### 2. Environment variables

Copy the example env file and update it with your settings:

```bash
cp .env.example .env
```

### 3. Start PostgreSQL database

```bash
docker-compose up -d
```

### 4. Install dependencies

```bash
npm install
```

### 5. Generate Prisma client and run migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Start the application

```bash
npm run start:dev
```

The GraphQL playground will be available at `http://localhost:3000/graphql`.

## Database Schema

The database schema is defined in the `prisma/schema.prisma` file:

```prisma
model User {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String   @unique
  password      String
  biometricKey  String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## Authentication Flow

### Registration

1. User submits email and password through the `register` mutation
2. Password is hashed using bcrypt
3. User is created in the database
4. JWT token is generated and returned with the user data

### Standard Login

1. User submits email and password through the `login` mutation
2. System finds the user by email
3. Password is verified against the stored hash
4. JWT token is generated and returned with the user data

### Biometric Login

1. User submits biometricKey through the `biometricLogin` mutation
2. System finds the user by biometricKey
3. JWT token is generated and returned with the user data

### Adding a Biometric Key

1. Authenticated user submits a biometricKey through the `addBiometricKey` mutation
2. System checks if the biometricKey is already in use
3. User record is updated with the biometricKey
4. JWT token is regenerated and returned with the updated user data


## Testing

Run the unit tests:

```bash
npm test
```

Run the tests with coverage:

```bash
npm run test:cov
```

A schema.qraphql file is also available at the root of the project for Introspection

## Security Considerations

- Passwords are hashed using bcrypt
- Authentication is implemented using JWT tokens
- Biometric keys are stored as unique values in the database
- GraphQL endpoints are protected using JWT authentication guards
- Validation is performed on all inputs using class-validator
