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
  FaRegEdit,
  FaStar
} from "react-icons/fa";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foodRatings, setFoodRatings] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const localToken = localStorage.getItem("token") || token;
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

        // Process image URLs before setting state
        const processedOrders = await Promise.all(filteredOrders.map(async order => {
          const itemsWithRatings = await Promise.all(order.items.map(async item => {
            // Check if item is eligible for rating
            let canRate = false;
            let hasRated = false;
            
            if (order.status === "Delivered") {
              const eligibility = await checkRatingEligibility(item._id, order._id);
              canRate = eligibility.canRate;
              hasRated = eligibility.hasExistingRating;
            }

            return {
              ...item,
              image: processImageUrl(item.image, url),
              canRate,
              hasRated
            };
          }));

          return {
            ...order,
            items: itemsWithRatings
          };
        }));

        const sortedOrders = processedOrders.sort((a, b) => {
          if (a.status === "Delivered" && b.status !== "Delivered") return 1;
          if (a.status !== "Delivered" && b.status === "Delivered") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setData(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error("Failed to load orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process image URLs
  const processImageUrl = (imageUrl, baseUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/80?text=No+Image';
    
    // If already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If starts with /, prepend base URL
    if (imageUrl.startsWith('/')) return `${baseUrl}${imageUrl}`;
    
    // Otherwise, assume it's in the uploads directory
    return `${baseUrl}/uploads/${imageUrl}`;
  };

  const updateFoodRatings = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/rating/${foodId}`);
      if (response.data.success) {
        setFoodRatings(prev => ({
          ...prev,
          [foodId]: response.data.data
        }));
      }
    } catch (error) {
      console.error("Error updating food ratings:", error);
    }
  };

  const checkRatingEligibility = async (foodId, orderId) => {
    try {
      const response = await axios.get(`${url}/api/rating/check-eligibility`, {
        params: { foodId, orderId },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error("Error checking rating eligibility:", error);
      return { canRate: false, hasExistingRating: false };
    }
  };

  const handleRateItem = async (foodId, orderId) => {
    try {
      const { canRate } = await checkRatingEligibility(foodId, orderId);
      if (!canRate) {
        toast.warning("This item is not eligible for rating or you've already rated it");
        return;
      }
      setSelectedFood(foodId);
      setSelectedOrder(orderId);
      setShowRatingModal(true);
    } catch (error) {
      console.error("Error in handleRateItem:", error);
      toast.error("Error preparing rating form");
    }
  };

  const handleRatingSuccess = async (foodId) => {
    await updateFoodRatings(foodId);
    await fetchOrders(); // Refresh orders to update rating status
    toast.success("Rating submitted successfully!");
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <FaCheckCircle className="status-icon delivered" />;
      case "Preparing":
        return <FaUtensils className="status-icon preparing" />;
      case "On the way":
        return <FaShippingFast className="status-icon on-the-way" />;
      default:
        return <FaBox className="status-icon" />;
    }
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
            <p>Loading your orders...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-orders animate">
            <FaBoxOpen size={60} style={{ opacity: 0.7, marginBottom: "1rem" }} />
            <p>You haven't placed any orders yet</p>
            <button 
              className="primary-btn"
              onClick={() => navigate('/')}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          data.map((order) => (
            <div key={order._id} className="order-card animate">
              <div className="order-header">
                <div className="order-meta">
                  <span className="order-date">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className={`order-status ${order.status.toLowerCase().replace(' ', '-')}`}>
                    {getOrderStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <button 
                  className="track-btn" 
                  onClick={fetchOrders}
                  title="Refresh order status"
                >
                  <FaMapMarkerAlt size={14} />
                  Track Order
                </button>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={`${order._id}-${item._id}`} className="order-item">
                    <div className="food-item-img-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="food-item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image';
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
                          <span style={{ fontSize: "14px" }}>×</span>
                          {item.quantity}
                        </span>
                      </div>

                      {order.status === "Delivered" && (
                        <div className="order-item-rating">
                          {item.hasRated ? (
                            <div className="already-rated">
                              <FaStar className="rated-star" />
                              <span>You've rated this item</span>
                            </div>
                          ) : (
                            <button
                              className="rate-btn"
                              onClick={() => handleRateItem(item._id, order._id)}
                              disabled={!item.canRate}
                            >
                              <FaRegEdit size={14} />
                              {item.canRate ? "Rate Item" : "Not Eligible"}
                            </button>
                          )}
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
                    <FaRupeeSign size={16} />
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
          onRatingSubmit={() => handleRatingSuccess(selectedFood)}
          url={url}
          token={token}
          updateFoodRatings={updateFoodRatings}
        />
      )}
    </div>
  );
};

export default MyOrders;