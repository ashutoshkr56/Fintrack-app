# FinTrack - Personal Finance Manager

## 📖 Problem Statement
Managing personal finances can often be overwhelming, leading to poor saving habits and a lack of insight into where money is going. While many apps exist, they can be overly complex or lack the specific customization users need. **FinTrack** aims to solve this by providing a clean, intuitive, and secure platform where users can easily log their daily incomes and expenses, visualize their spending trends, and generate detailed reports.

---

## ✨ Features List
- **Multi-User Authentication**: Secure user registration and login system ensuring complete data privacy and isolation between different accounts.
- **Comprehensive Ledger**: Log income and expense transactions with specific dates, custom descriptions, formats, and categories.
- **Custom Categories**: Users can dynamically create and assign their own custom transaction categories alongside the standard defaults.
- **Interactive Dashboard**: A high-level overview of total income, expenses, net balance, savings rate, and recent transactions. It includes responsive pie and bar charts for quick insights.
- **Monthly Analytics**: Real-time calculated daily trends and category breakdowns for the specific current month.
- **In-Place Editing**: Easily correct or update past transactions directly within the transaction list—including intelligently swapping a record between an Income and an Expense.
- **Advanced Filtering**: Filter all historical transactions by type (Income vs Expense) or by specific categories.
- **CSV Reporting Engine**: Dynamically generate and download structured `.csv` files for complete Monthly or Yearly periods.
- **Theme Engine**: Built-in support for seamlessly toggling between Dark Mode and Light Mode.

---

## 🛠 Tech Stack Used
**Frontend (Client Segment)**
- **React.js**: Core UI library.
- **Vite**: Ultra-fast build tool and development server.
- **Chart.js & react-chartjs-2**: Engine used for rendering responsive analytics graphs (Doughnut, Bar, Line).
- **Axios**: Promised-based HTTP client for interacting with the backend API.
- **Vanilla CSS**: Custom-tailored fluid stylesheets leveraging CSS variables for advanced theming.

**Backend (Server Segment)**
- **Node.js**: Asynchronous JavaScript runtime.
- **Express.js**: Fast, unopinionated routing framework handling API endpoints.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: Elegant Object Data Modeling (ODM) for MongoDB.
- **JSON Web Tokens (JWT)**: Secure, stateless token-based authorization.
- **Bcrypt.js**: Cryptographic library for securely hashing user passwords.

---

## 🏗 System Architecture and Design
The application follows a standard **MERN Stack Client-Server Architecture**:
1. **Client Layer (Frontend)**: A Single Page Application (SPA) built in React. It holds internal state, manages user interactions, and renders dynamic chart logic completely on the browser.
2. **API Layer (Backend)**: An Express server acting as a REST API. It handles route protection, business logic (e.g., aggregating or swapping transaction schemas), and communicates independently with the database.
3. **Data Layer (Database)**: A MongoDB cluster hosting collections. Document isolation is strictly enforced to ensure users only ever query data linked to their specific `ObjectId`.

---

## 🌐 User Flow
1. **Onboarding**: A new user lands on the root URL and is greeted by the `Auth` module. They click "Register", input a username, name, and secure password.
2. **Dashboard Overview**: Once logged in, the app fetches their data and lands them on the Dashboard. They view their top-level balances and charts.
3. **Adding Data**: The user clicks the `+ Add Entry` tab, inputs a transaction value, selects/creates a category, and submits it. 
4. **Analyzing**: The user moves to the `Analytics` tab to immediately review how their new expense altered their daily trend for the current month.
5. **Management**: Later, in the `Transactions` tab, the user filters by `Expenses`, locates an old record, and clicks `Edit` to adjust the price.
6. **Reporting**: At the month's end, the user opens the `Reports` tab and downloads a `Monthly_Report.csv` file for external accounting.
7. **Logout**: The user securely terminates their session.

---

## 📡 API Structure and Flow

### Authentication Routes
- `POST /api/auth/register`: Accepts `{ username, fullName, password }`. Hashes the password, creates the User document, and returns a JWT token.
- `POST /api/auth/login`: Accepts `{ username, password }`. Verifies the bcrypt hash and issues a JWT token.
- `POST /api/auth/categories`: Protected. Accepts `{ category }` string, pushes it to the user's custom categories array.

### Transaction Routes (Protected via JWT Middleware)
- `GET /api/transactions`: Retrieves combined arrays of Incomes & Expenses explicitly belonging to `req.user.id`, sorted by date descending.
- `POST /api/transactions`: Accepts `{ type, amount, date, category, description }`. Conditionally instantiates and saves it into the `Income` or `Expense` collections.
- `PUT /api/transactions/:id`: Updates an existing transaction. If the payload `type` differs from its current collection (e.g., changes from 'income' to 'expense'), the backend intelligently removes it from the current collection and recreates it in the correct target collection.
- `DELETE /api/transactions/:id`: Deletes a transaction from the appropriate collection by matching its unique ID.

---

## 🗄 Database Schema

**1. User Schema**
```json
{
  "_id": "ObjectId",
  "fullName": "String",
  "username": "String (Unique, Required)",
  "password": "String (Hashed, Required)",
  "categories": ["String (Array of custom categories)"]
}
```

**2. Income Schema**
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (Ref: User, Required)",
  "amount": "Number (Min 0, Required)",
  "date": "String (YYYY-MM-DD, Required)",
  "category": "String (Required)",
  "description": "String (Required)"
}
```

**3. Expense Schema**
```json
{
  "_id": "ObjectId",
  "user": "ObjectId (Ref: User, Required)",
  "amount": "Number (Min 0, Required)",
  "date": "String (YYYY-MM-DD, Required)",
  "category": "String (Required)",
  "description": "String (Required)"
}
```

---

## 🔐 Authentication and Security
- **Stateless Verification**: Authentication relies entirely on `JSON Web Tokens`. No session states are stored on the server memory, allowing the backend to scale cleanly.
- **Middleware Guards**: Every financial and category route passes through `auth.js` middleware. This intercepts incoming requests, verifies the `Bearer ${token}` against the secret key, and explicitly binds the decoded User ID to the request (`req.user = decoded`). 
- **Endpoint Data Isolation**: If a user attempts to DELETE or UPDATE a transaction ID that does not belong to their specific `req.user.id`, the server forcibly intercepts and blocks the action with a `401 Unauthorized` response.
- **Cryptographic Hashing**: Raw passwords never touch the database. `Bcrypt.js` salts and hashes credentials upon registration. During login, passwords are computationally compared against hashes rather than directly matched.
