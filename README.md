# FinVibe — Personal Finance Management System

A Full-Stack Personal Finance Management System built with **React**, **TailwindCSS**, **Express.js**, and **MongoDB Atlas**.

---

## 🌟 Key Features

1. **🔐 Authentication & Security**
   - Secure JWT token-based authentication (Register & Login).
   - Instant **1-Click Demo Account Login** with automated sample dataset generation.
   - Password hashing with `bcryptjs`.
   - Protected route guards on client and server.

2. **📊 Dynamic Dashboard**
   - **Total Net Balance** summary and **Savings Rate %**.
   - **Monthly Trends**: Interactive Area & Bar Chart comparing monthly Income vs. Expenses vs. Net savings.
   - **Top Category Breakdown**: Interactive Donut / Pie Chart with category shares.
   - **Financial Health Score** (0–100) based on savings and budget discipline.
   - **Recent Transactions Feed** and **Savings Goals preview**.

3. **💸 Transactions Ledger**
   - Full CRUD: Add, Edit, Delete income & expense transactions.
   - Multi-filtering: by Search query, Type (Income / Expense), Category, Payment Method (UPI, Cards, Cash, Bank Transfer), and Date Range.
   - Real-time filtered financial summary strip.
   - **CSV Export** for transaction logs.
   - Server-side and client-side pagination.

4. **🎯 Monthly Budgets**
   - Monthly category spending limits with live calculation against actual transactions.
   - Month-by-month navigation.
   - Color-coded progress bars (Safe, Warning >= 80%, Exceeded > 100%).
   - Over-budget notification banner.

5. **🏆 Savings Goals**
   - Set milestone savings targets with deadlines and custom color themes.
   - Real-time progress bars & countdown of remaining days.
   - **Contribute Funds** with **celebratory confetti animation** upon achieving 100% of the goal.
   - Expandable log of all milestone contributions.

6. **📈 Financial Intelligence & Reports**
   - Flexible timeframe presets: Last 30 Days, Last 90 Days, This Year, All Time, or Custom Date Range.
   - Expense distribution pie chart with count and percentage per category.
   - Income streams breakdown bar chart.
   - Payment channels distribution (UPI, Credit Cards, Cash, Bank Transfers).
   - Daily Cash Flow timeline chart.

7. **🌍 Multi-Currency Support**
   - Global currency switcher in the top navigation bar:
     - Indian Rupee (`₹ INR`)
     - US Dollar (`$ USD`)
     - Euro (`€ EUR`)
     - British Pound (`£ GBP`)
     - Canadian Dollar (`CA$ CAD`)
     - Australian Dollar (`AU$ AUD`)
     - Japanese Yen (`¥ JPY`)

8. **⚡ 1-Click Demo Dataset Seeder**
   - Easily seed rich, multi-month realistic transactions, category budgets, and savings goals at any time with a single click.

---

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite, TailwindCSS v3, Recharts, Lucide React, Axios, React Router Dom v7, canvas-confetti, date-fns.
- **Backend**: Node.js + Express.js (ES Modules), Mongoose, JWT, bcryptjs, cors, morgan, dotenv.
- **Database**: MongoDB Atlas (`cluster0.7m7ss7v.mongodb.net`)

---

## 📁 Project Structure

```
project/
├── server/
│   ├── config/
│   │   └── db.js                # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js              # User schema & bcrypt password hashing
│   │   ├── Transaction.js       # Transaction schema with indexes
│   │   ├── Budget.js            # Monthly budget schema with thresholds
│   │   └── Goal.js              # Savings goals schema & contribution log
│   ├── routes/
│   │   ├── auth.js              # Auth & profile routes
│   │   ├── transactions.js      # Transactions CRUD, filters, pagination
│   │   ├── budgets.js           # Budgets with live spending calculations
│   │   ├── goals.js             # Goals & contribution milestones
│   │   ├── dashboard.js         # Dashboard aggregations & reports
│   │   └── seed.js              # Demo data seeder
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── .env                     # MongoDB Atlas credentials & JWT secret
│   ├── server.js                # Express entry point (Port 5000)
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/                 # Axios instance with JWT interceptors
│   │   ├── context/             # AuthContext & CurrencyContext
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Navbar, AppLayout
│   │   │   ├── common/          # StatsCard, Modal, CategoryIcon
│   │   │   ├── transactions/    # TransactionModal
│   │   │   ├── budgets/         # BudgetModal
│   │   │   └── goals/           # GoalModal, ContributeModal
│   │   ├── pages/
│   │   │   ├── Auth/            # Login & Register
│   │   │   ├── Dashboard/       # Main Overview & Charts
│   │   │   ├── Transactions/    # Ledger, Filters, CSV Export
│   │   │   ├── Budgets/         # Monthly Budget Manager
│   │   │   ├── Goals/           # Savings Goals & Milestones
│   │   │   ├── Reports/         # Analytics & Visual Reports
│   │   │   └── Profile/         # Settings & Atlas DB Status
│   │   ├── utils/               # Category constants & helpers
│   │   ├── App.jsx              # Routes & Protected Guards
│   │   ├── main.jsx
│   │   └── index.css            # Dark glassmorphic design system
│   ├── tailwind.config.js
│   ├── vite.config.js           # Vite dev proxy to backend port 5000
│   └── package.json
│
├── package.json                 # Root package with concurrently runner
└── README.md
```

---

## 🚀 Getting Started

### 1. Run Both Servers Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### 2. Run Servers Separately (Optional)
**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

---

## 🔐 Credentials & Environment Setup

The backend `.env` is configured with your MongoDB Atlas Cluster:
```env
PORT=5000
MONGODB_URI=mongodb+srv://praveensai3333_db_user:DuJJueAVxsJ42Jiv@cluster0.7m7ss7v.mongodb.net/personal_finance?retryWrites=true&w=majority
JWT_SECRET=finance_app_jwt_secret_token_secure_2026_xyz
```
