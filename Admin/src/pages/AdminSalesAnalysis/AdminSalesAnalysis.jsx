import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ReactApexChart from "react-apexcharts";
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

  // Disable start/end date if single date is selected, and vice versa
  const handleSingleDateChange = (e) => {
    setSingleDate(e.target.value);
    setStartDate("");
    setEndDate("");
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setSingleDate("");
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setSingleDate("");
  };

  // Prepare data for the chart
  const chartOptions = {
    chart: {
      type: "bar",
      height: 400,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
        dataLabels: {
          position: "top", // Show data labels on top of bars
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, { seriesIndex }) {
        return seriesIndex === 0 ? `₹${val}` : `${val}`; // ₹ symbol for sales, plain number for quantity
      },
      offsetY: -20, // Adjust position of data labels
      style: {
        fontSize: "12px",
        colors: ["#333"],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: salesData.map((item) => item._id), // Categories
    },
    yaxis: {
      title: {
        text: "Amount (₹) / Quantity", // Generic title for Y-axis
      },
      labels: {
        formatter: function (value) {
          return value; // No need to add ₹ symbol here since dataLabels handle it
        },
      },
    },
    fill: {
      opacity: 1,
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#4CAF50", "#2196F3"],
        inverseColors: true,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex }) {
          return seriesIndex === 0 ? `₹${val}` : `${val}`; // ₹ symbol only for sales
        },
      },
    },
    colors: ["#4CAF50", "#2196F3"], // Gradient colors
    title: {
      text: `Sales Analysis for ${
        singleDate
          ? singleDate
          : `${startDate} to ${endDate}`
      }`, // Display selected date(s)
      align: "center",
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#333",
      },
    },
  };

  const chartSeries = [
    {
      name: "Total Sales (₹)",
      data: salesData.map((item) => item.totalSales), // Sales data
    },
    {
      name: "Total Quantity Sold",
      data: salesData.map((item) => item.totalQuantity), // Quantity data
    },
  ];

  return (
    <div className="admin-sales-analysis">
      <h2>Sales Admin Analysis</h2>
      <form onSubmit={handleSubmit} className="date-selector">
        <div className="date-range">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            disabled={!!singleDate} // Disable if single date is selected
          />
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            disabled={!!singleDate} // Disable if single date is selected
          />
        </div>
        <div className="single-date">
          <label>Or Select a Single Date:</label>
          <input
            type="date"
            value={singleDate}
            onChange={handleSingleDateChange}
            disabled={!!startDate || !!endDate} // Disable if start/end date is selected
          />
        </div>
        <button type="submit" className="fetch-button">
          Fetch Data
        </button>
      </form>
      <div className="sales-chart">
        {salesData.length > 0 ? (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={400}
          />
        ) : (
          <p className="no-data">No sales data found for the selected date(s).</p>
        )}
      </div>
    </div>
  );
};

export default AdminSalesAnalysis;