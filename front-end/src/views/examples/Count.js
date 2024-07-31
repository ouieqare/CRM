import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { StatusContext } from './StatusContext';  // Si vous utilisez un contexte pour passer les données

const Count = () => {
  const [counts, setCounts] = useState({
    totalClients: 0,
    totalAppareilles: 0,
    totalFactures: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/counts', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}` }
        });
        setCounts(response.data);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <StatusContext.Provider value={counts}>
      {/* Vos composants qui nécessitent ces données ici, comme le Header */}
    </StatusContext.Provider>
  );
};

export default Count;
