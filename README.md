# CRM — Customer Relationship Management

A full-stack Customer Relationship Management (CRM) application designed to manage customers, products, categories, and orders.

This project is being developed to practice modern web development, REST API design, database management, and frontend integration.

## 🚀 Project Overview

The goal of this project is to build a web-based CRM application that provides a centralized interface for managing customer information, products, and orders.

The application is being developed progressively, starting with the backend and then moving toward a modern, responsive frontend.

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- REST API

### Frontend
- HTML
- CSS
- JavaScript

**Planned frontend technologies:**
- React
- Vite
- Tailwind CSS
- shadcn/ui

## ✨ Planned Features

- Customer management
- Product management
- Category management
- Order management
- Dashboard with key statistics
- Search and filtering
- Responsive user interface
- Backend and database integration

*Features will be implemented and documented as development progresses.*

## 📁 Project Structure

```text
CRM/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd CRM
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend` directory for your local configuration.

Add the environment variables required by your application, according to the configuration used in `backend/index.js`.

Do not commit your `.env` file or publish database credentials.

### 4. Configure PostgreSQL

Make sure PostgreSQL is running and that the database and tables required by the application have been created.

### 5. Start the backend

Run the command configured in your `backend/package.json`. For example, if the entry point is `index.js`:

```bash
node index.js
```

### 6. Open the frontend

Open `frontend/index.html` in your browser while the backend is running.

The frontend integration and development workflow will evolve as the React version is implemented.

## 🗺️ Development Roadmap

- [x] Initialize the Git repository
- [x] Create the initial project structure
- [x] Save the initial version with Git
- [ ] Publish the project on GitHub
- [ ] Design the UI/UX with Figma
- [ ] Set up React and Vite
- [ ] Build the reusable dashboard layout
- [ ] Implement customer management
- [ ] Implement product and category management
- [ ] Implement order management
- [ ] Connect the frontend to the REST API
- [ ] Test and improve the application
- [ ] Deploy the application

## 🎯 Project Goals

- Improve full-stack development skills
- Understand frontend/backend communication
- Practice REST API integration
- Apply software engineering principles
- Build a portfolio-ready project

## 👩‍💻 Author

**Dina Kerrouche**

M2 ISIL Student | Future Software Engineer

GitHub: [@dina2023-dotcom](https://github.com/dina2023-dotcom)

---

*This project is under active development.*
