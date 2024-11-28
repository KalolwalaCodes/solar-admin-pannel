import React, { useState, useEffect } from "react";
import axios from "axios";

const ShareHolderValue = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    value: "",
    icon: "",
  });
  const token = localStorage.getItem("authToken");

  // Fetch data from the backend
  useEffect(() => {
    axios
      .get("/admin-panel/shareholder-value", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
        console.log(response.data, "he data");
      });
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/admin-panel/shareholder-value",
        formData
      );
      setData([...data, response.data.newItem]);
      setFormData({ title: "", subtitle: "", value: "", icon: "" });
    } catch (error) {
      console.error("Error adding item:", error.message);
    }
  };

  // Delete an item
  const handleDelete = async (index) => {
    try {
      await axios.delete(
        `/admin-panel/shareholder-value/${index}`
      );
      setData(data.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  // Update an item
  const handleUpdate = async (index, updatedItem) => {
    try {
      const response = await axios.put(
        `/admin-panel/shareholder-value/${index}`,
        updatedItem
      );
      const newData = [...data];
      newData[index] = response.data.updatedItem;
      setData(newData);
    } catch (error) {
      console.error("Error updating item:", error.message);
    }
  };

  return (
    <div className="  p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Shareholder Values
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white  shadow-md rounded-md p-6 max-w-lg mx-auto mb-8"
      >
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="p-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            required
            className="p-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Value"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            required
            className="p-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Icon URL"
            value={formData.icon}
            onChange={(e) =>
              setFormData({ ...formData, icon: e.target.value })
            }
            required
            className="p-3 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-4 p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Item
        </button>
      </form>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item, index) => (
          <li
            key={index}
            className="bg-white shadow-md rounded-md p-6 flex flex-col items-center text-center"
          >
            <img
              src={item.icon}
              alt={item.title}
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
            <p className="text-gray-600">{item.subtitle}</p>
            <p className="text-blue-600 text-lg font-bold">{item.value}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDelete(index)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  handleUpdate(index, {
                    ...item,
                    value: prompt("Update Value:", item.value) || item.value,
                  })
                }
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Update
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShareHolderValue;
