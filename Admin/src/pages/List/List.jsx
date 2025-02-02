import React, { useEffect, useState } from 'react'
import './List.css'
import axios from "axios"
import { toast } from 'react-toastify'

const List = ({url}) => {
  
  const [list,setList] = useState([]);

  const fetchList = async()=>{
    try {
      const response= await axios.get(`${url}/api/food/list`);
      if(response.data.success){
        setList(response.data.data)
      }
      else{
        toast.error("error")
      }
    } catch (error) {
      console.error('Error fetching list:', error);
      toast.error('Error fetching list')
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      await fetchList();
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing food:', error);
      toast.error('Error removing food')
    }
  };
  



  useEffect(()=>{
fetchList();
  },[])

  return(
    <div className='list add flex-col'>
      <p>All Products List</p>
      <div className="list-table">
        <div className="list-table-format  title">
          <b> Image </b>
          <b> Name </b>
          <b> Category </b>
          <b> Price </b>
          <b> Action </b>
        </div>
        {list && list.length > 0 ? (
          list.map((item,index)=>{
            return(
              <div key={index} className='list-table-format'>
              <img src={`${url}/images/` + item.image} alt="" />
              <p data-label="Name:">{item.name}</p>
              <p data-label="Category:">{item.categories.join(', ')}</p>
              <p data-label="Price:">Rs. {item.price}</p>
              <p onClick={()=>removeFood(item._id)} data-label="Action:" className='cursor'>X</p>
  </div>
            )
          })
        ) : (
          <p>No products available.</p>
        )}
      </div>

    </div>
  )
  }


export default List;
