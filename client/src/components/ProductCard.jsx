import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// ✅ Extras ثابتة (المهم)
const extrasList = [
  { name: "Honey", price: 1, icon: "🍯" },
  { name: "Chocolate", price: 1, icon: "🍫" },
  { name: "Pistachio", price: 1.5, icon: "🌰" },
  { name: "Cream", price: 1, icon: "🥛" },
];

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedSize, setSelectedSize] = useState("Regular");

  // Toggle extra
  function toggleExtra(extra) {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.name === extra.name);
      if (exists) {
        return prev.filter((e) => e.name !== extra.name);
      }
      return [...prev, extra];
    });
  }

  // Calculate extras total
  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + Number(extra.price),
    0
  );

  // Size adjustment
  const sizeAdjustment = selectedSize === "Small" ? -1 : 0;

  // Final price
  const finalPrice =
    Number(product.price) + extrasTotal + sizeAdjustment;

  function handleAddToCart() {
    addToCart({
      ...product,
      price: finalPrice,
      basePrice: Number(product.price),
      extras: selectedExtras,
      size: selectedSize,
    });
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

      <h3>{product.name}</h3>

      {/* ===== SIZE ===== */}
      <div className="size-options">
        <button
          type="button"
          className={`size-btn ${
            selectedSize === "Small" ? "active" : ""
          }`}
          onClick={() => setSelectedSize("Small")}
        >
          Small
        </button>

        <button
          type="button"
          className={`size-btn ${
            selectedSize === "Regular" ? "active" : ""
          }`}
          onClick={() => setSelectedSize("Regular")}
        >
          Regular
        </button>
      </div>

      {/* ===== EXTRAS ===== */}
      <div className="extras">
        {extrasList.map((extra) => {
          const isSelected = selectedExtras.some(
            (e) => e.name === extra.name
          );

          return (
            <button
              key={extra.name}
              type="button"
              className={`extra-btn ${
                isSelected ? "selected" : ""
              }`}
              onClick={() => toggleExtra(extra)}
              title={`${extra.name} +$${Number(extra.price).toFixed(2)}`}
            >
              {extra.icon} {extra.name}
            </button>
          );
        })}
      </div>

      {/* ===== SELECTED EXTRAS ===== */}
      {selectedExtras.length > 0 && (
        <div className="extras-badges">
          {selectedExtras.map((extra, index) => (
            <span
              key={`${extra.name}-${index}`}
              className="extra-badge"
            >
              {extra.icon} {extra.name} (+$
              {Number(extra.price).toFixed(2)})
              <button
                type="button"
                className="extra-remove-btn"
                onClick={() => toggleExtra(extra)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ===== PRICE ===== */}
      <p className="product-price">
        ${finalPrice.toFixed(2)}
      </p>

      {/* ===== ACTIONS ===== */}
      <div className="product-actions">
        <button
          type="button"
          className="checkout-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>

        <Link
          to={`/product/${product.id}`}
          className="view-details"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;

