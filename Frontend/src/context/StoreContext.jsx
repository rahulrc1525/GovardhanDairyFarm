import { createContext, useEffect, useState } from "react";
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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [foodRatings, setFoodRatings] = useState({});

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (token && userId) {
      fetchUserData();
      fetchCartData();
    }
  }, [token, userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${url}/api/user/check-auth`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    }
  };

  const fetchCartData = async () => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.error("Fetch cart error:", error);
    }
  };

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
    setUser(null);
    setCartItems({});
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
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
        user,
        setUser,
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