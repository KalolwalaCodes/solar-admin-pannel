import React, { useState, useEffect } from 'react';
import ReorderListInvestorData from './IndustrialSequencing';

const ReorderList = () => {
  const [sustainabilityData, setSustainabilityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab,setActiveTab]=useState(1);
  // Fetch the data from the server
  const fetchData = async () => {
    try {
      const response = await fetch('/admin-panel/Sustainability'); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setSustainabilityData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Render loading or error state
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Helper function to move details
  const moveDetail = (categoryKey, itemIndex, detailIndex, direction) => {
    const newData = { ...sustainabilityData };
    const categoryItems = newData[categoryKey][0].items;
    const details = categoryItems[itemIndex].details;

    const targetIndex = detailIndex + direction;
    if (targetIndex >= 0 && targetIndex < details.length) {
      // Swap details
      [details[detailIndex], details[targetIndex]] = [details[targetIndex], details[detailIndex]];
      setSustainabilityData(newData); // Update the state with the new data
    }
  };

  // Submit the reordered list
  const handleSubmit = async () => {
    try {
      const response = await fetch('/admin-panel/sequencing/defense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({updatedData:sustainabilityData}),
      });
      if (!response.ok) throw new Error('Failed to save updated order');
      console.log('Order saved successfully!');
    } catch (err) {
      console.error('Error saving order:', err.message);
    }
  };

  // Render the list
  return (
    <div>
      <div className="flex">
        <button onClick={()=>setActiveTab(1)} className={`w-[50%] bg-${activeTab === 2 ? 'gray-100' : 'blue-500'} text-${activeTab === 2 ? 'black' : 'white'} py-2 font-bold`}>Sustainability Sequencing</button>
        <button onClick={()=>setActiveTab(2)} className={`w-[50%] bg-${activeTab === 1 ? 'gray-100' : 'blue-500'} text-${activeTab === 1 ? 'black' : 'white'} py-2 font-bold`}>Industrial Sequencing</button>
      </div>
     {activeTab===1? <>
      <h1 className="font-bold mb-2 text-red-600">Change Sequences</h1>
      {Object.keys(sustainabilityData).map((categoryKey) => (
        <div key={categoryKey} style={{ marginBottom: '20px' }}>
          <h2>{categoryKey}</h2>
          {sustainabilityData[categoryKey][0].items.map((item, itemIndex) => (
            <div
              key={item.title}
              style={{
                marginBottom: '10px',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '5px',
              }}
            >
              <h3>{item.title}</h3>
              {item.details.map((detail, detailIndex) => (
                <div
                  key={detail.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '5px',
                  }}
                  className="bg-gray-100 py-2 px-4"
                >
                  <div style={{ flex: 1 }}>{detail.title}</div>
                  <button
                    className="ml-[20px] hover:bg-blue-600 bg-blue-400"
                    onClick={() => moveDetail(categoryKey, itemIndex, detailIndex, -1)} // Move up
                    disabled={detailIndex === 0}
                    style={{
                      marginRight: '5px',
                      backgroundColor: detailIndex === 0 && '#ccc',
                      color: 'white',
                      border: 'none',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      cursor: detailIndex === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ↑
                  </button>
                  <button
                    className="hover:bg-blue-600 bg-blue-400"
                    onClick={() => moveDetail(categoryKey, itemIndex, detailIndex, 1)} // Move down
                    disabled={detailIndex === item.details.length - 1}
                    style={{
                      backgroundColor:
                        detailIndex === item.details.length - 1 && '#ccc',
                      color: 'white',
                      border: 'none',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      cursor: detailIndex === item.details.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ↓
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Submit Changes
      </button>
      </>:<ReorderListInvestorData/>}
    </div>
  );
};

export default ReorderList;
