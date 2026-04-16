# 🍹 KeyTop Fresh – E-Commerce Web Application

## 📌 Project Overview

**KeyTop Fresh** is a modern e-commerce web application for ordering fresh juices, smoothies, desserts, and fruit-based products.

The application allows users to browse products, customize items with extras, manage a shopping cart, and complete a simulated checkout process. It also includes an admin dashboard for managing orders.

This project was developed as part of a group assignment using React and related frontend technologies.

---

## 👥 Team Members

- Sam Higdon  
- Darrell Declaro  
- Logan Marsh  
- Feras Zen  

---

## 📅 Project Date

April 2026

---

## 🚀 Features

### 🛍️ Product Catalog
- Fetches products from a mock API (JSON Server)
- Displays products grouped by category:
  - Fresh Juices
  - Smoothies
  - Milkshakes
  - Fruit Salads
  - Ice Cream
- Shows product image, name, and price

---

### 🔍 Product Details Page
- Displays full product information
- Shows:
  - category
  - description
  - price
  - stock availability
- Supports:
  - selecting extras (Honey, Chocolate, Pistachio, Cream)
  - dynamic price updates
  - quantity selection
  - adding to cart
- Prevents adding products when stock is unavailable

---

### 🛒 Shopping Cart (Order Page)
- Add products to cart
- Increase / decrease quantity
- Remove items
- Display selected extras
- Calculate total price dynamically

---

### 💳 Checkout System
- Collects customer information:
  - name
  - phone
  - address
- Displays order summary
- Simulates order submission
- Displays invoice after checkout

---

### 🧾 Custom Order Number System
Each order is assigned a custom order number in the format:

```text
KT0001000
KT0001001
