// MyOrders.jsx
import React, { useContext, useEffect, useState } from 'react'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assests } from '../../assests/assests';
import './MyOrder.css'

const MyOrders = ({ location }) => {
    const [data, setData] = useState([]);
    const { url } = useContext(StoreContext);
    const token = location.state.token;

    const fetchOrders = async () => {
        try {
            const response = await axios.post(url + "/api/order/userorders", { userId: token }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                console.error("Error fetching orders:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className='my-orders-order'>
                            <img src={assests.parcel_icon} alt="" />
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " x " + item.quantity
                                }
                                else {
                                    return item.name + " x " + item.quantity + ","
                                }
                            })}</p>
                            <p>${order.amount / 100}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                            <button onClick={fetchOrders}>Track Order</button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MyOrders;
