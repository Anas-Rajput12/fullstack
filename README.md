# Fullstack Campaign Dashboard

A modern fullstack application for managing marketing campaigns with AI-powered content generation.

## 🏗 Architecture

This repository contains two main services:

### Frontend (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

### Backend (`/backend`)
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: Zod

## 🚀 Quick Start

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## 📦 Environment Variables

Both services require `.env` files with appropriate configuration. See `.env.example` files for details.

## 📁 Project Structure

```
fullstack/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
│
└── backend/           # Express backend API
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   └── app.ts
    └── package.json
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **AI Service**: Python, FastAPI (deployed separately)

## 📝 License

MIT
