# AI-Powered Movie Recommendation System (MERN Stack + HCI/UI-UX)

An AI-Powered Movie Recommendation System built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and modern HCI/UI-UX principles based on the Software Requirements Specification (SRS).

## Features
- **User Authentication**: JWT-based Signup & Login with password hashing and role management (User vs. Admin).
- **Movie Catalog & Search**: Instant multi-criteria search (title, genre, cast, director) and dynamic genre filtering.
- **5-Star Rating & Reviews**: Interactive rating widget with user feedback logs.
- **AI Recommendation Engine**:
  - **Content-Based Filtering**: Recommends movies matching genres, cast, and directors from positive ratings & watchlist.
  - **Collaborative Filtering**: Finds cinephiles with similar taste matrix and recommends their top picks.
  - **Hybrid Fusion Engine**: Blends content-based, collaborative, and rating baselines.
  - **Cold-Start Strategy**: Provides trending & high-rated recommendations for new users.
- **Watchlist Management**: Add/remove movies to personalized user watchlist.
- **Admin Dashboard**: Manage movie catalog (CRUD), user accounts, and view rating/feedback statistics.
- **HCI/UI-UX Design**: Cinema dark mode theme, glassmorphism cards, micro-interactions, responsive grid, toast notifications, skeleton loaders.

## Tech Stack
- **Frontend**: React.js, Vite, React Router v6, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, JWT, BcryptJS, CORS, Morgan
- **Database**: MongoDB, Mongoose ORM

## Installation & Setup

1. **Prerequisites**: Ensure Node.js (v18+) and MongoDB are installed and running.

2. **Clone & Install Dependencies**:
   ```bash
   # Server installation
   cd server
   npm install

   # Client installation
   cd ../client
   npm install
   ```

3. **Seed Initial Data**:
   ```bash
   cd server
   npm run seed
   ```

4. **Run Server & Client**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

5. **Python ML Pipeline (Optional / Machine Learning Submission)**:
   ```bash
   # Train the SVD + TF-IDF Hybrid Model
   python -m ml_pipeline.train

   # Evaluate ML metrics (RMSE, MAE, latency benchmark)
   python -m ml_pipeline.evaluate

   # Start the Python ML FastAPI inference server
   python -m uvicorn ml_pipeline.service:app --port 8000
   ```

6. **Demo Accounts**:
   - **Admin Account**: Email: `admin@movieai.com`, Password: `adminpassword123`
   - **User Account**: Email: `user@movieai.com`, Password: `userpassword123`
