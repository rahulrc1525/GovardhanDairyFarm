import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // Track the item being edited
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    categories: "",
  });

  // Fetch the list of food items
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error fetching list");
      }
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Error fetching list");
    }
  };

  // Remove a food item
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
      console.error("Error removing food:", error);
      toast.error("Error removing food");
    }
  };

  // Handle drag-and-drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(list);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setList(items);
  };

  // Handle edit button click
  const handleEditClick = (item) => {
    setEditingItem(item._id);
    setEditFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      categories: item.categories.join(", "), // Convert array to string
    });
  };

  // Handle changes in the edit form
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle edit form submission
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${url}/api/food/update`, {
        id: editingItem,
        ...editFormData,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingItem(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating food:", error);
      toast.error("Error updating food");
    }
  };

  // Fetch the list on component mount
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Products List</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="food-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="list-table">
              {list.map((item, index) => (
                <Draggable key={item._id} draggableId={item._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="list-table-format"
                    >
                      <img src={`${url}/images/` + item.image} alt="" />
                      {editingItem === item._id ? (
                        <form onSubmit={handleEditFormSubmit}>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditFormChange}
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            name="categories"
                            value={editFormData.categories}
                            onChange={handleEditFormChange}
                            placeholder="Categories"
                          />
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price}
                            onChange={handleEditFormChange}
                            placeholder="Price"
                          />
                          <button type="submit">Save</button>
                          <button type="button" onClick={() => setEditingItem(null)}>
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <p data-label="Name:">{item.name}</p>
                          <p data-label="Category:">{item.categories.join(", ")}</p>
                          <p data-label="Price:">Rs. {item.price}</p>
                          <p onClick={() => removeFood(item._id)} data-label="Action:" className="cursor">
                            X
                          </p>
                          <button onClick={() => handleEditClick(item)}>Edit</button>
                        </>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default List;