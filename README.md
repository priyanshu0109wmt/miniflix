# 🎬 MiniFlix – Full Stack Netflix Clone

A full-stack Netflix-inspired movie streaming web application built using **HTML, CSS, JavaScript, Node.js, Express.js, MySQL (TiDB Cloud), Stripe, Render, and Netlify**.

The application allows users to browse movies, manage a personal watchlist, stream videos, purchase subscription plans through Stripe, and provides an admin dashboard for movie management.

---

# 🌐 Live Demo

## Frontend
https://miniflix12.netlify.app

## Backend API
https://miniflix-backend.onrender.com

---

# ✨ Features

## Authentication
- User Registration
- User Login
- JWT Authentication
- Secure Password Hashing
- Protected Routes

## Movie Management
- Browse Movies
- Movie Details
- Video Streaming
- Search Movies
- Continue Watching

## Watchlist
- Add to Watchlist
- Remove from Watchlist
- Personalized Watchlist

## Subscription
- Subscription Plans
- Stripe Checkout
- Payment Verification
- Subscription Status

## User Features
- Profile Management
- Watch Progress
- Movie Ratings
- Notifications

## Admin Panel
- Add Movies
- Edit Movies
- Delete Movies
- Manage Movie Catalog

---

# 🛠 Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript (ES6)

## Backend
- Node.js
- Express.js

## Database
- TiDB Cloud (MySQL)

## Authentication
- JWT
- bcrypt

## Payment Gateway
- Stripe

## Deployment
- Frontend → Netlify
- Backend → Render
- Database → TiDB Cloud

---

# 📂 Project Structure

```
MiniFlix
│
├── backend
│   ├── config
│   ├── middleware
│   ├── routes
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── public
│   ├── assets
│   ├── css
│   ├── js
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── movie.html
│   ├── watch.html
│   ├── mylist.html
│   ├── pricing.html
│   ├── profile.html
│   └── admin.html
│
└── database
```

---

# 🗄 Database Tables

- users
- movies
- watchlist
- plans
- watch_progress
- ratings
- notifications

---

# 📸 Screenshots

## 🏠 Home Page

<img width="1919" height="1149" alt="image" src="https://github.com/user-attachments/assets/c06af85f-84c4-4f80-89c1-fa31c30af6f1" />


---

## 🔐 Login Page

<img width="1917" height="842" alt="image" src="https://github.com/user-attachments/assets/8f94a32d-f6aa-4bb3-a742-8dac4edf4c3f" />


---

## 📝 Signup Page

<img width="1919" height="986" alt="image" src="https://github.com/user-attachments/assets/d4d0fde1-61f2-41cd-898a-dcaf16774e75" />


---

## 🎬 Movie Details

<img width="1915" height="1100" alt="image" src="https://github.com/user-attachments/assets/502c7edd-113f-4845-beee-5a80f274d153" />


---

## ▶ Video Player

<img width="1919" height="1105" alt="image" src="https://github.com/user-attachments/assets/1262d2be-c53b-4b27-a525-781593cb6a59" />


---

## ❤️ Watchlist

<img width="1906" height="732" alt="image" src="https://github.com/user-attachments/assets/88fa5893-3d0e-47bb-907e-27e8bd8c66f6" />


---

## 🔍 Search

<img width="1915" height="931" alt="image" src="https://github.com/user-attachments/assets/eaf442bb-3351-4703-b018-9a71470a1e90" />


---

## 👤 Profile

<img width="1917" height="874" alt="image" src="https://github.com/user-attachments/assets/2602a35d-6717-4052-b93d-289f95d4d98e" />


---

## 💳 Subscription Plans

<img width="1917" height="1057" alt="image" src="https://github.com/user-attachments/assets/7a3cdb7a-1ac8-4374-afab-1feee1b54140" />


---

## 💰 Stripe Checkout

<img width="1919" height="1199" alt="image" src="https://github.com/user-attachments/assets/92476022-1f87-483f-9d02-2f9810dbafbb" />


---

## ✅ Payment Success

<img width="1916" height="995" alt="image" src="https://github.com/user-attachments/assets/4f93c7f3-88cc-43d7-8ce5-44c2e4bdb31a" />


---

## ⚙ Admin Dashboard

<img width="1918" height="1097" alt="image" src="https://github.com/user-attachments/assets/907c249d-6487-4b61-b341-c57c1b91d3ef" />


---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/priyanshu0109wmt/miniflix.git
```

## Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

DB_HOST=YOUR_DATABASE_HOST
DB_PORT=4000
DB_USER=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=miniflix

JWT_SECRET=YOUR_SECRET

STRIPE_SECRET_KEY=YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

FRONTEND_URL=http://localhost:5500
```

Run backend:

```bash
npm run dev
```

---

# Deployment

## Backend

Render

## Frontend

Netlify

## Database

TiDB Cloud

---

# API Endpoints

## Authentication

```
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

## Movies

```
GET /api/movies
GET /api/movies/:id
POST /api/movies
PUT /api/movies/:id
DELETE /api/movies/:id
```

## Watchlist

```
GET /api/watchlist
POST /api/watchlist
DELETE /api/watchlist/:id
```

## Subscription

```
GET /api/plans
POST /api/payments/create-checkout-session
POST /api/payments/verify
```

---

# Future Improvements

- Email Verification
- Forgot Password
- OAuth Login (Google/GitHub)
- AI Movie Recommendations
- Multi-language Support
- Dark/Light Theme
- Responsive Mobile UI
- Real-Time Notifications
- Movie Reviews
- Recommendation Engine

---

# Author

**Priyanshu**

GitHub:
https://github.com/priyanshu0109wmt

---

# License

This project is built for educational and portfolio purposes.
