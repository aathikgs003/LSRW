# Implementation Plan - FluentPro AI LSRW Assessment Platform

## Overview
FluentPro is a multi-tenant SaaS platform for Listening, Speaking, Reading, and Writing (LSRW) assessment. This plan outlines the transition from the current minimal state to the full MySQL-powered, multi-tenant architecture.

## Phase 1: Foundation & Database Setup
1. [ ] **Environment Setup**:
    - Install dependencies: `prisma`, `@prisma/client`, `mysql2`, `dotenv`.
    - Configure `.env` for MySQL connection.
2. [ ] **Database Schema Design (Prisma)**:
    - `Organization`: Multi-tenant root.
    - `User`: Roles (Admin, Teacher, Student).
    - `Task`: Modules (L, S, R, W) with metadata.
    - `Question`: For Listening/Reading modules.
    - `Attempt`: Stores student submissions and AI results.
    - `Subscription`: SaaS plans.
3. [ ] **Prisma Integration**:
    - Initialize Prisma in `backend`.
    - Run migrations to create tables.

## Phase 2: Authentication & Multi-Tenancy
1. [ ] **Multi-Tenant Logic**:
    - Middleware to identify organization via subdomain or header.
    - Ensure all queries are scoped by `organization_id`.
2. [ ] **Authentication**:
    - JWT-based login and registration.
    - Role-based Access Control (RBAC) middleware (`isAdmin`, `isTeacher`, `isStudent`).
### Phase 1: Core Backend & Auth (COMPLETED)
- [x] Prisma Schema for Multi-tenancy
- [x] JWT Authentication & Tenant Middleware
- [x] AI Engine Basic Integration (Python Spawning)
- [x] Express Routes for Tasks & Attempts

### Phase 2: Frontend Foundation & Modules (COMPLETED)
- [x] Premium Landing Page
- [x] Multi-tenant Login/Register
- [x] Student Dashboard (Re-skin)
- [x] Writing Module (Editor + AI Analysis)
- [x] Listening Module (Audio + Quiz)
- [x] Reading Module (Passage + Quiz)
- [x] Speaking Module (Voice + AI Analysis)

### Phase 3: SaaS Admin & Analytics (COMPLETED)
- [x] Teacher Dashboard (Student Roster + Insights)
- [x] Admin Dashboard (System-wide Analytics)
- [x] Performance Reports (High-fidelity Detailed View)
- [x] Student History / Progress Tracking

## Phase 5: SaaS Features & Polish
1. [ ] **Subscription Model**:
    - Plan-based limits (AI calls, max students).
2. [ ] **Reporting**:
    - PDF export for performance reports.
3. [ ] **UI/UX Refinement**:
    - Modern, premium design (Tailwind + Recharts).
    - Dark mode support.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts.
- **Backend**: Node.js, Express, Prisma (MySQL).
- **AI**: Python (Speech-to-text, NLP).
- **Storage**: AWS S3 (for audio/uploads).
