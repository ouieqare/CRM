import React, { createContext, useContext, useState } from 'react';

const ClientsContext = createContext();

export const useClients = () => useContext(ClientsContext);

export const ClientsProvider = ({ children }) => {
    const [totalClients, setTotalClients] = useState(0);
  
    // Vous pouvez également ajouter des fonctions pour manipuler totalClients de manière plus contrôlée ici
    const incrementClients = (amount = 1) => {
      setTotalClients(prev => prev + amount);
    };
  
    const decrementClients = (amount = 1) => {
      setTotalClients(prev => prev - amount);
    };
  
    return (
      <ClientsContext.Provider value={{ totalClients, setTotalClients, incrementClients, decrementClients }}>
        {children}
      </ClientsContext.Provider>
    );
  };
  
