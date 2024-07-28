import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Row, Card, CardHeader, CardBody } from "reactstrap";
import Header from "components/Headers/Header.js";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min";
import axios from 'axios';
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR');  // ou 'en-US' selon le format local que vous préférez
}
const ClientStatusPage = () => {
  const { status } = useParams(); // Récupérer le statut de l'URL
  const [clients, setClients] = useState([]); // État pour stocker les clients
  const history = useHistory();
  const totalClients = clients.length; // Nombre total de clients affichés
  

  useEffect(() => {
    const fetchClientsByStatus = async () => {
      try {
        const response = await axios.get(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/by-status/${status}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
          }
        });
        setClients(response.data);
        console.log("Clients mis à jour avec le statut", status, ":", response.data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };

    fetchClientsByStatus();
  }, [status]);

 const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    { dataField: "nom", text: "Nom", sort: true },  // Permet le tri sur la colonne "Nom"
    { dataField: "prenom", text: "Prénom", sort: true },  // Permet le tri sur la colonne "Prénom"
    { dataField: "email", text: "Email", sort: true },  // Permet le tri sur la colonne "Email"
    { dataField: "telephonePortable", text: "Téléphone Portable", sort: true },  // Permet le tri sur la colonne "Téléphone Portable"
    { dataField: "ville", text: "Ville", sort: true },  // Permet le tri sur la colonne "Ville"
    {
      dataField: "dateNaissance",
      text: "Date de Naissance",
  formatter: (cellContent, row) => formatDate(row.dateNaissance),
      sort: true  // Permet le tri sur la colonne "Date de Naissance"
    },
    {
      dataField: 'actions',
      text: 'Actions',
      formatter: (cell, row) => (
        <div>
          {/* <Button color="primary" size="sm" onClick={() => handleEditClient(row)}>
            <i className="fas fa-pencil-alt" />
          </Button> */}
          {' '}
          {/* <Button color="danger" size="sm" onClick={() => handleDeleteClient(row._id)}>
            <i className="fas fa-trash" />
          </Button> */}
        </div>
      )
    }
  ];
  const tablePagination = paginationFactory({
    page: 1,
    sizePerPage: 10,
    lastPageText: '>>',
    firstPageText: '<<',
    nextPageText: '>',
    prePageText: '<',
    // showTotal: true,
    alwaysShowAllBtns: true,
    onPageChange: function (page, sizePerPage) {
      console.log('page', page);
      console.log('sizePerPage', sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
      console.log('page', page);
      console.log('sizePerPage', sizePerPage);
    }
  });

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Clients avec le statut: {status}</h3>
              </CardHeader>
              <CardBody>
                <ToolkitProvider keyField="id" data={clients} columns={columns} search>
                  {props => (
                    <BootstrapTable
                      {...props.baseProps}
                      pagination={tablePagination}
                      bordered={false}
                    />
                  )}
                </ToolkitProvider>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default ClientStatusPage;
