import React, { useEffect, useState } from 'react';

const RevenueExpenseManager = () => {
  const [data, setData] = useState();
  const [activeMainTitleIndex, setActiveMainTitleIndex] = useState(0);
  const [activeView, setActiveView] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState(0);
  const [newEntry, setNewEntry] = useState({ name: '', value: '', color: '' });
  const [editIndex, setEditIndex] = useState(null);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await fetch('/admin-panel/RevenueExpenseManager', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchRevenueData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (index) => {
    const editedEntry = data.datasets[selectedDataset][index];
    setNewEntry(editedEntry);
    setEditIndex(index);
    setActiveView(1);
  };
  
  const handleAddOrUpdate = async () => {
    try {
      const url = editIndex !== null
        ? `/admin-panel/RevenueExpenseManager/edit/${selectedDataset}/${editIndex}`
        : `/admin-panel/RevenueExpenseManager/add/${selectedDataset}`;
  
      const method = editIndex !== null ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEntry),
      });
  
      if (!response.ok) throw new Error('Failed to save changes');
      const updatedData = await response.json();
      setData(updatedData.data); // Update state with the latest data
    } catch (error) {
      console.error("Error updating entry:", error);
    } finally {
      setNewEntry({ name: '', value: '', color: '' });
      setEditIndex(null);
      setActiveView(0);
    }
  };
  

  const handleDelete = async (index) => {
    try {
      const response = await fetch(`/admin-panel/RevenueExpenseManager/delete/${selectedDataset}/${index}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error('Failed to delete entry');
      const updatedData = await response.json();
      setData(updatedData.data); // Update state with the latest data
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };
  

  const handleCancel = () => {
    setNewEntry({ name: '', value: '', color: '' });
    setEditIndex(null);
    setActiveView(0);
  };

  return (
    data && (
      <div className="p-6 w-full mx-auto bg-white shadow-lg rounded-lg">
        <div className="flex justify-between mb-4">
          {data.mainTitles.map((title, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveMainTitleIndex(index);
                setSelectedDataset(index * 2); // Use index to set correct dataset
              }}
              className={`px-4 py-2 rounded-md ${index === activeMainTitleIndex ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {title}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {data.mainTitles[activeMainTitleIndex]}
        </h1>
        <h2 className="text-lg font-semibold text-gray-600 mb-2">
          {data.titles[activeMainTitleIndex][selectedDataset % 2]}
        </h2>

        <div className="flex justify-between mb-4">
          <button 
            onClick={() => setActiveView(0)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Entries
          </button>
          <button 
            onClick={() => { setActiveView(1); setNewEntry({ name: '', value: '', color: '' }); setEditIndex(null); }} 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {editIndex !== null ? 'Edit Entry' : 'Add Entry'}
          </button>
        </div>

        {activeView === 0 && (
          <div>
            {data.datasets[selectedDataset].map((entry, index) => (
              <div key={index} className="flex justify-between p-2 border-b border-gray-200">
                <div className="text-gray-700">
                  <strong>{entry.name}</strong> - Value: {entry.value}% - 
                  <span className="inline-block ml-2 w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }}></span>
                </div>
                <div>
                  <button 
                    onClick={() => handleEdit(index)} 
                    className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(index)} 
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <br />
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              {data.titles[activeMainTitleIndex][selectedDataset % 2+1]}
              </h2>
            {data.datasets[selectedDataset+1].map((entry, index) => (
              <div key={index} className="flex justify-between p-2 border-b border-gray-200">
                <div className="text-gray-700">
                  <strong>{entry.name}</strong> - Value: {entry.value}% - 
                  <span className="inline-block ml-2 w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }}></span>
                </div>
                <div>
                  <button 
                    onClick={() => handleEdit(index)} 
                    className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(index)} 
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 1 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-semibold mb-4">{editIndex !== null ? 'Edit Entry' : 'Add New Entry'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdate(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newEntry.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Value (%):</label>
                <input 
                  type="number" 
                  name="value" 
                  value={newEntry.value} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium">Color:</label>
                <input 
                  type="color" 
                  name="color" 
                  value={newEntry.color} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full mt-1 h-10 p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editIndex !== null ? 'Update' : 'Add'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  );
};

export default RevenueExpenseManager;
