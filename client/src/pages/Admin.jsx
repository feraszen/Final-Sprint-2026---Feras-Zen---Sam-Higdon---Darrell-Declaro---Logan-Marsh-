import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Admin() {
  // =========================
  // View Mode
  // =========================
  const [activeSection, setActiveSection] = useState("orders");

  // =========================
  // Orders State
  // =========================
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedOrderData, setEditedOrderData] = useState(null);

  // =========================
  // Products State
  // =========================
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productLoading, setProductLoading] = useState(true);
  const [productErrorMessage, setProductErrorMessage] = useState("");
  const [editingProducts, setEditingProducts] = useState({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
    stockQuantity: "",
    featured: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // =========================
  // Fetch Orders
  // =========================
  async function fetchOrders() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("http://localhost:3001/orders");

      if (!response.ok) {
        throw new Error("Failed to fetch orders.");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setErrorMessage("Unable to load orders right now.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // Fetch Products
  // =========================
  async function fetchProducts() {
    try {
      setProductLoading(true);
      setProductErrorMessage("");

      const response = await fetch("http://localhost:3001/products");

      if (!response.ok) {
        throw new Error("Failed to fetch products.");
      }

      const data = await response.json();
      setProducts(data);

      const initialEditingState = {};
      data.forEach((product) => {
        initialEditingState[product.id] = {
          name: product.name || "",
          price: product.price ?? "",
          category: product.category || "",
          image: product.image || "",
          description: product.description || "",
          stockQuantity: product.stockQuantity ?? 0,
          featured: Boolean(product.featured),
        };
      });

      setEditingProducts(initialEditingState);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductErrorMessage("Unable to load products right now.");
    } finally {
      setProductLoading(false);
    }
  }

  // =========================
  // Order Actions
  // =========================
  async function handleDeleteOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order.");
      }

      setOrders((prevOrders) =>
        prevOrders.filter((order) => String(order.id) !== String(orderId))
      );
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("There was a problem deleting the order.");
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status.");
      }

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order.id) === String(orderId)
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("There was a problem updating the order status.");
    }
  }

  function handleEditClick(order) {
    setEditingOrderId(order.id);
    setEditedOrderData({
      orderNumber: order.orderNumber || "",
      createdAt: order.createdAt || "",
      status: order.status || "Pending",
      totalItems: Number(order.totalItems || 0),
      customer: {
        name: order.customer?.name || "",
        phone: order.customer?.phone || "",
        address: order.customer?.address || "",
        instructions: order.customer?.instructions || "",
      },
      items: (order.items || []).map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        extras: (item.extras || []).map((extra) => ({
          name: extra.name || "",
          price: Number(extra.price || 0),
          icon: extra.icon || "",
        })),
      })),
      subtotal: Number(order.subtotal || 0),
      tax: Number(order.tax || 0),
      total: Number(order.total || 0),
    });
  }

  function handleCancelEdit() {
    setEditingOrderId(null);
    setEditedOrderData(null);
  }

  function handleEditedOrderChange(e) {
    const { name, value } = e.target;
    setEditedOrderData((prev) => ({
      ...prev,
      [name]: name === "totalItems" ? Number(value) : value,
    }));
  }

  function handleEditedCustomerChange(e) {
    const { name, value } = e.target;
    setEditedOrderData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [name]: value,
      },
    }));
  }

  function handleEditedItemChange(itemIndex, field, value) {
    setEditedOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "price"
                  ? Number(value)
                  : value,
            }
          : item
      ),
    }));
  }

  function handleEditedExtraChange(itemIndex, extraIndex, field, value) {
    setEditedOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === itemIndex
          ? {
              ...item,
              extras: (item.extras || []).map((extra, j) =>
                j === extraIndex
                  ? {
                      ...extra,
                      [field]: field === "price" ? Number(value) : value,
                    }
                  : extra
              ),
            }
          : item
      ),
    }));
  }

  function handleAddExtra(itemIndex) {
    setEditedOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              extras: [
                ...(item.extras || []),
                { name: "", price: 0, icon: "" },
              ],
            }
          : item
      ),
    }));
  }

  function handleRemoveExtra(itemIndex, extraIndex) {
    setEditedOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              extras: (item.extras || []).filter((_, i) => i !== extraIndex),
            }
          : item
      ),
    }));
  }

  function handleAddItem() {
    setEditedOrderData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          name: "",
          quantity: 1,
          price: 0,
          extras: [],
        },
      ],
    }));
  }

  function handleRemoveItem(itemIndex) {
    setEditedOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== itemIndex),
    }));
  }

  async function handleSaveEditedOrder(orderId) {
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: editedOrderData.orderNumber,
          createdAt: editedOrderData.createdAt,
          status: editedOrderData.status,
          totalItems: Number(editedOrderData.totalItems || 0),
          customer: {
            name: editedOrderData.customer.name,
            phone: editedOrderData.customer.phone,
            address: editedOrderData.customer.address,
            instructions: editedOrderData.customer.instructions,
          },
          items: editedOrderData.items,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order.");
      }

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                ...updatedOrder,
                subtotal: order.subtotal,
                tax: order.tax,
                total: order.total,
              }
            : order
        )
      );

      setEditingOrderId(null);
      setEditedOrderData(null);
      alert("Order updated successfully.");
    } catch (error) {
      console.error("Error updating order:", error);
      alert("There was a problem updating the order.");
    }
  }

  // =========================
  // Product Actions
  // =========================
  function handleProductFieldChange(productId, field, value) {
    setEditingProducts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  }

  async function handleSaveProduct(productId) {
    try {
      const updatedFields = editingProducts[productId];

      const payload = {
        name: updatedFields.name.trim(),
        price: Number(updatedFields.price),
        category: updatedFields.category.trim(),
        image: updatedFields.image.trim(),
        description: updatedFields.description.trim(),
        stockQuantity: Number(updatedFields.stockQuantity),
        featured: Boolean(updatedFields.featured),
      };

      if (!payload.name || !payload.category || !payload.image) {
        alert("Please complete name, category, and image before saving.");
        return;
      }

      if (Number.isNaN(payload.price) || payload.price < 0) {
        alert("Please enter a valid price.");
        return;
      }

      if (Number.isNaN(payload.stockQuantity) || payload.stockQuantity < 0) {
        alert("Please enter a valid stock quantity.");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save product changes.");
      }

      const updatedProduct = await response.json();

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          String(product.id) === String(productId) ? updatedProduct : product
        )
      );

      setEditingProducts((prev) => ({
        ...prev,
        [productId]: {
          name: updatedProduct.name || "",
          price: updatedProduct.price ?? "",
          category: updatedProduct.category || "",
          image: updatedProduct.image || "",
          description: updatedProduct.description || "",
          stockQuantity: updatedProduct.stockQuantity ?? 0,
          featured: Boolean(updatedProduct.featured),
        },
      }));

      alert("Product updated successfully.");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("There was a problem saving the product.");
    }
  }

  async function handleDeleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3001/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product.");
      }

      setProducts((prevProducts) =>
        prevProducts.filter((product) => String(product.id) !== String(productId))
      );

      setEditingProducts((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("There was a problem deleting the product.");
    }
  }

  function handleNewProductChange(field, value) {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleAddProduct(e) {
    e.preventDefault();

    const payload = {
      name: newProduct.name.trim(),
      price: Number(newProduct.price),
      category: newProduct.category.trim(),
      image: newProduct.image.trim(),
      description: newProduct.description.trim(),
      stockQuantity: Number(newProduct.stockQuantity),
      featured: Boolean(newProduct.featured),
    };

    if (!payload.name || !payload.category || !payload.image) {
      alert("Please fill in product name, category, and image.");
      return;
    }

    if (Number.isNaN(payload.price) || payload.price < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (Number.isNaN(payload.stockQuantity) || payload.stockQuantity < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add product.");
      }

      const createdProduct = await response.json();

      setProducts((prev) => [...prev, createdProduct]);

      setEditingProducts((prev) => ({
        ...prev,
        [createdProduct.id]: {
          name: createdProduct.name || "",
          price: createdProduct.price ?? "",
          category: createdProduct.category || "",
          image: createdProduct.image || "",
          description: createdProduct.description || "",
          stockQuantity: createdProduct.stockQuantity ?? 0,
          featured: Boolean(createdProduct.featured),
        },
      }));

      setNewProduct({
        name: "",
        price: "",
        category: "",
        image: "",
        description: "",
        stockQuantity: "",
        featured: false,
      });

      alert("Product added successfully.");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("There was a problem adding the product.");
    }
  }

  // =========================
  // Session
  // =========================
  function handleLogout() {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  }

  // =========================
  // Derived Data
  // =========================
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return orders;

    return orders.filter((order) => {
      const customerName = order.customer?.name?.toLowerCase() || "";
      const customerPhone = order.customer?.phone?.toLowerCase() || "";
      const orderNumber = order.orderNumber?.toLowerCase() || "";
      return (
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        orderNumber.includes(term)
      );
    });
  }, [orders, searchTerm]);

  const filteredProducts = useMemo(() => {
    const term = productSearchTerm.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";
      return name.includes(term) || category.includes(term);
    });
  }, [products, productSearchTerm]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const totalItemsSold = orders.reduce(
      (sum, order) => sum + Number(order.totalItems || 0),
      0
    );

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const pendingOrders = orders.filter(
      (order) => (order.status || "Pending") === "Pending"
    ).length;

    const completedOrders = orders.filter(
      (order) => order.status === "Completed"
    ).length;

    const totalProducts = products.length;

    const lowStockProducts = products.filter(
      (product) =>
        Number(product.stockQuantity || 0) > 0 &&
        Number(product.stockQuantity || 0) <= 5
    ).length;

    const outOfStockProducts = products.filter(
      (product) => Number(product.stockQuantity || 0) <= 0
    ).length;

    return {
      totalOrders,
      totalItemsSold,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
    };
  }, [orders, products]);

  function formatDate(dateString) {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString();
  }

  return (
    <>
      <Navbar />

      <section className="menu-hero">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage customer orders, products, and stock.</p>
        </div>
      </section>

      <main className="container admin-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`checkout-btn ${
                activeSection === "orders" ? "" : "delete-btn"
              }`}
              style={{ width: "auto", padding: "0.7rem 1.2rem" }}
              onClick={() => setActiveSection("orders")}
            >
              Orders Management
            </button>

            <button
              type="button"
              className={`checkout-btn ${
                activeSection === "products" ? "" : "delete-btn"
              }`}
              style={{ width: "auto", padding: "0.7rem 1.2rem" }}
              onClick={() => setActiveSection("products")}
            >
              Products Management
            </button>
          </div>

          <button
            type="button"
            className="checkout-btn delete-btn"
            style={{ width: "auto", padding: "0.7rem 1.2rem" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h2>Overview</h2>

        <div className="team-grid">
          <div className="team-card">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>

          <div className="team-card">
            <h3>Items Sold</h3>
            <p>{stats.totalItemsSold}</p>
          </div>

          <div className="team-card">
            <h3>Total Revenue</h3>
            <p>${stats.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="team-card">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
          </div>

          <div className="team-card">
            <h3>Completed Orders</h3>
            <p>{stats.completedOrders}</p>
          </div>

          <div className="team-card">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>

          <div className="team-card">
            <h3>Low Stock</h3>
            <p>{stats.lowStockProducts}</p>
          </div>

          <div className="team-card">
            <h3>Out of Stock</h3>
            <p>{stats.outOfStockProducts}</p>
          </div>
        </div>

        {activeSection === "orders" && (
          <section className="about-section" style={{ paddingTop: "2rem" }}>
            <h2>Orders Management</h2>

            <div
              style={{
                maxWidth: "500px",
                margin: "0 auto 2rem",
              }}
            >
              <input
                type="text"
                placeholder="Search by order number, customer name, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            {loading && <p>Loading orders...</p>}
            {!loading && errorMessage && <p>{errorMessage}</p>}
            {!loading && !errorMessage && filteredOrders.length === 0 && (
              <p>No orders found.</p>
            )}

            {!loading &&
              !errorMessage &&
              filteredOrders.length > 0 &&
              filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <strong>Order #{order.orderNumber || order.id}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  <p>
                    <strong>Name:</strong> {order.customer?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.customer?.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.customer?.address || "N/A"}
                  </p>
                  <p>
                    <strong>Instructions:</strong>{" "}
                    {order.customer?.instructions || "None"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          (order.status || "Pending") === "Completed"
                            ? "#1b5e20"
                            : "#ff7a00",
                        fontWeight: "700",
                      }}
                    >
                      {order.status || "Pending"}
                    </span>
                  </p>

                  <div className="order-items">
                    <strong>Items:</strong>
                    <ul>
                      {order.items?.map((item, index) => (
                        <li key={`${order.id}-${item.id}-${index}`}>
                          <div>
                            {item.name} × {item.quantity}, $
                            {(
                              Number(item.price) * Number(item.quantity)
                            ).toFixed(2)}
                          </div>

                          {item.extras && item.extras.length > 0 && (
                            <div
                              className="extras-badges"
                              style={{
                                marginTop: "0.4rem",
                                marginBottom: "0.4rem",
                              }}
                            >
                              {item.extras.map((extra, extraIndex) => (
                                <span
                                  key={`${extra.name}-${extraIndex}`}
                                  className="extra-badge"
                                >
                                  {extra.icon ? `${extra.icon} ` : ""}
                                  {extra.name} (+$
                                  {Number(extra.price).toFixed(2)})
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p>
                    <strong>Total Items:</strong> {order.totalItems}
                  </p>
                  <p>
                    <strong>Subtotal:</strong> $
                    {Number(order.subtotal || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Tax:</strong> ${Number(order.tax || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Total:</strong> ${Number(order.total || 0).toFixed(2)}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="checkout-btn"
                      style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                      onClick={() => handleStatusChange(order.id, "Pending")}
                    >
                      Mark Pending
                    </button>

                    <button
                      type="button"
                      className="checkout-btn"
                      style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                      onClick={() => handleStatusChange(order.id, "Completed")}
                    >
                      Mark Completed
                    </button>

                    <button
                      type="button"
                      className="checkout-btn"
                      style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                      onClick={() => handleEditClick(order)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="checkout-btn delete-btn"
                      style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      Delete Order
                    </button>
                  </div>

                  {editingOrderId === order.id && editedOrderData && (
                    <div
                      style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        border: "1px solid #ddd",
                        borderRadius: "14px",
                        background: "#fff8f2",
                      }}
                    >
                      <h3 style={{ marginBottom: "1rem" }}>Edit Order</h3>

                      <div className="form-group">
                        <label>Order Number</label>
                        <input
                          type="text"
                          name="orderNumber"
                          value={editedOrderData.orderNumber}
                          onChange={handleEditedOrderChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Created At</label>
                        <input
                          type="text"
                          name="createdAt"
                          value={editedOrderData.createdAt}
                          onChange={handleEditedOrderChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Status</label>
                        <select
                          name="status"
                          value={editedOrderData.status}
                          onChange={handleEditedOrderChange}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Total Items</label>
                        <input
                          type="number"
                          min="0"
                          name="totalItems"
                          value={editedOrderData.totalItems}
                          onChange={handleEditedOrderChange}
                        />
                      </div>

                      <hr style={{ margin: "1rem 0" }} />

                      <h4>Customer Information</h4>

                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editedOrderData.customer.name}
                          onChange={handleEditedCustomerChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="text"
                          name="phone"
                          value={editedOrderData.customer.phone}
                          onChange={handleEditedCustomerChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={editedOrderData.customer.address}
                          onChange={handleEditedCustomerChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Instructions</label>
                        <textarea
                          name="instructions"
                          rows="3"
                          value={editedOrderData.customer.instructions}
                          onChange={handleEditedCustomerChange}
                        ></textarea>
                      </div>

                      <hr style={{ margin: "1rem 0" }} />

                      <h4>Items</h4>

                      {editedOrderData.items.map((item, itemIndex) => (
                        <div
                          key={`${item.id}-${itemIndex}`}
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            padding: "1rem",
                            marginBottom: "1rem",
                            background: "#fff",
                          }}
                        >
                          <div className="form-group">
                            <label>Item Name</label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleEditedItemChange(
                                  itemIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Quantity</label>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) =>
                                handleEditedItemChange(
                                  itemIndex,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="form-group">
                            <label>Price</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handleEditedItemChange(
                                  itemIndex,
                                  "price",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <h5>Extras</h5>

                          {(item.extras || []).map((extra, extraIndex) => (
                            <div
                              key={`${extra.name}-${extraIndex}`}
                              style={{
                                border: "1px solid #eee",
                                borderRadius: "10px",
                                padding: "0.8rem",
                                marginBottom: "0.8rem",
                              }}
                            >
                              <div className="form-group">
                                <label>Extra Name</label>
                                <input
                                  type="text"
                                  value={extra.name}
                                  onChange={(e) =>
                                    handleEditedExtraChange(
                                      itemIndex,
                                      extraIndex,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label>Extra Price</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={extra.price}
                                  onChange={(e) =>
                                    handleEditedExtraChange(
                                      itemIndex,
                                      extraIndex,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label>Extra Icon</label>
                                <input
                                  type="text"
                                  value={extra.icon}
                                  onChange={(e) =>
                                    handleEditedExtraChange(
                                      itemIndex,
                                      extraIndex,
                                      "icon",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <button
                                type="button"
                                className="checkout-btn delete-btn"
                                style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                                onClick={() =>
                                  handleRemoveExtra(itemIndex, extraIndex)
                                }
                              >
                                Remove Extra
                              </button>
                            </div>
                          ))}

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                              marginTop: "0.8rem",
                            }}
                          >
                            <button
                              type="button"
                              className="checkout-btn"
                              style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                              onClick={() => handleAddExtra(itemIndex)}
                            >
                              Add Extra
                            </button>

                            <button
                              type="button"
                              className="checkout-btn delete-btn"
                              style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                              onClick={() => handleRemoveItem(itemIndex)}
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="checkout-btn"
                        style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                        onClick={handleAddItem}
                      >
                        Add New Item
                      </button>

                      <hr style={{ margin: "1rem 0" }} />

                      <h4>Read-Only Calculations</h4>
                      <p>
                        <strong>Subtotal:</strong> $
                        {Number(editedOrderData.subtotal || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Tax:</strong> $
                        {Number(editedOrderData.tax || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Total:</strong> $
                        {Number(editedOrderData.total || 0).toFixed(2)}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="checkout-btn"
                          style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                          onClick={() => handleSaveEditedOrder(order.id)}
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          className="checkout-btn delete-btn"
                          style={{ width: "auto", padding: "0.7rem 1.2rem" }}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </section>
        )}

        {activeSection === "products" && (
          <>
            <section className="about-section" style={{ paddingTop: "2rem" }}>
              <h2>Products Management</h2>

              <div
                style={{
                  maxWidth: "500px",
                  margin: "0 auto 2rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Search by product name or category"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              {productLoading && <p>Loading products...</p>}
              {!productLoading && productErrorMessage && (
                <p>{productErrorMessage}</p>
              )}
              {!productLoading &&
                !productErrorMessage &&
                filteredProducts.length === 0 && <p>No products found.</p>}

              {!productLoading &&
                !productErrorMessage &&
                filteredProducts.length > 0 &&
                filteredProducts.map((product) => {
                  const edited = editingProducts[product.id] || {};

                  return (
                    <div key={product.id} className="order-card">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "160px 1fr",
                          gap: "1.5rem",
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <img
                            src={edited.image || product.image}
                            alt={edited.name || product.name}
                            style={{
                              width: "100%",
                              borderRadius: "14px",
                              objectFit: "cover",
                              maxHeight: "180px",
                            }}
                            onError={(e) => {
                              e.target.src = "/images/logo.jpg";
                            }}
                          />
                        </div>

                        <div>
                          <h3 style={{ marginTop: 0 }}>
                            {edited.name || product.name}
                          </h3>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: "1rem",
                            }}
                          >
                            <div className="form-group">
                              <label>Name</label>
                              <input
                                type="text"
                                value={edited.name ?? ""}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Price</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={edited.price ?? ""}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Category</label>
                              <input
                                type="text"
                                value={edited.category ?? ""}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "category",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="form-group">
                              <label>Stock Quantity</label>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={edited.stockQuantity ?? 0}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "stockQuantity",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div
                              className="form-group"
                              style={{ gridColumn: "1 / -1" }}
                            >
                              <label>Image Path</label>
                              <input
                                type="text"
                                value={edited.image ?? ""}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "image",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div
                              className="form-group"
                              style={{ gridColumn: "1 / -1" }}
                            >
                              <label>Description</label>
                              <textarea
                                rows="4"
                                value={edited.description ?? ""}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                              ></textarea>
                            </div>

                            <div
                              className="form-group"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.7rem",
                              }}
                            >
                              <input
                                type="checkbox"
                                id={`featured-${product.id}`}
                                checked={Boolean(edited.featured)}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    product.id,
                                    "featured",
                                    e.target.checked
                                  )
                                }
                              />
                              <label
                                htmlFor={`featured-${product.id}`}
                                style={{ margin: 0 }}
                              >
                                Featured Product
                              </label>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              marginTop: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              className="checkout-btn"
                              style={{
                                width: "auto",
                                padding: "0.7rem 1.2rem",
                              }}
                              onClick={() => handleSaveProduct(product.id)}
                            >
                              Save Changes
                            </button>

                            <button
                              type="button"
                              className="checkout-btn delete-btn"
                              style={{
                                width: "auto",
                                padding: "0.7rem 1.2rem",
                              }}
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete Product
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </section>

            <section className="about-section" style={{ paddingTop: "2rem" }}>
              <h2>Add New Product</h2>

              <form className="customer-form" onSubmit={handleAddProduct}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="new-name">Name</label>
                    <input
                      id="new-name"
                      type="text"
                      value={newProduct.name}
                      onChange={(e) =>
                        handleNewProductChange("name", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-price">Price</label>
                    <input
                      id="new-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        handleNewProductChange("price", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-category">Category</label>
                    <input
                      id="new-category"
                      type="text"
                      value={newProduct.category}
                      onChange={(e) =>
                        handleNewProductChange("category", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-stock">Stock Quantity</label>
                    <input
                      id="new-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={newProduct.stockQuantity}
                      onChange={(e) =>
                        handleNewProductChange("stockQuantity", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="new-image">Image Path</label>
                    <input
                      id="new-image"
                      type="text"
                      placeholder="/images/example.jpg"
                      value={newProduct.image}
                      onChange={(e) =>
                        handleNewProductChange("image", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="new-description">Description</label>
                    <textarea
                      id="new-description"
                      rows="4"
                      value={newProduct.description}
                      onChange={(e) =>
                        handleNewProductChange("description", e.target.value)
                      }
                    ></textarea>
                  </div>

                  <div
                    className="form-group"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                    }}
                  >
                    <input
                      id="new-featured"
                      type="checkbox"
                      checked={newProduct.featured}
                      onChange={(e) =>
                        handleNewProductChange("featured", e.target.checked)
                      }
                    />
                    <label htmlFor="new-featured" style={{ margin: 0 }}>
                      Featured Product
                    </label>
                  </div>
                </div>

                <button type="submit" className="checkout-btn">
                  Add Product
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default Admin;

