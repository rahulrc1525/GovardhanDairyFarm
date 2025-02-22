import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./AdminSalesAnalysis.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  // Prepare data for the chart
  const chartData = {
    labels: salesData.map((item) => item._id), // Categories
    datasets: [
      {
        label: "Total Sales (₹)",
        data: salesData.map((item) => item.totalSales), // Sales data
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Total Quantity Sold",
        data: salesData.map((item) => item.totalQuantity), // Quantity data
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales Analysis by Category",
      },
    },
    animation: {
      duration: 1000, // Animation duration
      easing: "easeInOutQuart", // Smooth animation
    },
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
      <div className="sales-chart">
        {salesData.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p className="no-data">No sales data found for the selected date(s).</p>
        )}
      </div>
    </div>
  );
};

export default AdminSalesAnalysis;