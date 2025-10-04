# DevConnect Backend

DevConnect is a **Node.js + Express + MongoDB** backend that powers a professional networking application where users can **connect, chat, and collaborate**.

---

##  Features

- **Authentication & Sessions**
  - Signup, login, and logout with JWT tokens stored in secure HTTP-only cookies.
  - Passwords hashed with `bcrypt`.

- **Profiles**
  - View and update user profiles.
  - Update bio, skills, avatar, and password (with validation).

- **Connections**
  - Send/accept/reject connection requests.
  - View incoming requests, outgoing requests, and current connections.
  - Feed system showing potential new connections.

- **Messaging**
  - Conversations auto-created when users start chatting.
  - Store messages with sender, receiver, and timestamps.
  - Real-time updates via **Socket.IO**.
  - Typing indicators and unread counters.

- **Security**
  - JWT authentication middleware (`isAuth`).
  - Strong password validation.
  - CORS with allowlist and credentials support.
  - Secure cookies in production.

---

##  Tech Stack

- **Runtime:** Node.js (Express)
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + bcrypt
- **Validation:** validator.js
- **Realtime Messaging:** Socket.IO
- **Middleware:** cors, cookie-parser

---

##  Project Structure

```
src/
 ├── config/            # Database configuration
 ├── middlewares/       # Authentication middleware
 ├── models/            # Mongoose models
 ├── routes/            # REST API routes
 ├── socket/            # Socket.IO logic
 ├── utils/             # Validation helpers
 ├── app.js             # Express app setup
 └── index.js           # Server entry point
```

---

##  API Overview

### Auth (`/auth`)
- `POST /signup`
- `POST /login`
- `POST /logout`

### Profile (`/profile`)
- `GET /view`
- `PATCH /edit`
- `PATCH /password`

### Requests & Connections
- `POST /requests/send/:status/:toUserId`
- `POST /requests/review/:status/:requestId`
- `GET /user/requests`
- `GET /user/connections`
- `GET /user/feed`

### Messaging (`/messages`)
- `GET /conversations`
- `GET /:conversationId`
- `POST /send`
- WebSocket events for realtime

---

##  Environment Variables

```
DB_URL=your-mongodb-url
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

---

##  Running Locally

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

---

##  Socket.IO Events

- `connect` / `disconnect`
- `message:new`
- `typing:start` / `typing:stop`
- `conversation:update`



