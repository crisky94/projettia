# 🚀 Projettia - Modern Project Management Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.1-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

**A full-stack, real-time collaborative project management application built with modern web technologies**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture)

</div>

---
## 📋 Overview

**Projettia** is a comprehensive project management platform designed for modern agile teams. It combines the power of Kanban boards, sprint planning, and real-time collaboration to streamline team workflows and boost productivity.

### 🎯 Key Highlights

- **Real-time Collaboration**: Live updates using WebSocket (Socket.IO)
- **Agile Workflow**: Kanban boards + Sprint management
- **Drag & Drop Interface**: Intuitive task organization with @dnd-kit
- **Responsive Design**: Premium dark-themed UI with Tailwind CSS
- **Secure Authentication**: Clerk-powered user management
- **Database**: PostgreSQL with Prisma ORM

---

## ✨ Features

### 🎨 **Modern UI/UX**
- Premium dark theme with glassmorphism effects
- Smooth animations and micro-interactions
- Fully responsive design (mobile, tablet, desktop)
- Accessible and keyboard-navigable

### 📊 **Project Management**
- **Kanban Board**: Visual task management with drag-and-drop
- **Sprint Planning**: Create and manage sprints with timeline tracking
- **Task Organization**: Status tracking (Pending, In Progress, Completed)
- **Time Estimation**: Task duration tracking and sprint velocity metrics

### 👥 **Team Collaboration**
- Multi-user project workspaces
- Role-based permissions (Admin, Member)
- Member invitation system
- Real-time updates across all team members

### 🔐 **Security & Authentication**
- Secure authentication with Clerk
- Protected API routes
- Role-based access control
- Session management

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: Next.js 13 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.3
- **Drag & Drop**: @dnd-kit
- **Notifications**: React Toastify
- **Icons**: Heroicons

### **Backend**
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Real-time**: Socket.IO
- **Authentication**: Clerk
- **ORM**: Prisma

### **Database**
- **Primary DB**: PostgreSQL
- **Schema Management**: Prisma Migrations

### **Development**
- **Language**: TypeScript
- **Linting**: ESLint
- **Package Manager**: npm/yarn/pnpm

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/projettia.git
cd projettia
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/projettia"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. **Open your browser**

Navigate to [http://localhost:3001](http://localhost:3001)

---

## 🏗 Architecture

### Project Structure

```
projettia/
├── app/
│   ├── api/              # API routes
│   ├── components/       # React components
│   │   ├── projects/     # Project-specific components
│   │   └── chat/         # Real-time chat components
│   ├── projects/         # Project pages
│   └── server.mjs        # WebSocket server
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── styles/               # Global styles
```

### Key Components

- **TaskBoard**: Kanban-style task management with drag-and-drop
- **SprintManager**: Sprint planning and timeline management
- **ProjectDashboard**: Overview of all projects and metrics
- **MinimizableChat**: Real-time team communication

---

## 🎯 Core Functionalities

### 1. **Project Management**
- Create, edit, and delete projects
- Invite team members via email
- Role-based permissions (Owner, Admin, Member)

### 2. **Task Management**
- Create tasks with descriptions and time estimates
- Assign tasks to team members
- Drag-and-drop status updates
- Filter and organize by sprints

### 3. **Sprint Planning**
- Create time-boxed sprints
- Assign tasks to sprints
- Track sprint progress and velocity
- View sprint analytics

### 4. **Real-time Collaboration**
- Live task updates
- Real-time notifications
- WebSocket-powered synchronization

---

## 🔒 Security Features

- **Authentication**: Secure user authentication with Clerk
- **Authorization**: Role-based access control
- **API Protection**: Protected API routes with middleware
- **Data Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries

---

## 📱 Responsive Design

Projettia is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥 Large screens (1920px+)

---

## 🎨 UI/UX Highlights

- **Dark Theme**: Modern, eye-friendly dark interface
- **Glassmorphism**: Frosted glass effects for depth
- **Smooth Animations**: Micro-interactions for better UX
- **Gradient Accents**: Purple/violet color scheme
- **Accessibility**: WCAG compliant with keyboard navigation

---

## 🚧 Future Enhancements

- [ ] Advanced analytics dashboard
- [ ] File attachments for tasks
- [ ] Calendar view for sprints
- [ ] Email notifications
- [ ] Export reports (PDF/CSV)
- [ ] Mobile app (React Native)
- [ ] Integration with third-party tools (Slack, GitHub)

---

## 📄 License

This project is private and proprietary.

---

## 👨‍💻 Developer

**Kenay Labrador**

- GitHub: [@crisky94](https://github.com/crisky94)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices:
- Next.js team for the amazing framework
- Vercel for deployment platform
- Clerk for authentication solution
- Prisma for database tooling

---

<div align="center">

**⭐ If you find this project interesting, please consider giving it a star!**

Made with ❤️ and ☕

</div>
