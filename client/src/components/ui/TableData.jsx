import React, { useState } from 'react';

export default function BasicTable({ columns, rows, committeeName, setData, data }) {
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState([]);

  const handleEditClick = (rowIndex) => {
    setEditingRowIndex(rowIndex);
    setEditedRowData(rows[rowIndex]); // Initialize edited data with current row data
  };

  const handleInputChange = (e, index) => {
    const updatedData = [...editedRowData];
    updatedData[index] = e.target.value;
    setEditedRowData(updatedData);
  };

  const handleSubmit = async (rowIndex) => {
    const token = localStorage.getItem('authToken');
  
    // Create the updated data for just the specific row being edited
    const updatedData = [editedRowData]; // Wrap editedRowData in an array
  
    const requestBody = {
      committeeName, // Pass the committee name
      index: rowIndex, // The index of the row you are editing
      data: updatedData, // Send only the updated row wrapped in an array
    };
  
    try {
      const response = await fetch('/admin-panel/committees/update-committee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody), // Send the request body
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(result.msg); // Success message
  
        // Update local state to reflect the edited row
        setData((prevData) => {
          return prevData.map((committee) => {
            if (committee.name === committeeName) {
              // Update the specific row within the committee's data
              const updatedRows = committee.data.map((row, index) => {
                return index === rowIndex ? editedRowData : row; // Replace the edited row
              });
              return {
                ...committee,
                data: updatedRows, // Update committee data
              };
            }
            return committee; // Keep other committees unchanged
          });
        });
      } else {
        const errorData = await response.json();
        alert(errorData.msg); // Handle error
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  
    // Reset editing row index after saving
    setEditingRowIndex(null);
  };
  

  const handleCancel = () => {
    setEditingRowIndex(null); // Reset editing row index without saving
  };

  const handleDelete = async (rowIndex) => {
    const confirmed = window.confirm("Are you sure you want to delete this row?");
    if (!confirmed) return;
  
    const token = localStorage.getItem('authToken');
  
    const requestBody = {
      committeeName, // Pass the committee name
      index: rowIndex, // The index of the row you are deleting
    };
  
    try {
      const response = await fetch('/admin-panel/committees/delete-row', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(result.msg); // Success message
  
        // Update the data state by filtering out the deleted row
        setData((prevData) => {
          // Find the committee and update its data
          const updatedCommittees = prevData.map((committee) => {
            if (committee.name === committeeName) {
              // Update the data without the deleted row
              return {
                ...committee,
                data: committee.data.filter((_, index) => index !== rowIndex),
              };
            }
            return committee; // Keep other committees unchanged
          });
  
          return updatedCommittees; // Return the new state
        });
      } else {
        const errorData = await response.json();
        alert(errorData.msg); // Handle error
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };
  
  

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column, colIndex) => (
              <th key={colIndex} className="py-3 px-4 text-left text-gray-600 font-semibold border-b">{column}</th>
            ))}
            <th className="py-3 px-4 text-left text-gray-600 font-semibold border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-4 border-b text-gray-700">
                  {editingRowIndex === rowIndex ? (
                    <input
                      type="text"
                      value={editedRowData[cellIndex] || ''}
                      onChange={(e) => handleInputChange(e, cellIndex)}
                      className="border border-gray-300 rounded p-1"
                      autoFocus
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
              <td className="py-3 px-4 border-b text-gray-700">
                {editingRowIndex === rowIndex ? (
                  <div className="flex space-x-2">
                    <button 
                      className="bg-red-500 text-white px-4 py-1 rounded" 
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button 
                      className="bg-blue-500 text-white px-4 py-1 rounded" 
                      onClick={() => handleSubmit(rowIndex)}
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      className="bg-yellow-500 text-white px-4 py-1 rounded" 
                      onClick={() => handleEditClick(rowIndex)}
                    >
                      Edit
                    </button>
                    <button 
                      className="bg-red-500 text-white px-4 py-1 rounded" 
                      onClick={() => handleDelete(rowIndex)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
