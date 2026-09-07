# TailorHub

A comprehensive web-based platform that connects customers with a network of professional tailors in their local area, featuring AI-powered styling and automated body measurement extraction.

## Overview

TailorHub simplifies the tailoring experience by providing an end-to-end solution for all tailoring needs.
*   **What the project does**: Allows customers to find tailors, book appointments, place custom orders, communicate in real-time, get AI style advice, and extract body measurements automatically from photos.
*   **The problem it solves**: Eliminates the hassle of searching for local tailors with uncertain quality, and digitizes appointment management, order tracking, and communication for tailoring businesses.
*   **Who it is for**: Customers seeking custom clothing or alterations, and professional tailors wanting to streamline their workflow and reach more clients.
*   **Main purpose**: To digitize the traditional tailoring industry, making it accessible, transparent, and highly efficient.

## Key Features

*   **User Authentication & Roles** — React + Node.js + Express + PostgreSQL + JWT + Google OAuth
*   **Tailor Discovery & Profiles** — React + Node.js + PostgreSQL
*   **Order Management & Tracking** — React + Node.js + PostgreSQL
*   **Real-time Chat & Notifications** — Node.js + Socket.io + React
*   **AI Style Advice** — Node.js + Google Gemini API
*   **Body Measurement Estimation** — Python + Flask + MediaPipe
*   **Invoicing & Feedback** — React + Node.js + PostgreSQL

## Technology Stack

| Part | Technology | Purpose |
| :--- | :--- | :--- |
| Frontend | React, Tailwind CSS, Framer Motion | User interface, styling, and animations |
| Backend | Node.js, Express.js | Core API, business logic, file handling |
| Database | PostgreSQL (Neon) | Persistent data storage |
| ML/AI | Python, Flask, MediaPipe, `@google/genai` | Body measurement estimation and AI style advice |
| Authentication | JWT, bcryptjs, `@react-oauth/google` | Secure access and session management |
| API | REST API, Socket.io | Client-server communication and real-time events |
| Deployment | Vercel, Render | Cloud hosting for frontend and backend/ML services |
| Testing | Jest | Basic React unit testing |

## Project Architecture

Frontend (React)
↓
Backend API (Node.js/Express)
↓ 
PostgreSQL Database

**For Real-time features:**
Frontend ↔ Socket.io ↔ Backend

**For ML/AI Measurement:**
Frontend
↓
Backend API
↓
Python Flask Service
↓
MediaPipe Model
↓
Measurement Result
↓
Backend API
↓
Frontend

**For AI Style Advice:**
Frontend
↓
Backend API
↓
Google Gemini API
↓
Style Result
↓
Frontend

## Project Structure

```text
TailorHub_Web/
├── client/          # React frontend application
├── python/          # Python Flask ML/AI service for body measurements
├── server/          # Node.js Express backend API
├── package.json     # Monorepo configuration
└── README.md        # Project documentation
```

*   `client/`: Contains all UI components, pages, routing, styling, and state management logic.
*   `python/`: Contains the independent Python microservice using MediaPipe to process images and return body measurements.
*   `server/`: Contains the REST API, database connection logic, authentication, sockets, and AI/ML proxy routes.

## Frontend

*   **Framework:** React (Create React App)
*   **Language:** JavaScript (JSX)
*   **UI/Component Structure:** Modular component-based architecture (`src/components`, `src/pages`)
*   **State Management:** React Context (`AuthContext`), React Hooks (`useState`, `useEffect`)
*   **API Integration:** Native `fetch` API for REST calls
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS
*   **Important Libraries:** Framer Motion (animations), Socket.io-client (real-time), `@react-oauth/google` (auth), `react-icons`

## Backend

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** JavaScript
*   **API Architecture:** RESTful
*   **Authentication:** JWT (JSON Web Tokens) stored in HTTP-only cookies, Google OAuth Library
*   **Middleware:** `express-rate-limit`, `cors`, `cookie-parser`, `multer` (file uploads)
*   **Business Logic:** Modularized into controllers and services (`server/controllers/ai.controller.js`, `server/services/gemini.service.js`)
*   **Error Handling:** Try-catch blocks with standardized JSON error responses

## Database

*   **Technology:** PostgreSQL (Hosted on Neon)
*   **Schema/Design:** Relational database with automatic table creation on startup.
*   **Main Entities:** `users`, `tailor_profiles`, `customer_profiles`, `offers`, `orders`, `order_status_history`, `messages`, `notifications`, `feedbacks`, `products`, `images`
*   **ORM/Query Tool:** Native `pg` driver (raw SQL queries)
*   **Migrations/Seeding:** Handled dynamically via `CREATE TABLE IF NOT EXISTS` inside `server.js` on boot.

