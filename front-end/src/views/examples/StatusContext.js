import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const StatusContext = createContext();

export const useStatus = () => useContext(StatusContext);

export const StatusProvider = ({ children }) => {
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const response = await axios.get('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/count-by-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStatusCounts(response.data);
      } catch (error) {
        console.error('Failed to fetch status counts:', error);
      }
    };

    fetchStatusCounts();
  }, []);

  return (
    <StatusContext.Provider value={statusCounts}>
      {children}
    </StatusContext.Provider>
  );
};
