import React, { createContext, useContext, useState } from 'react';

const ClientsContext = createContext();

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }) => {
  const [totalClients, setTotalClients] = useState(0);

  // Ici, vous devriez mettre à jour `totalClients` en fonction de votre logique d'application

  return (
    <ClientsContext.Provider value={{ totalClients, setTotalClients }}>
      {children}
    </ClientsContext.Provider>
  );
};
