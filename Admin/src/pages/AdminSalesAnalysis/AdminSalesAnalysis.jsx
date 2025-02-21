import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AdminSalesAnalysis.css";

const AdminSalesAnalysis = ({ url }) => {
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [singleDate, setSingleDate] = useState("");

  const fetchSalesData = async () => {
    try {
      const params = {};
      if (singleDate) {
        params.singleDate = singleDate;
      } else if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        toast.error("Please select a date range or a single date.");
        return;
      }

      console.log("Fetching sales data with params:", params); // Debugging log

      const response = await axios.get(`${url}/api/sales/analysis`, {
        params,
      });

      if (response.data.success) {
        console.log("Fetched Sales Data:", response.data.data); // Debugging log
        setSalesData(response.data.data);
      } else {
        toast.error("Error fetching sales data");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Error fetching sales data");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSalesData();
  };

  return (
    <div className="admin-sales-analysis">
      <h2>Admin Sales Analysis</h2>
      <form onSubmit={handleSubmit} className="date-selector">
        <div className="date-range">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="single-date">
          <label>Or Select a Single Date:</label>
          <input
            type="date"
            value={singleDate}
            onChange={(e) => setSingleDate(e.target.value)}
          />
        </div>
        <button type="submit" className="fetch-button">
          Fetch Data
        </button>
      </form>
      <div className="sales-table">
        {salesData.length > 0 ? (
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
        ) : (
          <p>No sales data found for the selected date(s).</p>
        )}
      </div>
    </div>
  );
};

export default AdminSalesAnalysis;