## ML / AI

*   **Programming Language:** Python (Body Measurement), JavaScript (Style Advice)
*   **Libraries/Frameworks:** Flask, MediaPipe, OpenCV, Numpy, Pillow, `@google/genai`
*   **Model/Algorithm:** MediaPipe Pose Landmarker (Heavy) for extracting key body points. Circumference formulas based on cross-section approximation. Google Gemini 2.5 Flash for text-based style recommendations.
*   **Inference/Prediction:** Python service processes front/side images and height to estimate dimensions (Chest, Waist, Hip, Inseam, etc.).
*   **How backend communicates:** Node.js backend proxies `multipart/form-data` requests via `fetch` to the Python Flask service running independently.

## API

| Method | Endpoint | Purpose | Authentication Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Fetch current user session | Yes |
| POST | `/api/auth/google` | Google OAuth login/signup | No |
| GET | `/api/tailors` | Fetch tailor directory | No |
| POST | `/api/orders` | Create a new order | Yes (Tailor) |
| GET | `/api/orders/customer` | Get customer orders | Yes (Customer) |
| PUT | `/api/orders/:id/status` | Update order progress | Yes (Tailor) |
| POST | `/api/measurements/calculate`| Extract body measurements | Yes |
| POST | `/api/ai-style-advice` | Generate AI style recommendations | No |
| POST | `/api/add-feedback` | Submit order review | Yes |
| GET | `/api/chat/:userId` | Get chat history | Yes |

*(Note: This is a subset of the primary endpoints)*

## Authentication & Authorization

*   **Login & Registration:** Custom Email/Password and Google OAuth.
*   **Password Reset:** Secure token-based reset via Nodemailer.
*   **Session Management:** JWT stored securely in cookies.
*   **Role-Based Access Control (RBAC):** Users are restricted based on their role (`customer` vs `tailor`) using custom middleware.
*   **Password Hashing:** `bcryptjs`

## Environment Variables

**Backend (`server/.env`):**
```env
PORT=3000
NODE_ENV=development
PYTHON_MEASURE_URL=http://localhost:5001/measure
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3001
ALLOWED_ORIGINS=
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

**Frontend (`client/.env`):**
```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000
CLIENT_URL=http://localhost:3001
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Installation

1.  **Clone repository**
    ```bash
    git clone https://github.com/PRINCE-MEHTA91/TailorHub_web.git
    cd TailorHub_web
    ```

2.  **Install Node dependencies**
    ```bash
    npm run install:client
    npm run install:server
    ```

3.  **Setup ML environment (Python)**
    ```bash
    cd python
    pip install -r requirements.txt
    cd ..
    ```

4.  **Configure environment variables**
    Create and populate `.env` files in `client` and `server` folders based on the templates above.

5.  **Setup database**
    Start the server with a valid Neon `DATABASE_URL`. Tables are created automatically on the first run.

## Running the Project

**1. Start the ML Service (Python)**
```bash
cd python
python measure_server.py
```
*(Runs on port 5001 by default)*

**2. Start Frontend and Backend (Node)**
Open a new terminal at the project root:
```bash
npm run dev
```
*(Starts React on port 3001 and Express on port 3000)*

## Development Workflow

User
→ Frontend
→ Backend API
→ PostgreSQL Database / Python ML Service / Google Gemini API
→ Backend API
→ Frontend
→ User

## Testing

*   **Testing Framework:** Jest / React Testing Library (bundled with Create React App).
*   **Unit Tests:** Basic frontend rendering tests via `react-scripts test`.

## Deployment

*   **Frontend Platform:** Vercel
*   **Backend API Platform:** Render
*   **ML Service Platform:** Render (Independent web service deployed via `python/render.yaml`)
*   **Database Deployment:** Neon (Serverless Postgres)

## Future Improvements

*   Implement online payment gateways for processing order advances directly.
*   Enhance ML models for higher accuracy in non-standard body poses.
*   Add SMS notifications alongside emails.

## Contributors

Keep existing contributor information if present.

## License

ISC License

---

### Technology Summary

Frontend → React, Tailwind CSS, Framer Motion, Socket.io-client
Backend → Node.js, Express.js, Socket.io, Multer
Database → PostgreSQL (Neon, `pg` driver)
ML/AI → Python, Flask, MediaPipe, OpenCV, Google Gemini (`@google/genai`)
Authentication → JWT, bcryptjs, Google OAuth
Testing → Jest
Deployment → Vercel (Client), Render (API & Python Service)
