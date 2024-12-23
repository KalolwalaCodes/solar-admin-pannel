import React, { useEffect, useState } from "react";
import axios from "axios";
import AlertInvertedColors from '../components/ui/Alerts';
const IndustrialProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalData, setModalData] = useState({ title: "", description: "", imageUrl: "", pdfUrl: "", category: "",id:"" });
  const [isEdit, setIsEdit] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [alertMessage,setAlertMessage]=useState();
  const [alertColor,setAlertColor]=useState();
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "/admin-panel/product-category/industrial-data",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(response.data || []);
        const uniqueCategories = ["All", ...new Set(response.data.map((item) => item.category))];
        setCategories(uniqueCategories);
        setLoading(false);
        setAlertMessage(
          `Product data fetched successfully ,${Math.floor(Date.now() / 1000)}`
        );
        setAlertColor("success") 
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddProduct = () => {
    setIsEdit(false);
    setModalData({ title: "", description: "", imageUrl: "", pdfUrl: "", category: "",id:"" });
    setImageFile(null);
    setPdfFile(null);
    setShowModal(true);
    
  };

  const handleEdit = (product) => {
    setIsEdit(true);
    setModalData(product);
    setImageFile(null);
    setPdfFile(null);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.delete(
        `/admin-panel/product-category/industrial-data?id=${encodeURIComponent(productId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(data.filter((item) => item.id !== productId));
      setAlertMessage(
        ` product data deleted successfully ,${Math.floor(Date.now() / 1000)}`
      ); 
      setAlertColor("success") 
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSave = async () => {
    setButtonLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const formData = new FormData();
      formData.append("category", modalData.category || "");
      formData.append("title", modalData.title || "");
      formData.append("description", modalData.description || "");
      formData.append("id", modalData.id || "");
      if (imageFile) formData.append("image", imageFile);
      if (pdfFile) formData.append("pdf", pdfFile);
     console.log("the form data is ",formData);
      if (isEdit) {
        const res = await axios.put(
          `/admin-panel/product-category/industrial-data`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setData(res.data);
        
      } else {
        const response = await axios.post(
          "/admin-panel/product-category/industrial-data",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setData([...data, response.data]);
      }
      setAlertMessage(
        ` product data saved successfully ,${Math.floor(Date.now() / 1000)}`
      ); 
      setAlertColor("success") 
      setShowModal(false);
    } catch (error) {
      console.error("Error saving product:", error);
      setAlertMessage(
        ` ${error.message} ,${Math.floor(Date.now() / 1000)}`
      ); 
      setAlertColor("danger") 
    }
    setButtonLoading(false);
  };


  async function handleDownload(fileKey) {
    const token = localStorage.getItem("authToken");
  
    // Validate file key
    if (!fileKey) {
      console.error("File key is undefined.");
      setAlertMessage(
        `Cannot open file: Missing file key.,${Math.floor(Date.now() / 1000)}`
      ); 
      setAlertColor("danger") 
      return;
    }
  
    // Validate token
    if (!token) {
      console.error("Auth token is missing.");
      setAlertMessage(
        `Cannot open file: Missing authentication token.,${Math.floor(Date.now() / 1000)}`
      ); 
      setAlertColor("danger") 
      return;
    }
  
    // Define the API URL
    const url = `/admin-panel/product-category/pdf/${encodeURIComponent(fileKey)}`;
  
    try {
      // Send GET request with Authorization header
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Check if the request was successful
      if (!response.ok) {
        console.error("Failed to fetch file:", response);
        setAlertMessage(
          `Failed to open file. Please try again.,${Math.floor(Date.now() / 1000)}`
        ); 
        setAlertColor("danger") 
        return;
      }
  
      // Convert the response to a Blob
      const blob = await response.blob();
  
      // Create a Blob URL
      const fileUrl = window.URL.createObjectURL(blob);
  
      // Open the Blob URL in a new tab
      window.open(fileUrl, "_blank", "noopener,noreferrer");
  
      // Optional: Revoke the Blob URL after a delay to free up resources
      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 1000);
    } catch (error) {
      console.error("Error during file fetch:", error);
      setAlertMessage(
        `An error occurred while opening the file. Please try again. ,${Math.floor(Date.now() / 1000)}`
      );
      setAlertColor("danger") 
    }
  }
  

  
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "image") {
      if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
        setImageFile(file);
      } else {
        setAlertMessage(
          `Please select a valid .jpg or .png file. ,${Math.floor(Date.now() / 1000)}`
        );
        setAlertColor("danger") 
      }
    } else if (type === "pdf") {
      if (file && file.type === "application/pdf") {
        setPdfFile(file);
      } else {
        setAlertMessage(
          `Please select a valid .pdf file. ,${Math.floor(Date.now() / 1000)}`
        );
        setAlertColor("danger") 
      }
    }
  };

  const filteredData =
    selectedCategory === "All"
      ? data
      : data.filter((item) => item.category === selectedCategory);

  if (loading) {
    return <div className="text-center py-10 text-lg font-medium">Loading...</div>;
  }

  return (
    <div className=" ">
     
      <div className="flex flex-wrap justify-evenly mt-4">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 w-[250px] mb-2 rounded shadow transition ${
              selectedCategory === category ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex justify-end px-6 py-4">
      <AlertInvertedColors msg={alertMessage} color={alertColor} />
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105 hover:shadow-xl">
            <img
              src={item.imageUrl || "https://via.placeholder.com/345x160"}
              alt={item.title || "Product Image"}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800">{item.title || "Untitled Product"}</h3>
              <p className="text-sm text-gray-600 mt-2">{item.description || "No description available."}</p>
              {item.url && (
              <a
              // href={item.url}
              onClick={() => handleDownload(item.url)}
              className="text-blue-600 underline text-sm mt-2 block cursor-pointer"
            >
              Download PDF
            </a>
                      
              )}
              <p className="text-xs text-gray-500 mt-4 font-medium">Category: {item.category || "Uncategorized"}</p>
            </div>
            <div className="flex justify-around p-4 border-t">
              <button
                onClick={() => handleEdit(item)}
                className="bg-yellow-500 text-white px-4 py-2 rounded shadow hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-1/3 relative">
            <div onClick={() => setShowModal(!showModal)} className="absolute right-[3%] top-[3%] font-extrabold text-2xl cursor-pointer">
              X
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{isEdit ? "Edit Product" : "Add New Product"}</h2>
            <div>
              <label className="block text-gray-600 mb-2">Title</label>
              <input
                type="text"
                value={modalData.title}
                onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-600 mb-2">Description</label>
              <textarea
                value={modalData.description}
                onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-600 mb-2">Category</label>
              <select
                value={modalData.category}
                onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-gray-600 mb-2">Image</label>
              <input type="file" onChange={(e) => handleFileChange(e, "image")} className="w-full" />
            </div>
            <div className="mt-4">
              <label className="block text-gray-600 mb-2">PDF</label>
              <input type="file" onChange={(e) => handleFileChange(e, "pdf")} className="w-full" />
            </div>
            <div className="mt-6">
            <button
      onClick={handleSave}
      className={`bg-blue-600 text-white px-4 py-2 rounded shadow transition ${
        buttonLoading ? "cursor-not-allowed bg-gray-500" : "hover:bg-blue-700"
      }`}
      disabled={buttonLoading} // Disable button when loading
    >
      {buttonLoading ? "Saving..." : "Save"}
    </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow ml-2 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialProducts;
