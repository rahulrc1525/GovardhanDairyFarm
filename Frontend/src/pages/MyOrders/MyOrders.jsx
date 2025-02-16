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
          headers: {
            Authorization: `Bearer ${token}`, // Use Authorization header
          },
        }
      );

      if (response.data.success) {
        console.log("Fetched orders:", response.data.data);
        setData(response.data.data);
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
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order, index) => (
          <div key={index} className="my-orders-order">
            <img src={assests.parcel_icon} alt="" />
            <p>
              {order.items.map((item, index) => (
                <span key={index}>
                  {item.name} x {item.quantity}
                  {index !== order.items.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
            <p>Rs. {order.amount / 100}</p> {/* Convert paise to rupees */}
            <p>Items: {order.items.length}</p>
            <p>
              <span>&#x25cf;</span> <b>{order.status}</b>
            </p>
            <button onClick={fetchOrders}>Track Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;