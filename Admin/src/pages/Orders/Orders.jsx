import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../../assets/assets';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);

  // Fetch and Sort Orders
  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + '/api/order/list');
      if (response.data.success) {
        // Sorting logic: Delivered orders go last, others sorted by createdAt
        const sortedOrders = response.data.data.filter((order) => order.status !== "Cancelled").sort((a, b) => {
          if (a.status === "Delivered" && b.status !== "Delivered") return 1;
          if (a.status !== "Delivered" && b.status === "Delivered") return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setOrders(sortedOrders);
      } else {
        toast.error('Error fetching orders.');
      }
    } catch (error) {
      toast.error('Failed to fetch orders.');
    }
  };

  // Handle Status Change
  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + '/api/order/status', {
        orderId,
        status: event.target.value,
      });

      if (response.data.success) {
        await fetchAllOrders(); // Refresh orders after status update
      }
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className="order-container">
      {/* Header Centered */}
      <h3 className="order-header">📦 Order Management Dashboard</h3>

      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="Order" />

            <div>
              <p className="order-item-food">
                {order.items.map((item, idx) => (
                  <span key={idx}>{item.name} x {item.quantity}{idx !== order.items.length - 1 ? ', ' : ''}</span>
                ))}
              </p>
              <p className="order-item-name">
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
              </div>
              <p className="order-item-phone">📞 {order.address.phone}</p>
            </div>

            <p>🛒 Items: {order.items.length}</p>
            <p>💰 Rs. {order.amount / 100}</p>

            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
            >
              <option value="Order Processing">🍳 Food Processing</option>
              <option value="Out for delivery">🚚 Out for delivery</option>
              <option value="Delivered">✅ Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;