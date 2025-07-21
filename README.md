# 🛒 E-Commerce RESTful API

This is a full-featured backend API for an E-Commerce platform built with **Node.js**, **Express**, and **MongoDB**.  
It includes user authentication, product management, cart functionality, order processing, and payment integration with **Paymob**.

---

## 🚀 Features

- ✅ User registration and login (JWT)
- 🔐 Role-based access (Admin/User)
- 🛍️ Product CRUD operations
- 🛒 Cart management
- 📦 Order creation and tracking
- 💳 Paymob payment gateway integration
- 🔁 Webhook for transaction status updates
- 🔍 Product filtering, sorting, and pagination

---

## 🛠️ Tech Stack

### 🧪 Languages & Runtime

- JavaScript (ES6)
- Node.js

### 📚 Frameworks & Libraries

- Express.js
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- express-validator
- axios

### 🗄️ Database

- MongoDB (Local or MongoDB Atlas)

### 💳 Payment Gateway

- Paymob (token, order, payment key, iframe, callback)

### 🧰 Dev Tools

- Nodemon
- Postman
- Git

---

## 📁 Project Structure

.
├── controllers/ # Business logic
├── routes/ # Route definitions
├── models/ # Mongoose schemas
├── middlewares/ # Auth & error handling
├── config/ # Paymob configs
├── utils/ # Utility functions
├── app.js # Express setup
├── server.js # Server entry point
└── .env # Environment variables

yaml
Copy
Edit

---

## ⚙️ Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
PAYMOB_HMAC_SECRET=your_hmac
```
