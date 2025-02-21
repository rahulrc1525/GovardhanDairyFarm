import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
        <div className="sidebar-options">
            <NavLink to='/Add' className="sidebar-option">
                <img src={assets.add_icon} alt="add icon" />
                <p>Add Items</p>
            </NavLink>

            <NavLink to= '/List' className="sidebar-option">
                <img src={assets.order_icon} alt="order icon" />
                <p>List items</p>
            </NavLink>

            <NavLink to='/Orders' className="sidebar-option">
                <img src={assets.order_icon} alt="order icon" />
                <p>Orders</p>
            </NavLink>

            <NavLink to="/SalesAnalysis" className="sidebar-option">
            <img src={assets.analysis_icon} alt="analysis icon" />
            <p>Sales Analysis</p>
            </NavLink>
        </div>
    </div>
  )
}

export default Sidebar