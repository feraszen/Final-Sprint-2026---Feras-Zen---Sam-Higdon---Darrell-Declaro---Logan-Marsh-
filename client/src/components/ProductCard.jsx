import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// List of optional extras that can be added to any product.
const extrasList = [
  { name: "Honey", price: 1, icon: "🍯" },
  { name: "Chocolate", price: 1, icon: "🍫" },
  { name: "Pistachio", price: 1.5, icon: "🌰" },
  { name: "Cream", price: 1, icon: "🥛" },
];

function ProductCard({ product }) {
  // Access the shared cart function from the cart context.
  const { addToCart } = useCart();

  // Store the extras currently selected by the user for this product.
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Prevent rendering if no product data was passed to the component.
  if (!product) return null;

  // Add or remove an extra depending on whether it is already selected.
  function toggleExtra(extra) {
    setSelectedExtras((prev) =>
      prev.some((item) => item.name === extra.name)
        ? prev.filter((item) => item.name !== extra.name)
        : [...prev, extra]
    );
  }

  // Calculate the total price of all selected extras.
  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + Number(extra.price),
    0
  );

  // Final displayed price = base product price + selected extras price.
  const finalPrice = Number(product.price) + extrasTotal;

  // Build the product object in the required cart format, then add it to cart.
  function handleAddToCart() {
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

    addToCart(itemToAdd);

    // Clear selected extras after adding the item, so the next selection starts fresh.
    setSelectedExtras([]);
  }

  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
        onError={(e) => {
          e.target.src = "/images/logo.jpg";
        }}
      />

      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">${finalPrice.toFixed(2)}</p>

      {/* Render all available extras as selectable buttons. */}
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
              title={`${extra.name} +$${Number(extra.price).toFixed(2)}`}
            >
              {extra.icon}
            </button>
          );
        })}
      </div>

      {/* Display the currently selected extras as badges under the product. */}
      {selectedExtras.length > 0 && (
        <div className="extras-badges">
          {selectedExtras.map((extra, index) => (
            <span key={`${extra.name}-${index}`} className="extra-badge">
              {extra.icon} {extra.name} (+${Number(extra.price).toFixed(2)})
              <button
                type="button"
                className="extra-remove-btn"
                onClick={() => toggleExtra(extra)}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Provide navigation to the product details page and add-to-cart action. */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "auto",
        }}
      >
        <Link
          to={`/product/${product.id}`}
          className="action-btn"
          style={{
            textAlign: "center",
            display: "inline-block",
            flex: "1",
            minWidth: "140px",
          }}
        >
          View Details
        </Link>

        <button
          type="button"
          className="add-to-cart"
          onClick={handleAddToCart}
          style={{ flex: "1", minWidth: "140px" }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;

