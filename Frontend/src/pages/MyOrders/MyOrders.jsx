import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyOrder.css";
import RatingModal from "../../components/RatingModal/RatingModal";
import { motion, AnimatePresence } from "framer-motion";
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
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const localToken = localStorage.getItem("token") || token;
      
      if (!localToken) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${url}/api/order/userOrders`,
        { headers: { Authorization: `Bearer ${localToken}` } }
      );

      if (response.data.success) {
        const filteredOrders = response.data.data.filter(
          order => order.status !== "Cancelled" && order.payment === true
        );

        const sortedOrders = filteredOrders.sort((a, b) => {
          if (a.status === "Delivered" && b.status !== "Delivered") return 1;
          if (a.status !== "Delivered" && b.status === "Delivered") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setData(sortedOrders);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRateItem = (foodId, orderId) => {
    setSelectedFood(foodId);
    setSelectedOrder(orderId);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async () => {
    await fetchOrders();
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
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }

    return stars;
  };

  return (
    <motion.div 
      className="my-orders"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2><FaBox className="title-icon" /> My Orders</h2>
      
      <div className="orders-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={fetchOrders}>Retry</button>
          </div>
        ) : data.length === 0 ? (
          <motion.div 
            className="empty-orders"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaBoxOpen size={60} style={{ opacity: 0.7, marginBottom: "1rem" }} />
            <p>You haven't placed any orders yet</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {data.map((order) => (
              <motion.div 
                key={order._id} 
                className="order-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
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
                  <motion.button 
                    className="track-btn" 
                    onClick={fetchOrders}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaMapMarkerAlt size={14} />
                    Refresh Orders
                  </motion.button>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <motion.div 
                      key={item._id} 
                      className="order-item"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="food-item-img-container">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="food-item-image" 
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
                            <FaRupeeSign size={14} />
                            {item.price}
                          </span>
                          <span className="item-quantity">
                            × {item.quantity}
                          </span>
                        </div>

                        {order.status === "Delivered" && (
                          <div className="order-item-rating">
                            <div className="rating-stars">
                              {renderStars(item.averageRating || 0)}
                              <span className="rating-text">
                                ({item.ratings?.length || 0} ratings)
                              </span>
                            </div>
                            <motion.button 
                              className="rate-btn"
                              onClick={async () => {
                                const alreadyRated = await checkIfRated(item._id);
                                if (!alreadyRated) handleRateItem(item._id, order._id);
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaRegEdit size={14} />
                              Rate Item
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span>Total:</span>
                    <span>
                      <FaRupeeSign size={16} />
                      {order.amount / 100}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
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
      </AnimatePresence>
    </motion.div>
  );
};

export default MyOrders;