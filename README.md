# HomeMate 🏠

> Find Rooms & Compatible Roommates with Ease.

HomeMate is a full-stack modern web platform built for urban living, connecting room seekers with compatible roommates and verified room listings.

## ✨ Features

- **Room Discovery**: Search and filter verified rooms by city, rent budget, and amenities.
- **Roommate Matching**: Filter candidates by budget, lifestyle, dietary preference, and location.
- **Detailed Profiles**: Rich roommate profiles with occupation, habits, and preferences.
- **Direct Requests**: Send and manage room and roommate requests with real-time status updates.
- **Reviews & Ratings**: Transparent user feedback on rooms and owners.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express 5, Multer, MySQL2
- **Database**: MySQL

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)

### Setup & Run Locally

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Configure Environment**:
   Create a `.env` file in `backend/` with your database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=homemate2
   ```

3. **Initialize Database**:
   ```bash
   npm run setup:db
   ```

4. **Start the Application**:
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in your browser.
