import React, { useState } from 'react';
import './Add.css';
import { assets } from '../../assets/assets';
import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Add = () => {
  const url = "http://localhost:4000/api/food/add";
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    categories: ""
  });
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("categories", data.categories); 
    formData.append("image", image);

    try {
      const response = await axios.post(url, formData);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/List');
      } else {
        console.error('Failed to add the product:', response.data.message);
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error occurred while adding product:', error);
      toast.error('Error occurred while adding product')
    }
  };

  return (
    <div className="add">
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img 
              src={image ? URL.createObjectURL(image) : assets.upload_area} 
              alt="upload img" 
            />
          </label>
          <input 
            onChange={(e) => setImage(e.target.files[0])} 
            type="file" 
            id="image" 
            hidden 
            required 
          />
        </div>
        <div className="add-product-name flex-col">
          <p>Product Name</p>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type="text" 
            name='name' 
            placeholder='Type here' 
            required 
          />
        </div>
        <div className="add-product-description flex-col">
          <p>Product Description</p>
          <textarea 
            onChange={onChangeHandler} 
            value={data.description} 
            name='description' 
            rows="6" 
            placeholder="Write content here" 
            required 
          />
        </div>
        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} name="categories" value={data.categories}>
              <option value="Ghee">Ghee</option>
              <option value="Milk">Milk</option>
              <option value="Curd">Curd</option>
              <option value="Buttermilk">Buttermilk</option>
              <option value="Gir Gomutra">Gir Gomutra</option>
              <option value="Cow Dung Cake">Cow Dung Cake</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input 
              onChange={onChangeHandler} 
              value={data.price} 
              type="number" 
              name='price' 
              placeholder='Rs. 20' 
              required 
            />
          </div>
        </div>
        <button type='submit' className='add-btn'>ADD</button>
      </form>
    </div>
  );
};

export default Add;
