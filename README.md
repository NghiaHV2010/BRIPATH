# BriPath - AI-Driven Recruitment Platform

![Project Status](https://img.shields.io/badge/status-active-success)
![Node Version](https://img.shields.io/badge/node-v18%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**BriPath** là nền tảng tuyển dụng tích hợp AI, giải quyết bài toán khớp lệnh (matching) giữa hồ sơ ứng viên và tin tuyển dụng bằng công nghệ RAG và Vector Search.

🔗 **Live Demo:** [https://bripath.online](https://bripath.online)
🎥 **Demo Video:** [Link Youtube/Drive nếu có]

## 🚀 Key Features

* **AI Matching Engine:** Sử dụng **RAG (Retrieval-Augmented Generation)** và **Vector Embeddings** để so khớp ngữ nghĩa giữa CV và Job Description (thay vì chỉ so khớp từ khóa).
* **Career Assistant Chatbot:** Chatbot tư vấn hướng nghiệp được **Fine-tuned** trên dữ liệu riêng, tích hợp OpenAI API.
* **Performance Optimization:**
    * **Redis Caching** cho Master Data (Job Lists, User Profiles).
    * **Rate Limiting** & Request Timeouts để chống spam/DDoS.
* **Enterprise Security:**
    * Authentication: JWT (HTTP-Only Cookies).
    * Security: 2FA/TOTP, Email Verification (via Resend).
* **Payment:** Tích hợp cổng thanh toán tự động **SePay**.

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), TypeScript, TailwindCSS, Zustand |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL, VectorDB (pgvector), Redis |
| **AI/ML** | OpenAI API, Gemini API |
| **DevOps** | Docker, Vercel (FE), Render (BE) |
| **Services** | Firebase (Storage), Resend (Email), SePay (Payment) |
