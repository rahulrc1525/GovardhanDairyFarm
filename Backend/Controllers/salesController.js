import orderModel from "../models/orderModel.js";

// Get sales analysis by category and time period
const getSalesAnalysis = async (req, res) => {
  try {
    const { period } = req.query; // period can be 'week', 'month', or 'year'
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Aggregate sales data by category
    const salesData = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "Delivered",
          payment: true,
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "foods",
          localField: "_id",
          foreignField: "name",
          as: "foodDetails",
        },
      },
      { $unwind: "$foodDetails" },
      {
        $group: {
          _id: "$foodDetails.categories",
          totalSales: { $sum: "$totalSales" },
          totalQuantity: { $sum: "$totalQuantity" },
        },
      },
    ]);

    res.status(200).json({ success: true, data: salesData });
  } catch (error) {
    console.error("Error fetching sales analysis:", error);
    res.status(500).json({ success: false, message: "Error fetching sales analysis" });
  }
};

export { getSalesAnalysis };