import { useHistory } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  CardHeader,
  // CardFooter,
  Container,
  // FormGroup,
  // Input,
  // Label,
  // Modal,
  // ModalBody,
  // ModalFooter,
  // ModalHeader,
  // Pagination,
  // PaginationItem,
  // PaginationLink,
  Row,
} from "reactstrap";
import ReactToPrint from "react-to-print";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
//import ReactBSAlert from "react-bootstrap-sweetalert";
import Header from "components/Headers/Header.js";
//import { dataTable } from "variables/general";

const fetchClients = (setClients) => { // Pass setClients as a parameter
  const token = localStorage.getItem('token');
  if (!token) {
      console.error('Token not found in localStorage');
      return;
  }

  const cleanToken = token.trim();
  const formattedToken = cleanToken.replace('JWT ', '');

  console.log("Formatted Token from localStorage:", formattedToken);

  fetch('http://localhost:5100/api/clients', {
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
      console.log('Clients fetched:', data);
      setClients(data); // Ensure this line is uncommented and correctly used
  })
  .catch(err => {
      console.error('Error fetching clients:', err.message);
  });
};


const Tables = () => {
  //const [modal, setModal] = useState(false);
  //const toggleModal = () => setModal(!modal);
  const history = useHistory();
  const [clients, setClients] = useState([]);
  const componentRef = useRef(null);

  
const handleAddClient = () => {
  console.log('Redirection to /admin/nouveauClient');
    history.push('/admin/nouveauClient');
  };

  // const copyToClipboardAsTable = () => {
  //   navigator.clipboard.writeText(JSON.stringify(clients))
  //     .then(() => {
  //       alert('Copied to clipboard successfully!');
  //     })
  //     .catch(err => {
  //       alert('Failed to copy: ', err);
  //     });
  // };

  const pagination = paginationFactory({
    page: 1,
    alwaysShowAllBtns: true,
    //showTotal: true,
    withFirstAndLast: false,
    sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
      <div className="dataTables_length" id="datatable-basic_length">
        <label>
          {" "}
          {
            <select
              name="datatable-basic_length"
              aria-controls="datatable-basic"
              className="form-control form-control-sm"
              onChange={e => onSizePerPageChange(e.target.value)}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          }{" "}
          
        </label>
      </div>
    )
  });

  const { SearchBar } = Search;
  useEffect(() => {
    fetchClients(setClients); // Pass setClients here
}, []); 


  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <h3 className="mb-0">Clients</h3>
                {/* <Button color="primary" onClick={toggleModal}>Ajouter Client</Button> */}
                <Button color="primary" onClick={handleAddClient}>Ajouter Client</Button>
              </CardHeader>
              <ToolkitProvider
  data={clients}
  keyField="id" // Assurez-vous que "id" est une clé unique dans vos données client
  columns={[
    { dataField: "id", text: "ID", sort: true, hidden: true },
    { dataField: "nom", text: "Nom", sort: true },
    { dataField: "prenom", text: "Prénom", sort: true },
    { dataField: "email", text: "Email", sort: true },
    { dataField: "telephonePortable", text: "Téléphone Portable", sort: true },
    { dataField: "ville", text: "Ville", sort: true },
    { dataField: "dateNaissance", text: "Date de Naissance", sort: true },
  ]}
  search
>

                {props => (
                  <div className="p-4">
                    <Row>
                      <Col xs={12} sm={6}>
                        <ButtonGroup>
                          {/* <Button
                            className="buttons-copy buttons-html5"
                            color="info"
                            size="sm"
                            id="copy-tooltip"
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(clients))}
                          >
                            Copier
                          </Button> */}
                          <ReactToPrint
                            trigger={() => (
                              <Button
                                color="info"
                                size="sm"
                                className="buttons-copy buttons-html5"
                                id="print-tooltip"
                              >
                                Imprimer
                              </Button>
                            )}
                            content={() => componentRef.current}
                          />
                        </ButtonGroup>
                      </Col>
                      <Col xs={12} sm={6} className="text-right">
                        <SearchBar className="form-control-sm" placeholder="Rechercher" {...props.searchProps} />
                      </Col>
                    </Row>
                    <BootstrapTable
                      ref={componentRef}
                      {...props.baseProps}
                      bootstrap4={true}
                      pagination={pagination}
                      bordered={false}
                      id="react-bs-table"
                    />
                  </div>
                )}
              </ToolkitProvider>
            </Card>
          </div>
        </Row>
      </Container>
      {/* <AddClientModal isOpen={modal} toggle={toggleModal} onSave={addNewClient} /> */}
    </>
  );
};



export default Tables;
