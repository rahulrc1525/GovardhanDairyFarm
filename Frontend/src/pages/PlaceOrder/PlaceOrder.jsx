import React, { useContext, useEffect, useState } from 'react';
import './Placeorder.css';
import { StoreContext } from '../../context/StoreContext';

const PlaceOrder = () => {
  const { cart ,token,food_list,cartItems,url} = useContext(StoreContext);
  const [data,setData]=useState({
    firstName:"",
    lastName:"",
    email:"",
    street:"",
    city:"",
    state:"",
    ZipCode:"",
    country:"",
    phone:"",
  })
    const onChangeHandler = (event) =>{
      const name =event.target.name;
      const value = event.target.value;
      setData(data=>({...data,[name]:value}))
    }
   
    const placeOrder =async(event)=>{
      event.preventDefault()
      let orderItems =[];
      food_list.map((item)=>{
        if(cartItems[item._id]>0){
          let itemInfo =item;
          itemInfo["quantity"]= cartItems[item._id];
          orderItems.push(itemInfo)
        }
      })
      console.log(orderItems)
    }

  
  // Calculate subtotal and total
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? 100 : 0; // Dynamic delivery fee
  const total = subtotal + deliveryFee;

  return (
    <div className="place-order-container">
      {/* Delivery Info Form */}
      <div className="delivery-info">
        <h2 className="section-title">Delivery Information</h2>

        <form onSubmit={placeOrder} className="delivery-form">
          <div className="form-group">

            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name='firstName' onChange={onChangeHandler} value={data.firstName} required placeholder="John" />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName"name='lastName' onChange={onChangeHandler} value={data.lastName} required placeholder="Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail Address</label>
            <input type="email" id="email" name='email' onChange={onChangeHandler} value={data.email}required placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label htmlFor="street">Street</label>
            <input type="text" id="street" name='street' onChange={onChangeHandler} value={data.street} required placeholder="1234 Elm St" />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input type="text" id="city" name='city' onChange={onChangeHandler} value={data.city} required placeholder="City Name" />
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input type="text" id="state" name='state' onChange={onChangeHandler} value={data.state}required placeholder="State" />
          </div>
          <div className="form-group">
            <label htmlFor="zipCode">Zip Code</label>
            <input type="text" id="zipCode" name='zipCode' onChange={onChangeHandler} value={data.ZipCode} required placeholder="123456" />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input type="text" id="country" name='country' onChange={onChangeHandler} value={data.country} required placeholder="Country Name" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">phone</label>
            <input type="text" id="phone" name='phone' onChange={onChangeHandler} value={data.phone} required placeholder="3335511111" />
          </div>
        </form>
      </div>

      {/* Cart Totals Section */}
      <div className="cart-totals">
        <h2 className="section-title">Cart Totals</h2>
        <div className="summary-details">
          <p>Subtotal: <span className="summary-value">Rs. {subtotal}</span></p>
          <p>Delivery Fees: <span className="summary-value">Rs. {deliveryFee}</span></p>
          <p className="total-amount">Total: <span className="summary-value">Rs. {total}</span></p>
          <button type='submit' className="proceed-btn">Proceed to Payment</button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
