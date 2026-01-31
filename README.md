# LawMate — Digital Legal Assistance Platform

LawMate is a multi-platform legal assistance system designed to connect citizens with verified lawyers through secure, scalable, and user-friendly web and mobile applications. The platform supports legal consultations, lawyer discovery, appointment scheduling, messaging, and AI-assisted guidance.

This repository is structured as a **monorepo** containing all LawMate applications: backend API, web frontend, mobile app, and marketing website.

---

## 📦 Monorepo Structure

```
LawMate/
├── LawMateBackend/      → ASP.NET Core (.NET 8) Web API
├── LawMateWeb/          → React + TypeScript Web App
├── LawMateMobile/       → React Native Mobile App
├── MarketingWebsite/    → React + TypeScript Marketing Site
├── .gitignore
└── README.md
```

---

## 🚀 Applications Overview

### 🔹 LawMateBackend
**Technology:** .NET 8, ASP.NET Core Web API, EF Core, SQL Server  
**Purpose:** Core backend services and REST APIs

**Features**
- JWT authentication
- Role-based access control
- Lawyer & citizen management
- Appointment handling
- Messaging endpoints
- Document upload
- Secure API layer for web + mobile
- Swagger API documentation

---

### 🔹 LawMateWeb
**Technology:** React + TypeScript  
**Purpose:** Main web platform

**Features**
- Multi-role dashboards
- Lawyer search & filtering
- Appointment booking
- Messaging interface
- Document uploads
- Admin verification workflows

---

### 🔹 LawMateMobile
**Technology:** React Native  
**Purpose:** Cross-platform mobile app

**Features**
- Citizen & lawyer access
- Appointment management
- Chat & notifications
- Secure login
- Mobile-optimized workflows

---

### 🔹 MarketingWebsite
**Technology:** React + TypeScript  
**Purpose:** Public marketing and awareness website

**Features**
- Platform introduction
- Feature highlights
- Contact forms
- Get Started → redirects to LawMate Web login

---

## 🧱 Technology Stack

### Backend
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- Swagger

### Web Frontend
- React
- TypeScript
- MUI / Ant Design
- Axios
- React Router

### Mobile
- React Native
- React Navigation
- Secure Storage APIs

### DevOps & Tools
- GitHub Monorepo
- GitHub Actions (planned)
- Postman
- Figma
- Jira

---

## 🔐 Security Features

- JWT token authentication
- Role-based authorization
- HTTPS enforcement
- Secure file uploads
- Input validation middleware
- Encrypted sensitive data

---

## 🤖 Smart Features

- AI-assisted legal guidance chatbot
- Rule-based recommendation model
- Smart lawyer matching
- Category-based legal routing

---

## ⚙️ Local Development Setup

### ✅ Prerequisites

Install:

- .NET 8 SDK
- Node.js (LTS)
- npm
- SQL Server
- Visual Studio / Rider
- VS Code
- React Native CLI

---

## ▶️ Run Backend

```bash
cd LawMateBackend
dotnet restore
dotnet build
dotnet run
```

Swagger:
```
https://localhost:<port>/swagger
```

---

## ▶️ Run Web App

```bash
cd LawMateWeb
npm install
npm run dev
```

---

## ▶️ Run Marketing Site

```bash
cd MarketingWebsite
npm install
npm run dev
```

---

## ▶️ Run Mobile App

```bash
cd LawMateMobile
npm install
npx react-native run-android
```

---

## 🌐 Cross-Project Navigation

Marketing site → LawMate Web login redirect example:

```javascript
window.location.href = "https://app.lawmate.com/login"
```

Separate React projects communicate via URL redirects and shared APIs.

---

## 🧪 Testing Strategy

- Unit testing
- API testing
- Integration testing
- Security testing
- Performance testing
- Usability testing

---

## 📊 Success Benchmarks

- API response < 500ms
- Page load < 2s
- Crash rate < 1%
- UX rating target ≥ 4.5 / 5

---

## 🌿 Branch Strategy

```
main       → production
develop    → integration
feature/*  → features
hotfix/*   → bug fixes
qa         → testing
```

---

## 👩‍💻 Contributor

```
- Gihan Kanishka
- Devindi Nimalrathna 
- Namal Ishara
- Pasindu Kaushalya
- Shavindi Liyanage
- Benuri Palihakkara
```
---

## 📄 License

Academic / Research Project — LawMate Platform
