# KeyTop Fresh – E-Commerce Web Application

## Project Overview
KeyTop Fresh is a modern e-commerce web application for ordering fresh juices, smoothies, desserts, and fruit-based products. The application provides an interactive shopping experience where users can browse products, view product details, add items to the cart, and complete a simulated checkout process.

This project was developed as part of a group assignment to apply React fundamentals, frontend architecture, routing, state management, and unit testing.

## Team Members
- Sam Higdon
- Darrell Declaro
- Logan Marsh
- Feras Zen

## Project Date
April 2026

## Features

### Product Catalog
- Displays products from a mock API
- Organized by categories
- Shows image, name, price, and actions

### Product Details Page
- Displays full product information
- Supports dynamic price calculation
- Includes stock tracking
- Allows quantity selection
- Supports add to cart functionality

### Shopping Cart
- Add, remove, and update product quantities
- Display selected extras
- Real-time total price calculation

### Checkout System
- Customer information form
- Order summary with tax calculation
- Simulated order submission
- Invoice display after checkout

### Admin Dashboard
- View all orders
- Update order status
- Delete orders
- View order statistics and revenue summary

## Technical Stack
- React
- Vite
- React Router
- Context API
- JSON Server
- Custom CSS
- Vitest
- React Testing Library
- Jest-DOM
- jsdom

## API Endpoints
- `GET /products` – Get all products
- `GET /products/:id` – Get a single product
- `POST /orders` – Create a new order
- `GET /orders` – Get all orders
- `PATCH /orders/:id` – Update order status
- `DELETE /orders/:id` – Delete an order

## How to Run the Project

### Install dependencies
```bash
npm install
