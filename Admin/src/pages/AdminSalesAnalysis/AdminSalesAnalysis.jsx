import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AdminSalesAnalysis.css";

const AdminSalesAnalysis = ({ url }) => {
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState("week");

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(`${url}/api/sales/analysis`, {
        params: { period },
      });

      if (response.data.success) {
        setSalesData(response.data.data);
      } else {
        toast.error("Error fetching sales data");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Error fetching sales data");
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  return (
    <div className="admin-sales-analysis">
      <h2>Admin Sales Analysis</h2>
      <div className="period-selector">
        <label>Select Period:</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>
      <div className="sales-table">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Sales (₹)</th>
              <th>Total Quantity Sold</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => (
              <tr key={index}>
                <td>{item._id}</td>
                <td>₹{item.totalSales}</td>
                <td>{item.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSalesAnalysis;