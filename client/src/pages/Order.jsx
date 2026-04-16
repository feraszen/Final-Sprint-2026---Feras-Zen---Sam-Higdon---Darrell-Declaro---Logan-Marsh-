import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";

function Order() {
  // Access all cart-related data and actions from the shared cart context.
  const {
    cartItems,
    totalItems,
    totalPrice,
    removeFromCart,
    deleteFromCart,
    removeExtraFromCart,
    clearCart,
  } = useCart();

  // Used to navigate the user back to the home page after completing the order.
  const navigate = useNavigate();

  // Store customer form input values.
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    instructions: "",
  });

  // Control whether the order success screen should be displayed.
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Store the submitted order so it can be displayed as an invoice after checkout.
  const [savedOrder, setSavedOrder] = useState(null);

  // Tax rate used in the order summary.
  const taxRate = 0.15;

  // Calculate tax amount and final total from the current cart total.
  const taxAmount = totalPrice * taxRate;
  const finalTotal = totalPrice + taxAmount;

  // Update the corresponding form field whenever the user types in an input.
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Validate the form, update product stock, build the order object, and save it to the mock backend.
  async function handleSubmit(e) {
    e.preventDefault();

    // Prevent submission if required customer fields are empty.
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in all required fields.");
      return;
    }

    // Prevent submission if the cart has no items.
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // Group cart items by product id so we know the total quantity required for each product.
      const requiredQuantities = cartItems.reduce((acc, item) => {
        const productId = String(item.id);
        acc[productId] = (acc[productId] || 0) + Number(item.quantity || 0);
        return acc;
      }, {});

      // Check current stock for every product before creating the order.
      for (const [productId, requiredQty] of Object.entries(requiredQuantities)) {
        const productResponse = await fetch(
          `http://localhost:3001/products/${productId}`
        );

        if (!productResponse.ok) {
          throw new Error("Failed to verify product stock.");
        }

        const productData = await productResponse.json();
        const currentStock = Number(productData.stockQuantity || 0);

        if (requiredQty > currentStock) {
          alert(
            `Only ${currentStock} item(s) left in stock for ${productData.name}. Please adjust your cart quantity.`
          );
          return;
        }
      }

      // Update stock quantity for each purchased product.
      for (const [productId, requiredQty] of Object.entries(requiredQuantities)) {
        const productResponse = await fetch(
          `http://localhost:3001/products/${productId}`
        );

        if (!productResponse.ok) {
          throw new Error("Failed to load product before stock update.");
        }

        const productData = await productResponse.json();
        const currentStock = Number(productData.stockQuantity || 0);
        const updatedStock = currentStock - requiredQty;

        const updateResponse = await fetch(
          `http://localhost:3001/products/${productId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              stockQuantity: updatedStock,
            }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error("Failed to update product stock.");
        }
      }

      // Load existing orders so the next custom order number can start at KT0001000.
      const existingOrdersResponse = await fetch("http://localhost:3001/orders");

      if (!existingOrdersResponse.ok) {
        throw new Error("Failed to load existing orders.");
      }

      const existingOrders = await existingOrdersResponse.json();
      const nextOrderNumber = existingOrders.length + 1000;
      const formattedOrderNumber = `KT${String(nextOrderNumber).padStart(
        7,
        "0"
      )}`;

      // Build the order object in the format expected by the backend.
      const newOrder = {
        orderNumber: formattedOrderNumber,
        customer: formData,
        items: cartItems,
        totalItems,
        subtotal: totalPrice,
        tax: taxAmount,
        total: finalTotal,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        throw new Error("Failed to save order.");
      }

      const savedOrderFromServer = await response.json();

      // Save the completed order locally for invoice display,
      // then clear the cart and switch to the success view.
      setSavedOrder(savedOrderFromServer);
      clearCart();
      setOrderCompleted(true);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("There was a problem completing your order.");
    }
  }

  return (
    <>
      <Navbar />

      <section className="menu-hero">
        <div className="container">
          <h1>Your Order</h1>
          <p>Review your items before checkout.</p>
        </div>
      </section>

      <main className="container order-page">
        {!orderCompleted ? (
          <div className="order-layout">
            <section className="cart-section">
              <h2>Cart Items</h2>

              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>

                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id}-${index}-${JSON.stringify(
                        item.extras || []
                      )}`}
                      className="cart-item"
                    >
                      <div className="cart-left">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "/images/logo.jpg";
                          }}
                        />
                      </div>

                      <div className="cart-right">
                        <div className="cart-top">
                          <div>
                            <h4 className="cart-title">{item.name}</h4>
                          </div>

                          <div className="cart-meta">
                            <p className="item-price">
                              ${Number(item.price).toFixed(2)}
                            </p>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                        </div>

                        {item.extras && item.extras.length > 0 && (
                          <div className="extras-display">
                            <strong>Extras:</strong>
                            <div className="extras-badges">
                              {item.extras.map((extra, extraIndex) => (
                                <span
                                  key={`${extra.name}-${extraIndex}`}
                                  className="extra-badge"
                                >
                                  {extra.icon ? `${extra.icon} ` : ""}
                                  {extra.name} (+$
                                  <button
                                    type="button"
                                    className="extra-remove-btn"
                                    onClick={() => removeExtraFromCart(item, extra)}
                                  >
                                   x
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="cart-subtotal">
                          Subtotal: $
                          {(
                            Number(item.price) * Number(item.quantity)
                          ).toFixed(2)}
                        </p>

                        <div className="cart-actions">
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeFromCart(item)}
                          >
                            Remove One
                          </button>

                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => deleteFromCart(item)}
                          >
                            Delete Item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </section>

            <aside className="summary-section">
              <h2>Order Summary</h2>

              <div className="summary-box">
                <p>
                  Total Items: <span>{totalItems}</span>
                </p>
                <p>
                  Subtotal: $<span>{totalPrice.toFixed(2)}</span>
                </p>
                <p>
                  Tax (15%): $<span>{taxAmount.toFixed(2)}</span>
                </p>

                <hr />

                <p>
                  <strong>
                    Total: $<span>{finalTotal.toFixed(2)}</span>
                  </strong>
                </p>

                <button
                  type="submit"
                  form="customerForm"
                  className="checkout-btn"
                >
                  Complete Order
                </button>
              </div>
            </aside>

            <section className="customer-section">
              <h2>Customer Information</h2>

              <form
                id="customerForm"
                className="customer-form"
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="instructions">Special Instructions</label>
                  <textarea
                    id="instructions"
                    name="instructions"
                    rows="4"
                    value={formData.instructions}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </form>
            </section>
          </div>
        ) : (
          <div className="success-message">
            <div className="success-box">
              <h2>🎉 Order Completed Successfully!</h2>
              <p>Thank you for choosing KeyTop Fresh.</p>
              <p>Your fresh juices are on the way!</p>
              <p>Phone Number: +1 (709) 579-1061.</p>

              <h2>Invoice</h2>

              <div id="invoice-content">
                <p>
                  <strong>Order Number:</strong> {savedOrder?.orderNumber}
                </p>
                <p>
                  <strong>Name:</strong> {savedOrder?.customer?.name}
                </p>
                <p>
                  <strong>Phone:</strong> {savedOrder?.customer?.phone}
                </p>
                <p>
                  <strong>Address:</strong> {savedOrder?.customer?.address}
                </p>
                <p>
                  <strong>Instructions:</strong>{" "}
                  {savedOrder?.customer?.instructions || "None"}
                </p>

                <hr />

                {savedOrder?.items?.map((item, index) => (
                  <div key={`${item.id}-${index}`}>
                    <p>
                      {item.quantity} x {item.name} - $
                      {(
                        Number(item.price) * Number(item.quantity)
                      ).toFixed(2)}
                    </p>

                    {item.extras && item.extras.length > 0 && (
                      <div
                        className="extras-badges"
                        style={{ marginBottom: "0.6rem" }}
                      >
                        {item.extras.map((extra, extraIndex) => (
                          <span
                            key={`${extra.name}-${extraIndex}`}
                            className="extra-badge"
                          >
                            {extra.icon ? `${extra.icon} ` : ""}
                            {extra.name} (+${Number(extra.price).toFixed(2)})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <hr />

                <p>Subtotal: ${Number(savedOrder?.subtotal || 0).toFixed(2)}</p>
                <p>Tax (15%): ${Number(savedOrder?.tax || 0).toFixed(2)}</p>
                <p>
                  <strong>
                    Total Paid: ${Number(savedOrder?.total || 0).toFixed(2)}
                  </strong>
                </p>
              </div>

              <button className="checkout-btn" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Order;
