import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Settings = () => {
    const [activeTab, setActiveTab] = useState(1);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [triggerFetch, setTriggerFetch] = useState(false); // state to trigger fetching
    const roleIS = localStorage.getItem('role');

    // useEffect to fetch users every time 'triggerFetch' changes
    useEffect(() => {
        const fetchUsers = async () => {
            console.log("Fetching users from S3...");
            try {
                const response = await axios.get('/admin-panel/login');  // Replace with S3 fetching logic
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setErrorMessage('Error fetching users');
            }
        };

        fetchUsers();
    }, [triggerFetch]);  // Re-fetch when 'triggerFetch' changes

    const handleNewUser = () => {
        setActiveTab(1);
        resetForm();
    };

    const handleExistingUser = () => {
        setActiveTab(2);
        setTriggerFetch(!triggerFetch);  // Fetch the users again when switching to "Edit Existing Users"
    };

    const handleUserCreationRequest = async () => {
        if (!username || !password || !role) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        const userData = { username, password, role };

        try {
            await axios.post('/admin-panel/login/register', userData);
            alert('User created successfully !!');
            resetForm();
            setTriggerFetch(!triggerFetch);  // Trigger re-fetch after user creation
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage('Error creating user');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUsername(user.username);
        setPassword('');  // Don't pre-fill password for security reasons
        setRole(user.role);
    };

    const handleUserUpdateRequest = async () => {
        if (!username || !role) {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        const userData = {
            newUsername: username,
            newPassword: password,  // Send the password if filled
            newRole: role,
        };

        try {
            await axios.put(`/admin-panel/login/update/${selectedUser.username}`, userData);
            alert('User updated successfully !!');
            resetForm();
            setTriggerFetch(!triggerFetch);  // Trigger re-fetch after user update
        } catch (error) {
            console.error('Error updating user:', error);
            setErrorMessage('Error updating user');
        }
    };

    const handleUserDeleteRequest = async (user) => {
        if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
            try {
                await axios.delete(`/admin-panel/login/delete/${user.username}`);
                alert('User deleted successfully !!');
                setTriggerFetch(!triggerFetch);  // Trigger re-fetch after user deletion
            } catch (error) {
                console.error('Error deleting user:', error);
                setErrorMessage('Error deleting user');
            }
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setRole('');
        setSelectedUser(null);
        setErrorMessage('');
    };

    return (
        roleIS === 'superadmin' ?
        <div>
            <div className="flex justify-between mb-4">
                <button
                    className={`w-[48%] px-4 py-2 text-white rounded ${activeTab === 1 ? 'bg-blue-500' : 'bg-blue-300'}`}
                    onClick={handleNewUser}
                >
                    Create New User
                </button>
                <button
                    className={`w-[48%] px-4 py-2 text-white rounded ${activeTab === 2 ? 'bg-blue-500' : 'bg-blue-300'}`}
                    onClick={handleExistingUser}
                >
                    Edit Existing User
                </button>
            </div>

            {activeTab === 1 && (
                <div className="mt-10">
                    <h1 className="text-2xl mb-2">Enter the user details</h1>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full mb-2 p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-2 p-2 border border-gray-300 rounded"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full mb-2 p-2 border border-gray-300 rounded"
                    >
                        <option value="">Select a role</option>
                        <option value="superadmin">Super admin</option>
                        <option value="admin">Admin</option>
                        <option value="compliance">Compliance</option>
                        <option value="user">Viewer</option>
                    </select>
                    {errorMessage && (
                        <p className="text-red-500 mb-2">{errorMessage}</p>
                    )}
                    <button
                        className="w-full mt-5 py-2 text-white bg-blue-500 rounded"
                        onClick={handleUserCreationRequest}
                    >
                        Create User
                    </button>
                </div>
            )}

            {activeTab === 2 && (
                <div className="mt-10">
                    <h1 className="text-2xl mb-2">Edit Existing Users</h1>
                    {users.map((user) => (
                        <div key={user.id} className="flex justify-between items-center mb-2">
                            <p>{user.username} ({user.role})</p>
                            <div>
                                <button
                                    className="bg-yellow-500 text-white px-4 py-1 rounded"
                                    onClick={() => handleEditUser(user)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-1 rounded ml-2"
                                    onClick={() => handleUserDeleteRequest(user)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {selectedUser && (
                        <div>
                            <h2 className="text-xl mt-3">Editing: {selectedUser.username}</h2>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full mb-2 p-2 border border-gray-300 rounded"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mb-2 p-2 border border-gray-300 rounded"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full mb-2 p-2 border border-gray-300 rounded"
                            >
                                <option value="">Select a role</option>
                                <option value="superadmin">Super admin</option>
                                <option value="admin">Admin</option>
                                <option value="compliance">Compliance</option>
                                <option value="user">Viewer</option>
                            </select>
                            <div className="flex justify-between">
                                <button
                                    className="w-[48%] mt-5 py-2 text-white bg-blue-600 rounded"
                                    onClick={handleUserUpdateRequest}
                                >
                                    Update User
                                </button>
                                <button
                                    className="w-[48%] mt-5 py-2 text-white bg-blue-300 hover:bg-blue-400 rounded"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        : <div className='text-xl mt-4'> You are restricted to view this</div>
    );
};

export default Settings;
