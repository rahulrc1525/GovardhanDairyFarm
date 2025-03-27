import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyOrder.css";
import { assests } from './../../assests/assests';
import FoodItem from "../../components/FoodItem/FoodItem.jsx";
import RatingModal from "../../components/RatingModal/RatingModal.jsx";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch and Sort Orders
  const fetchOrders = async () => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) {
        console.error("No token found. Redirecting to login...");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${url}/api/order/userOrders`,
        {},
        {
          headers: { Authorization: `Bearer ${localToken}` },
        }
      );

      if (response.data.success) {
        // Filter out canceled orders and orders with incomplete payments
        const filteredOrders = response.data.data.filter(
          (order) => order.status !== "Cancelled" && order.payment === true
        );

        // Sort orders by status and creation date
        const sortedOrders = filteredOrders.sort((a, b) => {
          if (a.status === "Delivered" && b.status !== "Delivered") return 1;
          if (a.status !== "Delivered" && b.status === "Delivered") return -1;
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

  const handleRateItem = (foodId, orderId) => {
    setSelectedFood(foodId);
    setSelectedOrder(orderId);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    await fetchOrders(); // Refresh orders after rating submission
    setShowRatingModal(false);
  };

  const checkIfRated = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/rating/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const userId = localStorage.getItem("userId");
        return response.data.ratings.some(rating => 
          rating.userId._id === userId
        );
      }
      return false;
    } catch (error) {
      console.error("Error checking rating:", error);
      return false;
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
                <p className="order-price">💰 Rs. {order.amount / 100}</p>
                <p className="order-items">🛒 Items: {order.items.length}</p>
                <p className={`order-status ${order.status.toLowerCase()}`}>
                  <span>&#x25cf;</span> <b>{order.status}</b>
                </p>
              </div>
              
              {/* Expanded order details with items */}
              <div className="order-items-details">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-container">
                    <FoodItem
                      id={item._id}
                      name={item.name}
                      price={item.price}
                      description={item.description}
                      image={item.image}
                      showRating={order.status === "Delivered"}
                      orderId={order._id}
                    />
                    {order.status === "Delivered" && (
                      <button 
                        className="rate-item-btn"
                        onClick={async () => {
                          const alreadyRated = await checkIfRated(item._id);
                          if (!alreadyRated) {
                            handleRateItem(item._id, order._id);
                          }
                        }}
                      >
                        Rate This Item
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button className="track-btn" onClick={fetchOrders}>
              🚚 Track Order
            </button>
          </div>
        ))}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          foodId={selectedFood}
          orderId={selectedOrder}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmit={handleRatingSubmit}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default MyOrders;