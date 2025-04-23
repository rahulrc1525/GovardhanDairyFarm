import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = "https://govardhandairyfarmbackend.onrender.com";
  const [cart, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [foodRatings, setFoodRatings] = useState({});

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Save auth data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userData");
    }
  }, [token, userId, userData]);

  const fetchCartData = useCallback(async () => {
    if (!token || !userId) return;

    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [token, userId, url]);

  useEffect(() => {
    if (token && userId) {
      fetchCartData();
    }
  }, [token, userId, fetchCartData]);

  const addToCart = async (itemId) => {
    if (!token || !userId) {
      alert("Please login to add items to the cart.");
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/cart/add`,
        { userId, itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + 1,
        }));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const removeFromCart = async (itemId) => {
    if (!token || !userId) {
      alert("Please login to remove items from cart.");
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/cart/remove`,
        { userId, itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems((prev) => {
          const updated = { ...prev };
          if (updated[itemId] > 1) {
            updated[itemId] -= 1;
          } else {
            delete updated[itemId];
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.data);
      }
    } catch (error) {
      console.error("Fetch food list error:", error);
    }
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  const getTotalCartAmount = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = foodList.find((product) => product._id === itemId);
      return item ? total + item.price * quantity : total;
    }, 0);
  };

  const logout = () => {
    setToken("");
    setUserId("");
    setUserData(null);
    setCartItems({});
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    localStorage.removeItem("cart");
  };

  const clearCart = async () => {
    if (!token || !userId) return;

    try {
      const response = await axios.post(
        `${url}/api/cart/clear`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems({});
        localStorage.removeItem("cart");
      }
    } catch (error) {
      console.error("Clear cart error:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const fetchFoodRatings = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/rating/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFoodRatings((prev) => ({
          ...prev,
          [foodId]: response.data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const updateFoodRatings = (foodId, newRatingData) => {
    setFoodRatings((prev) => ({
      ...prev,
      [foodId]: newRatingData,
    }));
  };

  const setAuthData = (token, userId, userData) => {
    setToken(token);
    setUserId(userId);
    setUserData(userData);
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
        userId,
        userData,
        setAuthData,
        logout,
        clearCart,
        fetchFoodRatings,
        foodRatings,
        updateFoodRatings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;