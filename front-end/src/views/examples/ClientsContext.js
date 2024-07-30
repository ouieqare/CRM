import React, { createContext, useContext, useState } from 'react';

const ClientsContext = createContext();

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }) => {
    const [totalClients, setTotalClients] = useState(0);
  
    return (
      <ClientsContext.Provider value={{ totalClients, setTotalClients }}>
        {children}
      </ClientsContext.Provider>
    );
  };
  
