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

  // Editing state
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedOrderData, setEditedOrderData] = useState(null);

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

  // Delete a specific order after confirmation from the admin user.
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

  // Open edit mode for a selected order.
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

  // Cancel editing.
  function handleCancelEdit() {
    setEditingOrderId(null);
    setEditedOrderData(null);
  }

  // Handle top-level edited order fields.
  function handleEditedOrderChange(e) {
    const { name, value } = e.target;
    setEditedOrderData((prev) => ({
      ...prev,
      [name]:
        name === "totalItems"
          ? Number(value)
          : value,
    }));
  }

  // Handle edited customer fields.
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

  // Handle edited item fields.
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

  // Handle edited extra fields.
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

  // Add a new extra to an item.
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

  // Remove an extra from an item.
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

  // Add a new item to an order.
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

  // Remove an item from an order.
  function handleRemoveItem(itemIndex) {
    setEditedOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((_, index) => index !== itemIndex),
    }));
  }

  // Save all editable order fields except calculations.
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

  // End the current admin session and redirect to the login page.
  function handleLogout() {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  }

  // Filter orders by customer name, phone number, or order number.
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
                              className="remove-btn"
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
                            className="action-btn"
                            onClick={() => handleAddExtra(itemIndex)}
                          >
                            Add Extra
                          </button>

                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => handleRemoveItem(itemIndex)}
                          >
                            Remove Item
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="action-btn"
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
                        onClick={() => handleSaveEditedOrder(order.id)}
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        className="remove-btn"
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
      </main>
    </>
  );
}

export default Admin;

