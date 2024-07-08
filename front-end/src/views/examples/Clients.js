import { useHistory } from "react-router-dom";
import React, { useState, useRef } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  CardHeader,
  CardFooter,
  Container,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  UncontrolledTooltip
} from "reactstrap";
import ReactToPrint from "react-to-print";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import ReactBSAlert from "react-bootstrap-sweetalert";
import Header from "components/Headers/Header.js";
import { dataTable } from "variables/general";

// const AddClientModal = ({ isOpen, toggle, onSave }) => {
//   const [client, setClient] = useState({ name: "", email: "", phone: "" });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setClient({ ...client, [name]: value });
//   };

//   const handleSubmit = () => {
//     onSave(client);
//     toggle();
//   };

//   return (
//     <Modal isOpen={isOpen} toggle={toggle}>
//       <ModalHeader toggle={toggle}>Ajouter un nouveau client</ModalHeader>
//       <ModalBody>
//         <FormGroup>
//           <Label for="clientName">Nom</Label>
//           <Input type="text" name="name" id="clientName" placeholder="Nom du client" value={client.name} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="clientEmail">Email</Label>
//           <Input type="email" name="email" id="clientEmail" placeholder="Email du client" value={client.email} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="clientPhone">Téléphone</Label>
//           <Input type="text" name="phone" id="clientPhone" placeholder="Téléphone du client" value={client.phone} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="birthDate">Date de naissance</Label>
//           <Input type="date" name="birthDate" id="birthDate" value={client.birthDate} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="secuNumber">Numéro de sécurité sociale</Label>
//           <Input type="text" name="secuNumber" id="secuNumber" placeholder="Numéro de sécurité sociale" value={client.secuNumber} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="insurance">Mutuelle</Label>
//           <Input type="text" name="insurance" id="insurance" placeholder="Mutuelle" value={client.insurance} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="lastFittingDate">Date dernier appareillage</Label>
//           <Input type="date" name="lastFittingDate" id="lastFittingDate" value={client.lastFittingDate} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="appointmentDate">Date du RDV</Label>
//           <Input type="date" name="appointmentDate" id="appointmentDate" value={client.appointmentDate} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="appointmentTime">Heure du RDV</Label>
//           <Input type="time" name="appointmentTime" id="appointmentTime" value={client.appointmentTime} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="status">Statut</Label>
//           <Input type="select" name="status" id="status" value={client.status} onChange={handleInputChange}>
//             <option>Actif</option>
//             <option>Inactif</option>
//           </Input>
//         </FormGroup>
//         <FormGroup>
//           <Label for="hearingTest">Bilan auditif</Label>
//           <Input type="textarea" name="hearingTest" id="hearingTest" placeholder="Bilan auditif" value={client.hearingTest} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="address">Adresse</Label>
//           <Input type="text" name="address" id="address" placeholder="Adresse" value={client.address} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="landlinePhone">Tél fixe</Label>
//           <Input type="text" name="landlinePhone" id="landlinePhone" placeholder="Téléphone fixe" value={client.landlinePhone} onChange={handleInputChange} />
//         </FormGroup>
//         <FormGroup>
//           <Label for="mobilePhone">Portable</Label>
//           <Input type="text" name="mobilePhone" id="mobilePhone" placeholder="Téléphone portable" value={client.mobilePhone} onChange={handleInputChange} />
//         </FormGroup>
//       </ModalBody>
//       <ModalFooter>
//         <Button color="primary" onClick={handleSubmit}>Enregistrer</Button>
//         <Button color="secondary" onClick={toggle}>Annuler</Button>
//       </ModalFooter>
//     </Modal>
//   );
  
// };

const Tables = () => {
  //const [modal, setModal] = useState(false);
  //const toggleModal = () => setModal(!modal);
  const history = useHistory();
  const [clients, setClients] = useState(dataTable);
  const componentRef = useRef(null);

  const addNewClient = (client) => {
    setClients([...clients, { ...client, position: "01/01/2025", office: "RDV en cours", age: "N/A", start_date: "N/A", salary: "N/A" }]);
  };
const handleAddClient = () => {
  console.log('Redirection to /admin/nouveauClient');
    history.push('/admin/nouveauClient');
  };

  const copyToClipboardAsTable = () => {
    navigator.clipboard.writeText(JSON.stringify(clients))
      .then(() => {
        alert('Copied to clipboard successfully!');
      })
      .catch(err => {
        alert('Failed to copy: ', err);
      });
  };

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
                keyField="name"
                columns={[
                  { dataField: "Name", text: "Nom", sort: true },
                  { dataField: "Prénom", text: "Prénom", sort: true },
                  //{ dataField: "Numéro Sécu", text: "Numéro Sécu", sort: true },
                  { dataField: "Date", text: "Date de Naissance", sort: true },
                  { dataField: "email", text: "Email", sort: true },
                  { dataField: "phone", text: "Téléphone", sort: true },
                  { dataField: "position", text: "Date de RDV", sort: true },
                  { dataField: "office", text: "Statut", sort: true },
                //   { dataField: "age", text: "Age", sort: true },
                //   { dataField: "start_date", text: "Start Date", sort: true },
                //   { dataField: "salary", text: "Salary", sort: true }
                ]}
                search
              >
                {props => (
                  <div className="p-4">
                    <Row>
                      <Col xs={12} sm={6}>
                        <ButtonGroup>
                          <Button
                            className="buttons-copy buttons-html5"
                            color="info"
                            size="sm"
                            id="copy-tooltip"
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(clients))}
                          >
                            Copier
                          </Button>
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
