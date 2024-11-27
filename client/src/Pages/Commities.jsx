import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BasicTable from '../components/ui/TableData';

const CommitteeTable = () => {
  const [data, setData] = useState([]);
  const roleIS = localStorage.getItem('role');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');

      try {
        const response = await axios.get('/admin-panel/committees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setData(response.data.departments || []); // Default to an empty array if undefined
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    (roleIS === 'superadmin' || roleIS === 'admin') ?
    <div className="container mx-auto p-4">
      {data.length > 0 ? (
        data.map((committee, index) => (
          <div key={index} className="mb-6">
            <h2 className="text-xl font-bold mb-2">{committee.name}</h2>
            <BasicTable data={data} committeeName={committee.name} columns={committee.columns} setData={setData} rows={committee.data} />
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No committees found</div> // Updated message for no data
      )}
    </div>  : <div className='text-xl mt-4'> You are restricted to view this</div>
  );
};

export default CommitteeTable;
