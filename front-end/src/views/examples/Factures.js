import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
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

const FacturesPDF = () => {
  const history = useHistory();
  const [factures, setFactures] = useState([]);
  const [totalFactures, setTotalFactures] = useState(0);
  const [modal, setModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const toggleModal = () => setModal(!modal);

  const fetchFactures = () => {
    // Fetching logic here, update the setFactures state with response data
    console.log("Fetching factures...");
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.warn("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("your-upload-url", { // Replace "your-upload-url" with your actual upload URL
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setFactures([...factures, data]);
        toast.success("Facture uploaded successfully!");
        toggleModal();
      } else {
        throw new Error(data.message || "Could not upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    { dataField: "nomClient", text: "Nom du Client", sort: true },
    { dataField: "date", text: "Date", sort: true },
    { dataField: "montant", text: "Montant", sort: true },
    {
      dataField: "pdf",
      text: "PDF",
      formatter: (cellContent, row) => (
        <a href={row.pdf} target="_blank" rel="noopener noreferrer">
          Voir PDF
        </a>
      )
    }
  ];

  const { SearchBar } = Search;

  return (
    <>
      <Header totalFactures={totalFactures} />
      <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <h3 className="mb-0">Factures PDF</h3>
                <Button color="info" onClick={toggleModal}>Importer Factures</Button>
              </CardHeader>
              <CardBody>
                <ToolkitProvider keyField="id" data={factures} columns={columns} search>
                  {props => (
                    <div>
                      <div className="row mb-2">
                        <div className="col-6 text-left">
                          {/* Any additional buttons or info can go here */}
                        </div>
                        <div className="col-6 text-right">
                          <SearchBar {...props.searchProps} className="form-control-sm" placeholder="Rechercher" />
                        </div>
                      </div>
                      <BootstrapTable
                        {...props.baseProps}
                        bootstrap4
                        pagination={paginationFactory()}
                        bordered={false}
                      />
                    </div>
                  )}
                </ToolkitProvider>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Importer des Factures</ModalHeader>
        <ModalBody>
          <input type="file" onChange={handleFileChange} accept="application/pdf" />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleFileUpload}>Importer</Button>
          <Button color="secondary" onClick={toggleModal}>Fermer</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default FacturesPDF;
