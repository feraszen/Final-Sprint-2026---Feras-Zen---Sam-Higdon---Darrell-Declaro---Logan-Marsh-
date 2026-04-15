# 🍹 KeyTop Fresh – E-Commerce Web Application

## 📌 Project Overview
KeyTop Fresh is a modern e-commerce web application designed for ordering fresh juices, smoothies, desserts, and fruit-based products. The platform provides a smooth and interactive user experience, allowing customers to browse products, customize their orders, and complete a simulated checkout process.

This project was developed as part of a group assignment, focusing on applying React fundamentals, UI/UX design, and frontend architecture principles.

---

## 👥 Team Members
- **Member 1:** [Sam Higdon ]
- **Member 2:** [Darrell Declaro]
- **Member 3:** [Logan Marsh]
- **Member 4:** [Feras Zen]
---

## 📅 Project Date
**April 2026**

---

## 🚀 Features

### 🛍️ Product Catalog
- Displays all products from a mock API
- Organized by categories (Juices, Smoothies, Milkshakes, etc.)
- Includes image, name, price, and actions

### 🔍 Product Details Page
- Full product information
- Dynamic price calculation (with extras)
- Stock tracking system
- Quantity selector
- Add to cart functionality

### 🛒 Shopping Cart
- Add, remove, and update product quantities
- Display selected extras
- Real-time price calculation

### 💳 Checkout System
- Customer information form
- Order summary with tax calculation
- Simulated order submission
- Invoice display after completion

### 🛠️ Admin Dashboard
- View all orders
- Update order status (Pending / Completed)
- Delete orders
- View statistics (total orders, revenue, etc.)

---

## 🧠 Technical Stack

- **Frontend:** React
- **Routing:** React Router
- **State Management:** React Context API
- **Backend Simulation:** JSON Server
- **Styling:** CSS (Custom design)
- **Testing:** (To be implemented)

---

## 🔌 API Endpoints (JSON Server)

- `GET /products` – Get all products  
- `GET /products/:id` – Get single product  
- `POST /orders` – Create order  
- `GET /orders` – Get all orders  
- `PATCH /orders/:id` – Update order status  
- `DELETE /orders/:id` – Delete order  

---

## ⚙️ How to Run the Project

### 1. Install dependencies
```bash
npm install

## 🧪 Unit Testing

This project includes unit testing to ensure the reliability and correctness of core application components.

### ✅ Testing Approach
Unit tests are implemented using:
- **Jest** – JavaScript testing framework
- **React Testing Library** – for testing UI components from a user perspective

### 🔍 Tested Components
The following core components are covered by unit tests:
- **ProductCard** – verifies product rendering and interaction behavior
- **CartContext** – ensures correct cart logic (add, remove, totals)
- **Navbar** – validates navigation links and cart item count display

### 🧪 Test Coverage Goals
- Validate component rendering
- Ensure correct state updates
- Verify user interactions (clicks, inputs)
- Confirm business logic (price calculations, cart updates)

### ▶️ Running Tests
To run the test suite:

```bash
npm test


### React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
