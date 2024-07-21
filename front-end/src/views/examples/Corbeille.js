import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Button,
  CardBody,
  Card,
  CardHeader,
  Container,
  Row,
} from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import Header from "components/Headers/Header.js";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';


const Corbeille = () => {
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const { SearchBar } = Search;

  useEffect(() => {
    fetchDeletedClients();
  }, []);

  const fetchDeletedClients = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }
  
    const cleanToken = token.trim();
    const formattedToken = cleanToken.replace('JWT ', '');
  
    console.log("Formatted Token from localStorage:", formattedToken);
  
    fetch('http://localhost:5100/api/clients/deleted', {
      headers: {
         'Authorization': `Bearer ${formattedToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Deleted clients fetched:', data);
      setClients(data); // Ceci met à jour l'état avec les données récupérées
      setTotalClients(data.length);
    })
    .catch(err => {
      console.error('Error fetching clients:', err.message);
    });
  };
  
  
  

  // Définition des colonnes du tableau
  const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    { dataField: "nom", text: "Nom" },
    { dataField: "prenom", text: "Prénom" },
    { dataField: "email", text: "Email" },
    {
      dataField: "actions",
      text: "Actions",
      formatter: (cellContent, row) => (
        <div>
          <Button color="success" size="sm" onClick={() => restoreClient(row._id)}>
            Restaurer
          </Button>
          {' '}
          <Button color="danger" size="sm" onClick={() => deleteClient(row._id)}>
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      )
    }
];


  const restoreClient = (clientId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }
  
    const cleanToken = token.trim();
    const formattedToken = cleanToken.replace('JWT ', '');
  
    fetch(`http://localhost:5100/api/clients/restore/${clientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${formattedToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        setTotalClients(prevTotal => prevTotal - 1);
        toast.success("Client restauré avec succés !");
        
        setClients(currentClients => currentClients.filter(client => client._id !== clientId));
      } else {
        throw new Error(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`);
    });
  };
  
  const deleteClient = (clientId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }
  
    const cleanToken = token.trim();
    const formattedToken = cleanToken.replace('JWT ', '');
  
    fetch(`http://localhost:5100/api/clients/deletedef/${clientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${formattedToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        toast.success("Client supprimé avec succès!");
        setTotalClients(prevTotal => prevTotal - 1);
        setClients(currentClients => currentClients.filter(client => client._id !== clientId));
      } else {
        throw new Error(data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error(`Error: ${error.message}`);
    });
};


  return (
    <>
    <Header />
    <Container className="mt--7" fluid>
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Row>
        <div className="col">
          <Card className="shadow">
            <CardHeader className="border-0">
              <h3 className="mb-0">Corbeille (Total : {totalClients})</h3>
            </CardHeader>
            <CardBody>
            <ToolkitProvider
  keyField="_id"
  data={clients}
  columns={columns}
  search
>

                {
                  props => (
                    <div>
                      <SearchBar {...props.searchProps} />
                      <BootstrapTable
                        {...props.baseProps}
                        bootstrap4
                        pagination={paginationFactory()}
                        noDataIndication="Aucun client supprimé trouvé"
                      />
                    </div>
                  )
                }
              </ToolkitProvider>
            </CardBody>
          </Card>
        </div>
      </Row>
    </Container>
    </>
  );
}

export default Corbeille;
