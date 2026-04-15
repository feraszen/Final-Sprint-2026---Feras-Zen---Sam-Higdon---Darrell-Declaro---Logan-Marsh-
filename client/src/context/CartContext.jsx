import { createContext, useContext, useEffect, useState } from "react";

// Create a shared context to manage cart data across the application.
const CartContext = createContext();

// Normalize extras so they can be compared consistently regardless of selection order.
function normalizeExtras(extras = []) {
  return [...extras]
    .map((extra) => ({
      name: extra.name,
      price: Number(extra.price),
      icon: extra.icon || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Check whether two extras arrays represent the same selected extras.
function areExtrasEqual(extrasA = [], extrasB = []) {
  const normalizedA = normalizeExtras(extrasA);
  const normalizedB = normalizeExtras(extrasB);

  if (normalizedA.length !== normalizedB.length) return false;

  return normalizedA.every((extra, index) => {
    const other = normalizedB[index];

    return (
      extra.name === other.name &&
      Number(extra.price) === Number(other.price)
    );
  });
}

export function CartProvider({ children }) {
  // Load any previously saved cart items from localStorage when the app starts.
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart updates to localStorage so the cart persists after page refresh.
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add a product to the cart.
  // If the same product with the same extras already exists, only increase its quantity.
  function addToCart(product) {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          Number(item.id) === Number(product.id) &&
          areExtrasEqual(item.extras || [], product.extras || [])
      );

      if (existingItem) {
        return prevItems.map((item) =>
          Number(item.id) === Number(product.id) &&
          areExtrasEqual(item.extras || [], product.extras || [])
            ? { ...item, quantity: Number(item.quantity) + 1 }
            : item
        );
      }

      return [
        ...prevItems,
        {
          ...product,
          id: Number(product.id),
          basePrice: Number(product.basePrice ?? product.price),
          price: Number(product.price),
          quantity: 1,
          extras: normalizeExtras(product.extras || []),
        },
      ];
    });
  }

  // Remove one quantity of a matching cart item.
  // If quantity becomes zero, remove the item completely from the cart.
  function removeFromCart(targetItem) {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          Number(item.id) === Number(targetItem.id) &&
          areExtrasEqual(item.extras || [], targetItem.extras || [])
            ? { ...item, quantity: Number(item.quantity) - 1 }
            : item
        )
        .filter((item) => Number(item.quantity) > 0)
    );
  }

  // Delete the entire matching item from the cart, regardless of quantity.
  function deleteFromCart(targetItem) {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            Number(item.id) === Number(targetItem.id) &&
            areExtrasEqual(item.extras || [], targetItem.extras || [])
          )
      )
    );
  }

  // Remove all items from the cart.
  function clearCart() {
    setCartItems([]);
  }

  // Calculate the total number of product units currently in the cart.
  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  // Calculate the total cart cost based on price and quantity of each item.
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to simplify access to the cart context in other components.
export function useCart() {
  return useContext(CartContext);
}

