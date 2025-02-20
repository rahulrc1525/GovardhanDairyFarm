import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assests } from "../../assests/assests";
import { useNavigate } from "react-router-dom";
import "./MyOrder.css";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Fetch and Sort Orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Redirecting to login...");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        console.log("Fetched orders:", response.data.data);

        // Sorting: Newest first, "Arrived" at the bottom
        const sortedOrders = response.data.data.sort((a, b) => {
          if (a.status === "Arrived" && b.status !== "Arrived") return 1;
          if (a.status !== "Arrived" && b.status === "Arrived") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setData(sortedOrders);
      } else {
        console.error("Failed to fetch orders:", response.data.message);
        alert("Failed to fetch orders. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      } else {
        alert("An error occurred while fetching orders. Please try again.");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="my-orders">
      <h2>📦 My Orders</h2>
      <div className="orders-container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assests.parcel_icon} alt="Order Icon" />
            <div className="order-details">
              <p className="order-food">
                {order.items.map((item, index) => (
                  <span key={index}>
                    {item.name} x {item.quantity}
                    {index !== order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
              <div className="order-summary">
                <p className="order-price">💰 Rs. {order.amount}</p>
                <p className="order-items">🛒 Items: {order.items.length}</p>
                <p className={`order-status ${order.status.toLowerCase()}`}>
                  <span>&#x25cf;</span> <b>{order.status}</b>
                </p>
              </div>
            </div>
            <button className="track-btn" onClick={fetchOrders}>🚚 Track Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
