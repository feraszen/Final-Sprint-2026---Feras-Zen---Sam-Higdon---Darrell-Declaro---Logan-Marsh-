import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Admin() {
  // Store all orders loaded from the mock backend.
  const [orders, setOrders] = useState([]);

  // Store the current search text used to filter orders.
  const [searchTerm, setSearchTerm] = useState("");

  // Control loading and error states while fetching order data.
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Used to redirect the admin after logout.
  const navigate = useNavigate();

  // Load all orders once when the admin page is opened.
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all customer orders from the mock backend service.
  async function fetchOrders() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("http://localhost:3000/orders");

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

  // Delete a specific order after confirmation from the admin user.
  async function handleDeleteOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order.");
      }

      // Remove the deleted order from the local state so the UI updates immediately.
      setOrders((prevOrders) =>
        prevOrders.filter((order) => String(order.id) !== String(orderId))
      );
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("There was a problem deleting the order.");
    }
  }

  // Update only the status field of the selected order using PATCH.
  async function handleStatusChange(orderId, newStatus) {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
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

      // Sync the updated order status in the local state.
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

  // End the current admin session and redirect to the login page.
  function handleLogout() {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  }

  // Filter orders by customer name or phone number based on the search input.
  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return orders;

    return orders.filter((order) => {
      const customerName = order.customer?.name?.toLowerCase() || "";
      const customerPhone = order.customer?.phone?.toLowerCase() || "";
      return customerName.includes(term) || customerPhone.includes(term);
    });
  }, [orders, searchTerm]);

  // Calculate dashboard summary statistics from the current orders list.
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

    return {
      totalOrders,
      totalItemsSold,
      totalRevenue,
      pendingOrders,
      completedOrders,
    };
  }, [orders]);

  // Convert ISO date strings into a readable date and time format.
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
          <p>Manage customer orders and monitor activity.</p>
        </div>
      </section>

      <main className="container admin-section">
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "2rem",
          }}
        >
          <button
            type="button"
            className="remove-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <h2>Overview</h2>

        {/* Dashboard summary cards for quick order statistics. */}
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
        </div>

        <section className="about-section" style={{ paddingTop: "2rem" }}>
          <h2>Customer Orders</h2>

          {/* Search input used to filter orders by customer information. */}
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto 2rem",
            }}
          >
            <input
              type="text"
              placeholder="Search by customer name or phone"
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

          {/* Render state-specific messages for loading, errors, and empty results. */}
          {loading && <p>Loading orders...</p>}
          {!loading && errorMessage && <p>{errorMessage}</p>}
          {!loading && !errorMessage && filteredOrders.length === 0 && (
            <p>No orders found.</p>
          )}

          {/* Render all filtered customer orders. */}
          {!loading &&
            !errorMessage &&
            filteredOrders.length > 0 &&
            filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <strong>Order #{order.id}</strong>
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

                        {/* Show extras for each item only when they exist. */}
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

                {/* Action buttons for updating or deleting the selected order. */}
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
                    className="remove-btn"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            ))}
        </section>
      </main>
    </>
  );
}

export default Admin;

