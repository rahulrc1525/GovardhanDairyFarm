import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cart, setCartItems] = useState({});
  const [foodList, setFoodList] = useState([]);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem("token");
    return storedToken ? storedToken : "";
  });
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem("userId");
    return storedUserId ? storedUserId : "";
  });
  const url = "https://govardhandairyfarm.onrender.com";

  const fetchCartData = async () => {
    try {
      if (token && userId) {
        const response = await axios.post(`${url}/api/cart/get`, {
          userId,
        }, {
          headers: { token },
        });
        if (response.data.success) {
          setCartItems(response.data.cartData);
        } else {
          console.error("Error fetching cart data:", response.data.message);
        }
      } else {
        setCartItems({});
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [token, userId]);

  const addToCart = async (itemId) => {
    try {
      if (!token || !userId) {
        alert("Please login to add items to cart");
        return;
      }

      setCartItems((prev) => {
        const updatedCart = { ...prev };
        if (!updatedCart[itemId]) {
          updatedCart[itemId] = 1;
        } else {
          updatedCart[itemId] += 1;
        }
        return updatedCart;
      });

      const response = await axios.post(`${url}/api/cart/add`, {
        userId,
        itemId,
      }, {
        headers: { token },
      });

      if (response.data.success) {
        console.log("Added to cart successfully");
      } else {
        console.error("Error adding to cart:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (!token || !userId) {
        alert("Please login to remove items from cart");
        return;
      }

      setCartItems((prev) => {
        const updatedCart = { ...prev };
        if (updatedCart[itemId] && updatedCart[itemId] > 1) {
          updatedCart[itemId] -= 1;
        } else {
          delete updatedCart[itemId];
        }
        return updatedCart;
      });

      const response = await axios.post(`${url}/api/cart/remove`, {
        userId,
        itemId,
      }, {
        headers: { token },
      });

      if (response.data.success) {
        console.log("Removed from cart successfully");
      } else {
        console.error("Error removing from cart:", response.data.message);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const fetchFoodList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    setFoodList(response.data.data);
  };

  useEffect(() => {
    fetchFoodList();
  }, []);

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cart) {
      if (cart[item] > 0) {
        const itemInfo = foodList.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cart[item];
        }
      }
    }
    return totalAmount;
  };

  const logout = async () => {
    try {
      setToken("");
      setUserId("");
      setCartItems({});
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <StoreContext.Provider value={{
      foodList,
      cart,
      setCartItems,
      addToCart,
      removeFromCart,
      getTotalCartAmount,
      url,
      token,
      setToken,
      userId,
      setUserId,
      logout
    }}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
