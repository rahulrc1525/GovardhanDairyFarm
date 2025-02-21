import orderModel from "../models/orderModel.js";

// Get sales analysis by category and date range or single date
const getSalesAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, singleDate } = req.query;

    let matchQuery = {
      status: "Delivered",
      payment: true,
    };

    if (singleDate) {
      // Filter for a single date
      const startOfDay = new Date(singleDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(singleDate);
      endOfDay.setHours(23, 59, 59, 999);

      matchQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      // Filter for a date range
      matchQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      return res.status(400).json({ success: false, message: "Invalid date parameters" });
    }

    // Aggregate sales data by category
    const salesData = await orderModel.aggregate([
      { $match: matchQuery },
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