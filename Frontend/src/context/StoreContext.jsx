import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [foodList, setFoodList] = useState([]);
  const [category, setCategory] = useState("All");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const url = process.env.REACT_APP_API_URL || "http://localhost:4000";

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url+"/api/food/list", {
        params: { category: category === "All" ? "" : category },
      });
      setFoodList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching food list:", error);
    }
  };

  const saveCartToLocalStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const addToCart = async (item) => {
    if (!token) {
      alert("Please login to add items to the cart.");
      return;
    }
  
    setCart((prevCart) => {
      const itemExists = prevCart.some(
        (cartItem) =>
          cartItem.id === item.id && cartItem.name === item.name
      );
  
      const updatedCart = itemExists
        ? prevCart.map((cartItem) =>
            cartItem.id === item.id && cartItem.name === item.name
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
        : [...prevCart, { ...item, quantity: 1 }];
  
      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    });
  
    try {
      await axios.post(
        url+"/api/cart/add",
        { itemId: item.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }

      );
    } catch (error) {
      console.error("Error updating cart on backend:", error);
    }
  };
  

 const removeFromCart = async (id, name, removeAll = false) => {
  setCart((prevCart) => {
    const updatedCart = prevCart
      .map((cartItem) => {
        if (cartItem.id === id && cartItem.name === name) {
          return removeAll ? null : { ...cartItem, quantity: cartItem.quantity - 1 };
        }
        return cartItem;
      })
      .filter((cartItem) => cartItem && cartItem.quantity > 0);

    saveCartToLocalStorage(updatedCart);
    return updatedCart;
  });

  try {
    await axios.post(
      `${url}/api/cart/remove`,
      { itemId: id, removeAll },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error updating cart on backend:", error);
  }
};

  

  const getTotalCartAmount = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return subtotal - (subtotal * discount) / 100;
  };

  const applyPromoCode = (code) => {
    if (code === "SAVE10") {
      setPromoCode(code);
      setDiscount(10);
    } else {
      setPromoCode("");
      setDiscount(0);
      alert("Invalid promo code.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    };
    loadData();
  }, [category]);

  useEffect(() => {
    saveCartToLocalStorage(cart);
  }, [cart]);

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setCart([]); // Clear cart on logout
    localStorage.removeItem("cart");
  };

  const contextValue = {
    foodList,
    category,
    setCategory,
    cart,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    applyPromoCode,
    url,
    token,
    setToken: updateToken,
    promoCode,
    discount,
    logout,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;


