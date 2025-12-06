# Inventory & Business Insights System

A MERN stack application for managing a single-owner women's clothing business.

## Features
- **Dashboard**: Real-time financial insights and stock overview.
- **Inventory**: Manage products, categories, and stock levels.
- **Checkout**: Point of Sale (POS) system with invoice generation.
- **Logs**: Detailed transaction history with drilldown views.

## Tech Stack
- **Frontend**: React, Vite, Bootstrap, Chart.js
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Tools**: Docker, ESLint, Prettier

## Setup

1. **Clone the repository**
2. **Install Dependencies**:
   - Server: `cd server && npm install`
   - Client: `cd client && npm install`
3. **Environment Variables**:
   - Create `server/.env` with:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/inventory_db
     ```
4. **Run Locally**:
   - Server: `npm run dev` (in server dir)
   - Client: `npm run dev` (in client dir)

## Seeding Data
To populate the database with initial categories and products:
```bash
cd server
npm run seed
```
