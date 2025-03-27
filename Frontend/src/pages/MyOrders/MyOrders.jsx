import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyOrder.css";
import { assests } from '../../assests/assests';
import FoodItem from "../../components/FoodItem/FoodItem";
import RatingModal from "../../components/RatingModal/RatingModal";

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
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
      }
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

  return (
    <div className="my-orders">
      <h2><img src={assests.parcel_icon} alt="" className="title-icon" /> My Orders</h2>
      
      <div className="orders-container">
        {data.length === 0 ? (
          <div className="empty-orders">
            <img src={assests.empty_order} alt="No orders" />
            <p>You haven't placed any orders yet</p>
          </div>
        ) : (
          data.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-meta">
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    <img 
                      src={
                        order.status === "Delivered" ? assests.delivered_icon :
                        order.status === "Preparing" ? assests.preparing_icon :
                        assests.arrived_icon
                      } 
                      alt={order.status}
                    />
                    {order.status}
                  </span>
                </div>
                <button className="track-btn" onClick={fetchOrders}>
                  <img src={assests.track_icon} alt="Track" />
                  Track Order
                </button>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item._id} className="order-item">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="order-item-image" 
                    />
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <div className="item-meta">
                        <span className="item-price">
                          <img src={assests.rupee_icon} alt="Price" />
                          {item.price}
                        </span>
                        <span className="item-quantity">
                          <img src={assests.quantity_icon} alt="Quantity" />
                          {item.quantity}
                        </span>
                      </div>

                      {order.status === "Delivered" && (
                        <div className="order-item-rating">
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <img
                                key={star}
                                src={
                                  star <= Math.floor(item.averageRating || 0) ? assests.star_filled :
                                  star === Math.ceil(item.averageRating || 0) && (item.averageRating || 0) % 1 >= 0.5 ? 
                                    assests.star_half : assests.star_empty
                                }
                                alt={`${star} star`}
                                className="rating-star"
                              />
                            ))}
                            <span className="rating-text">
                              ({item.ratings?.length || 0} ratings)
                            </span>
                          </div>
                          <button 
                            className="rate-btn"
                            onClick={async () => {
                              const alreadyRated = await checkIfRated(item._id);
                              if (!alreadyRated) handleRateItem(item._id, order._id);
                            }}
                          >
                            <img src={assests.rate_icon} alt="Rate" />
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
                    <img src={assests.rupee_icon} alt="Total" />
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
          onRatingSubmit={handleRatingSubmit}
          url={url}
          token={token}
        />
      )}
    </div>
  );
};

export default MyOrders;