import orderModel from "../models/orderModel.js";

const getSalesAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, singleDate } = req.query;

    let matchQuery = {
      status: "Delivered",
      payment: true,
    };

    if (singleDate) {
      // Filter for a single date (ignore time component)
      const startOfDay = new Date(singleDate);
      startOfDay.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC

      const endOfDay = new Date(singleDate);
      endOfDay.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC

      matchQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      // Filter for a date range (ignore time component)
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0); // Set to start of the day in UTC

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999); // Set to end of the day in UTC

      matchQuery.createdAt = { $gte: start, $lte: end };
    } else {
      return res.status(400).json({ success: false, message: "Invalid date parameters" });
    }

    console.log("Match Query:", matchQuery); // Debugging log

    // Fetch orders that match the criteria
    const orders = await orderModel.find(matchQuery);
    console.log("Matching Orders:", orders); // Debugging log

    // Aggregate sales data by category
    const salesData = await orderModel.aggregate([
      { $match: matchQuery }, // Match orders based on date and status
      { $unwind: "$items" }, // Unwind the items array
      {
        $lookup: {
          from: "foods", // Ensure this matches the collection name for food items
          localField: "items._id", // Match the item's _id in orders with the food collection
          foreignField: "_id",
          as: "foodDetails",
        },
      },
      { $unwind: "$foodDetails" }, // Unwind the foodDetails array
      { $unwind: "$foodDetails.categories" }, // Unwind the categories array
      {
        $group: {
          _id: "$foodDetails.categories", // Group by food category
          totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
    ]);

    console.log("Sales Data:", salesData); // Debugging log

    res.status(200).json({ success: true, data: salesData });
  } catch (error) {
    console.error("Error fetching sales analysis:", error);
    res.status(500).json({ success: false, message: "Error fetching sales analysis" });
  }
};

export { getSalesAnalysis };