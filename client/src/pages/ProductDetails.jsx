import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

// Available extras that the customer can add to the selected product.
const extrasList = [
  { name: "Honey", price: 1, icon: "🍯" },
  { name: "Chocolate", price: 1, icon: "🍫" },
  { name: "Pistachio", price: 1.5, icon: "🌰" },
  { name: "Cream", price: 1, icon: "🥛" },
];

function ProductDetails() {
  // Extract the product id from the current route.
  const { id } = useParams();

  // Used to navigate the user back to the menu page or to the cart page.
  const navigate = useNavigate();

  // Access cart functionality and current cart items from the shared cart context.
  const { addToCart, cartItems } = useCart();

  // Store the selected product data returned from the mock API.
  const [product, setProduct] = useState(null);

  // Store the currently selected extras for this product.
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Store the quantity selected by the user before adding to cart.
  const [quantity, setQuantity] = useState(1);

  // Control loading and error states while fetching product details.
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Show temporary success feedback after the item is added to the cart.
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch the product details whenever the route id changes.
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const response = await fetch(`http://localhost:3001/products/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product details.");
        }

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setErrorMessage("Unable to load product details right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Add or remove an extra from the selected extras list.
  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.some((item) => item.name === extra.name)
        ? prev.filter((item) => item.name !== extra.name)
        : [...prev, extra]
    );
  }

  // Calculate the total cost of all selected extras.
  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + Number(extra.price),
    0
  );

  // Final unit price equals the base product price plus the extras total.
  const finalPrice = product ? Number(product.price) + extrasTotal : 0;

  // Read raw stock from the backend.
  const stockQuantity = Number(product?.stockQuantity || 0);

  // Calculate how many units of this product are already present in the cart,
  // regardless of selected extras, so the page reflects real remaining stock.
  const quantityAlreadyInCart = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      return Number(item.id) === Number(id)
        ? sum + Number(item.quantity || 0)
        : sum;
    }, 0);
  }, [cartItems, id]);

  // Remaining stock available to add during this current shopping session.
  const remainingStock = Math.max(stockQuantity - quantityAlreadyInCart, 0);

  const isOutOfStock = stockQuantity <= 0;
  const isFullyReservedInCart = stockQuantity > 0 && remainingStock <= 0;
  const isUnavailable = isOutOfStock || isFullyReservedInCart;
  const isLowStock = remainingStock > 0 && remainingStock <= 5;
  const hasReachedStockLimit = quantity >= remainingStock && !isUnavailable;

  let stockLabel = "In Stock";
  let stockColor = "#1b5e20";

  if (isOutOfStock) {
    stockLabel = "Out of Stock";
    stockColor = "#c62828";
  } else if (isFullyReservedInCart) {
    stockLabel = "All Remaining Stock Already In Cart";
    stockColor = "#c62828";
  } else if (isLowStock) {
    stockLabel = "Low Stock";
    stockColor = "#ff7a00";
  }

  // Calculate the total price for the selected quantity.
  const totalSelectedPrice = finalPrice * quantity;

  // Keep the selected quantity valid whenever remaining stock changes.
  useEffect(() => {
    if (remainingStock <= 0) {
      setQuantity(1);
      return;
    }

    if (quantity > remainingStock) {
      setQuantity(remainingStock);
    }
  }, [remainingStock, quantity]);

  // Increase selected quantity by one, but never above the remaining available stock.
  function increaseQuantity() {
    setQuantity((prev) => (prev < remainingStock ? prev + 1 : prev));
  }

  // Decrease selected quantity, but never below 1.
  function decreaseQuantity() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }

  // Build the cart item object and add it to the shared cart state.
  function handleAddToCart() {
    if (!product || isUnavailable) return;

    const itemToAdd = {
      id: Number(product.id),
      name: product.name,
      image: product.image,
      category: product.category,
      basePrice: Number(product.price),
      price: Number(finalPrice),
      extras: selectedExtras.map((extra) => ({
        name: extra.name,
        price: Number(extra.price),
        icon: extra.icon,
      })),
    };

    for (let i = 0; i < quantity; i += 1) {
      addToCart(itemToAdd);
    }

    const extraSummary =
      selectedExtras.length > 0 ? ` with ${selectedExtras.length} extra(s)` : "";

    setSuccessMessage(
      `${quantity} ${product.name} added to cart${extraSummary}.`
    );

    setSelectedExtras([]);
    setQuantity(1);

    window.clearTimeout(window.productDetailsSuccessTimeout);
    window.productDetailsSuccessTimeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  return (
    <>
      <Navbar />

      <section className="menu-hero">
        <div className="container">
          <h1>Product Details</h1>
          <p>See full information about your selected item.</p>
        </div>
      </section>

      <main className="container" style={{ padding: "4rem 0" }}>
        {/* Display a loading message while product data is being fetched. */}
        {loading && <p>Loading product details...</p>}

        {/* Display an error message if the product request fails. */}
        {!loading && errorMessage && <p>{errorMessage}</p>}

        {/* Display a fallback message if no product is found. */}
        {!loading && !errorMessage && !product && <p>Product not found.</p>}

        {/* Render the full product details only when valid product data exists. */}
        {!loading && !errorMessage && product && (
          <>
            <section className="product-details-card">
              <div className="product-details-image-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-details-image"
                  onError={(e) => {
                    e.target.src = "/images/logo.jpg";
                  }}
                />
              </div>

              <div className="product-details-content">
                <p className="product-details-category">{product.category}</p>
                <h2>{product.name}</h2>

                <p className="product-details-description">
                  {product.description}
                </p>

                <p className="product-details-stock">
                  <strong>Availability:</strong>{" "}
                  <span
                    style={{
                      color: stockColor,
                      fontWeight: "700",
                    }}
                  >
                    {stockLabel}
                  </span>
                </p>

                <p className="product-details-stock">
                  <strong>Total Stock:</strong> {stockQuantity}
                </p>

                <p className="product-details-stock">
                  <strong>Already in Cart:</strong> {quantityAlreadyInCart}
                </p>

                <p className="product-details-stock">
                  <strong>Remaining to Add:</strong> {remainingStock}
                </p>

                <p className="product-details-price">
                  Unit Price: ${finalPrice.toFixed(2)}
                </p>

                {/* Render all optional extras that can be selected by the user. */}
                <div className="extras">
                  {extrasList.map((extra) => {
                    const isSelected = selectedExtras.some(
                      (item) => item.name === extra.name
                    );

                    return (
                      <button
                        key={extra.name}
                        type="button"
                        className={`extra-btn ${isSelected ? "active" : ""}`}
                        onClick={() => toggleExtra(extra)}
                        disabled={isUnavailable}
                        style={{
                          opacity: isUnavailable ? 0.6 : 1,
                          cursor: isUnavailable ? "not-allowed" : "pointer",
                        }}
                      >
                        {extra.icon}
                      </button>
                    );
                  })}
                </div>

                {/* Show selected extras as badges for quick visual feedback. */}
                {selectedExtras.length > 0 && (
                  <div className="extras-badges">
                    {selectedExtras.map((extra, index) => (
                      <span
                        key={`${extra.name}-${index}`}
                        className="extra-badge"
                      >
                        {extra.icon} {extra.name} (+$
                        {Number(extra.price).toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}

                {/* Let the user choose how many units to add before checkout. */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>Quantity:</strong>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="action-btn"
                      onClick={decreaseQuantity}
                      disabled={isUnavailable}
                      style={{
                        minWidth: "44px",
                        opacity: isUnavailable ? 0.6 : 1,
                        cursor: isUnavailable ? "not-allowed" : "pointer",
                      }}
                    >
                      -
                    </button>

                    <span
                      style={{
                        minWidth: "28px",
                        textAlign: "center",
                        fontWeight: "700",
                      }}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      className="action-btn"
                      onClick={increaseQuantity}
                      disabled={isUnavailable || hasReachedStockLimit}
                      style={{
                        minWidth: "44px",
                        opacity:
                          isUnavailable || hasReachedStockLimit ? 0.6 : 1,
                        cursor:
                          isUnavailable || hasReachedStockLimit
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Show a small note when the selected quantity reaches the stock limit. */}
                {hasReachedStockLimit && (
                  <p
                    style={{
                      marginTop: "0.7rem",
                      color: "#ff7a00",
                      fontWeight: "600",
                    }}
                  >
                    You have reached the maximum remaining quantity available for
                    this product.
                  </p>
                )}

                {/* Explain why the product cannot be added if all remaining stock is already reserved in cart. */}
                {isFullyReservedInCart && (
                  <p
                    style={{
                      marginTop: "0.7rem",
                      color: "#c62828",
                      fontWeight: "600",
                    }}
                  >
                    You already have all available units of this product in your
                    cart.
                  </p>
                )}

                {/* Show the final total based on the selected quantity. */}
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem 1.2rem",
                    background: "#fff3e8",
                    border: "1px solid #ffd2ad",
                    borderRadius: "14px",
                    maxWidth: "320px",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: "600", color: "#1b5e20" }}>
                    Total Price: ${totalSelectedPrice.toFixed(2)}
                  </p>
                </div>

                {/* Show a temporary success message after adding the item to the cart. */}
                {successMessage && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.9rem 1rem",
                      background: "#edf7ed",
                      border: "1px solid #b7dfb9",
                      borderRadius: "12px",
                      color: "#1b5e20",
                      fontWeight: "600",
                      maxWidth: "420px",
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                {/* Main action buttons for adding the selected item or going directly to the cart page. */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    className="add-to-cart"
                    onClick={handleAddToCart}
                    disabled={isUnavailable}
                    style={{
                      maxWidth: "220px",
                      opacity: isUnavailable ? 0.6 : 1,
                      cursor: isUnavailable ? "not-allowed" : "pointer",
                      flex: "1",
                      minWidth: "180px",
                    }}
                  >
                    {isUnavailable ? "Unavailable" : `Add ${quantity} to Cart`}
                  </button>

                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => navigate("/order")}
                    style={{
                      flex: "1",
                      minWidth: "180px",
                    }}
                  >
                    Go to Cart
                  </button>
                </div>
              </div>
            </section>

            {/* Navigation control that returns the user to the menu page. */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "2rem",
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={() => navigate("/menu")}
              >
                ← Back to Menu
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default ProductDetails;

