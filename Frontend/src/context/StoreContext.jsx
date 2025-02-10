import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cart, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");

  const url = "https://govardhandairyfarmbackend.onrender.com";

  // Fetch Cart Data
  const fetchCartData = async () => {
    if (!token || !userId) {
      setCartItems({});
      return;
    }
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json"
          },
        }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      } else {
        console.error("Error fetching cart:", response.data.message);
      }
    } catch (error) {
      console.error("Fetch cart error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [token, userId]);

  // Add Item to Cart
  const addToCart = async (itemId) => {
    if (!token || !userId) {
      alert("Please login to add items to the cart.");
      return;
    }
    try {
      const response = await axios.post(
        `${url}/api/cart/add`,
        { userId, itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data.success) {
        setCartItems((prevCart) => ({
          ...prevCart,
          [itemId]: (prevCart[itemId] || 0) + 1
        }));
        console.log("Item added to cart:", response.data);
      } else {
        console.error("Add to cart failed:", response.data.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error.response?.data || error);
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (itemId) => {
    if (!token || !userId) {
      alert("Please login to remove items from cart.");
      return;
    }
    try {
      const response = await axios.post(
        `${url}/api/cart/remove`,
        { userId, itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data.success) {
        setCartItems((prev) => {
          const updatedCart = { ...prev };
          if (updatedCart[itemId] > 1) {
            updatedCart[itemId] -= 1;
          } else {
            delete updatedCart[itemId];
          }
          return updatedCart;
        });
        console.log("Item removed from cart:", response.data);
      } else {
        console.error("Remove from cart failed:", response.data.message);
      }
    } catch (error) {
      console.error("Remove from cart error:", error.response?.data || error);
    }
  };

  // Fetch Food List
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        console.error("Fetch food list failed:", response.data.message);
      }
    } catch (error) {
      console.error("Fetch food list error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  // Calculate Total Cart Amount
  const getTotalCartAmount = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = foodList.find((product) => product._id === itemId);
      return item ? total + item.price * quantity : total;
    }, 0);
  };

  // Logout Function
  const logout = () => {
    setToken("");
    setUserId("");
    setCartItems({});
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    console.log("User logged out");
  };

  return (
    <StoreContext.Provider
      value={{
        foodList,
        cart,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        userId,
        setUserId,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
