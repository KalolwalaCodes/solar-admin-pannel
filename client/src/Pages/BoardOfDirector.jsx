import React, { useState, useEffect } from 'react';

const BoardOfDirectors = () => {
  const [directors, setDirectors] = useState([]);
  const roleIS = localStorage.getItem('role');

  const [activeView, setActiveView] = useState(0); // 0: View, 1: Upload, 2: Edit
  const [newDirector, setNewDirector] = useState({
    img: '',
    name: '',
    position: '',
    desc: '',
  });
  const [editDirectorId, setEditDirectorId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const response = await fetch('/admin-panel/directors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setDirectors(data.directors);
      } catch (error) {
        console.error('Error fetching directors:', error);
      }
    };

    fetchDirectors();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDirector({
      ...newDirector,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setNewDirector({
      ...newDirector,
      img: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newDirector).forEach((key) => {
      formData.append(key, newDirector[key]);
    });
  
    try {
      const response = await fetch(`/admin-panel/directors${isEditing ? `/${editDirectorId}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const updatedDirector = { ...newDirector, id: isEditing ? editDirectorId : directors.length + 1 }; // Assuming you have an ID for new director
        
        if (isEditing) {
          // Update the existing director in the state
          setDirectors((prevDirectors) => 
            prevDirectors.map((director) => 
              director.id === editDirectorId ? updatedDirector : director
            )
          );
        } else {
          // Add the new director to the state
          setDirectors((prevDirectors) => [updatedDirector, ...prevDirectors]);
        }
        
        alert(`Director ${isEditing ? 'updated' : 'added'} successfully!`);
        setActiveView(0);
        setNewDirector({
          img: '',
          name: '',
          position: '',
          desc: '',
        });
        setIsEditing(false);
      } else {
        alert(`Error ${isEditing ? 'updating' : 'adding'} director`);
      }
    } catch (error) {
      alert('Error submitting the form');
    }
  };
  

  const handleEdit = (director) => {
    setNewDirector(director);
    setEditDirectorId(director.id);
    setIsEditing(true);
    setActiveView(2);
  };

  const handleDelete = async (id,data) => {
    console.log(id,"the id to delete",data);
    const confirmDelete = window.confirm('Are you sure you want to delete this director?');
    if (confirmDelete) {
      try {
        const response = await fetch(`/admin-panel/directors/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setDirectors(directors.filter((d) => d.id !== id));
          alert('Director deleted successfully!');
        } else {
          alert('Error deleting director');
        }
      } catch (error) {
        alert('Error deleting director');
      }
    }
  };

  return (
    <>
      {(roleIS === 'superadmin' || roleIS === 'admin') ? (
        <>
          <div className="flex w-full justify-between">
            <button
              onClick={() => setActiveView(0)}
              className={`w-[50%] bg-${activeView === 0 ? 'blue-500' : 'blue-300'} py-[10px] hover:bg-blue-500 rounded-sm`}
            >
              View Directors
            </button>
            <button
              onClick={() => setActiveView(1)}
              className={`w-[50%] bg-${activeView === 1 ? 'blue-500' : 'blue-400'} py-[10px] hover:bg-blue-500 rounded-sm`}
            >
              Upload Director
            </button>
          </div>

          {/* Upload Form */}
          {activeView === 1 && (
            <div className="w-[80%] mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
              <h1 className="text-2xl font-bold mb-6 text-center">Upload Director</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="img">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    name="img"
                    id="img"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newDirector.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="position">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    id="position"
                    value={newDirector.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter position"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="desc">
                    Description
                  </label>
                  <textarea
                    name="desc"
                    id="desc"
                    value={newDirector.desc}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter description"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  {isEditing ? 'Update Director' : 'Submit'}
                </button>
              </form>
            </div>
          )}

          {/* Edit Form */}
          {activeView === 2 && (
            <div className="w-[80%] mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
              <h1 className="text-2xl font-bold mb-6 text-center">Edit Director</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="img">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    name="img"
                    id="img"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={newDirector.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="position">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    id="position"
                    value={newDirector.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter position"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2" htmlFor="desc">
                    Description
                  </label>
                  <textarea
                    name="desc"
                    id="desc"
                    value={newDirector.desc}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter description"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Update Director
                </button>
              </form>
            </div>
          )}

          {/* Directors List */}
          {activeView === 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {directors.map((director) => (
                <div key={director.id} className="p-6 bg-white shadow-lg rounded-lg">
                  <img src={director.img} alt={director.name} className="w-full h-40 object-cover rounded-t-lg" />
                  <h2 className="text-xl font-semibold mt-4">{director.name}</h2>
                  <p className="text-gray-600">{director.position}</p>
                  <p className="text-gray-500 mt-2">{director.desc}</p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleEdit(director)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(director.id,director)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="w-full text-center py-10">
          <h1 className="text-xl font-semibold">You do not have permission to view this page</h1>
        </div>
      )}
    </>
  );
};

export default BoardOfDirectors;
