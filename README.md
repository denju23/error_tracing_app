# 🐞 Web Error Logging & QA Bug Tracking Backend

This is the backend of a **Web Error Logging & QA Bug Tracking System** built with **Node.js**, **Express**, and **MongoDB**. It provides a robust RESTful API to log, track, and manage errors across different projects and assign them to QA teams.

## 🚀 Features

- 🧑 User registration, login, logout (JWT-based)
- 🔐 Secure password handling with reset functionality
- 📁 Project management (Create, update, delete, list) with Cloudinary-based image upload
- 🧪 QA Bug reporting by project and error ID
- 🧑‍🤝‍🧑 Team member management and invitation handling
- 🐞 Error logging with drag-and-drop status updates
- 📊 Dashboard endpoint for analytics
- 🛡️ Auth middleware for route protection
- 📦 Modular controller-service architecture
- ✉️ Forgot password system via email (SMTP)
- ☁️ Cloudinary integration for media storage (project images)
- 📄 Advanced request and error logging with Winston (with daily file rotation)

---

## ✅ Requirements

Make sure you have the following installed:

- [Node.js v18+](https://nodejs.org/) (tested with Node.js 18 or higher)
- [npm v9+](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud instance)
- [Postman](https://www.postman.com/) (for API testing)
- [Cloudinary Account](https://cloudinary.com/) (for media uploads)

---

## 🧱 Project Structure

