import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyOrder.css";
import RatingModal from "../../components/RatingModal/RatingModal";
import {
  FaBoxOpen,
  FaShippingFast,
  FaUtensils,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaBox,
  FaRegEdit
} from "react-icons/fa";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const localToken = localStorage.getItem("token");
      if (!localToken) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${url}/api/order/userOrders`,
        {},
        { headers: { Authorization: `Bearer ${localToken}` } }
      );

      if (response.data.success) {
        const filteredOrders = response.data.data.filter(
          order => order.status !== "Cancelled" && order.payment === true
        );

        const processedOrders = filteredOrders.map(order => ({
          ...order,
          items: order.items.map(item => ({
            ...item,
            image: processImageUrl(item.image, url)
          }))
        }));

        const sortedOrders = processedOrders.sort((a, b) => {
          if (a.status === "Delivered" && b.status !== "Delivered") return 1;
          if (a.status !== "Delivered" && b.status === "Delivered") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setData(sortedOrders);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const processImageUrl = (imageUrl, baseUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/80?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${baseUrl}${imageUrl}`;
    return `${baseUrl}/uploads/${imageUrl}`;
  };

  const handleRatingSubmit = async (foodId) => {
    await fetchOrders();
    setShowRatingModal(false);
  };

  const handleRateItem = (foodId, orderId) => {
    setSelectedFood(foodId);
    setSelectedOrder(orderId);
    setShowRatingModal(true);
  };
  

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="my-orders animate">
      <h2><FaBox className="title-icon" /> My Orders</h2>

      <div className="orders-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-orders animate">
            <FaBoxOpen size={60} style={{ opacity: 0.7, marginBottom: "1rem" }} />
            <p>You haven't placed any orders yet</p>
          </div>
        ) : (
          data.map((order) => (
            <div key={order._id} className="order-card animate">
              <div className="order-header">
                <div className="order-meta">
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status === "Delivered" ? (
                      <FaCheckCircle size={16} />
                    ) : order.status === "Preparing" ? (
                      <FaUtensils size={16} />
                    ) : (
                      <FaShippingFast size={16} />
                    )}
                    {order.status}
                  </span>
                </div>
                <button className="track-btn" onClick={fetchOrders}>
                  <FaMapMarkerAlt size={14} />
                  Track Order
                </button>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item._id} className="order-item">
                    <div className="order-item-img-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <div className="item-meta">
                        <span className="item-price">
                          <FaRupeeSign size={12} />
                          {item.price}
                        </span>
                        <span className="item-quantity">
                          <span style={{ fontSize: "12px" }}>×</span>
                          {item.quantity}
                        </span>
                      </div>

                      {order.status === "Delivered" && (
                        <div className="order-item-rating">
                          <button
                            className="rate-btn"
                            onClick={() => handleRateItem(item._id, order._id)}
                          >
                            <FaRegEdit size={12} />
                            Rate Item
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span>
                    <FaRupeeSign size={14} />
                    {order.amount / 100}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showRatingModal && (
        <RatingModal
          foodId={selectedFood}
          orderId={selectedOrder}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmit={() => handleRatingSubmit(selectedFood)}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default MyOrders;