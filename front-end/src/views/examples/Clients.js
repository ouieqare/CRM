import { useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
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
import { useDropzone } from 'react-dropzone';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import Header from "components/Headers/Header.js";
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR');  // ou 'en-US' selon le format local que vous préférez
}

const Tables = () => {
  const history = useHistory();
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [modal, setModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selected, setSelected] = useState([]);

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      if (!isUploading && !uploadSuccess) {
        setSelectedFile(null);
        setUploadError("");
      }
    }
  };

  const handleOnSelect = (row, isSelect) => {
    console.log(`Select ${isSelect ? 'on' : 'off'} for row id ${row._id}`);
    if (isSelect) {
      setSelected(prevSelected => {
        const newSelected = [...prevSelected, row._id];
        console.log('New selected after add:', newSelected);
        return newSelected;
      });
    } else {
      setSelected(prevSelected => {
        const newSelected = prevSelected.filter(x => x !== row._id);
        console.log('New selected after remove:', newSelected);
        return newSelected;
      });
    }
  };
  
  const handleOnSelectAll = (isSelect, rows) => {
    console.log(`Select all ${isSelect ? 'on' : 'off'}`);
    if (isSelect) {
      const idsToSelect = rows.map(r => r._id);
      console.log('Selecting all ids:', idsToSelect);
      setSelected(idsToSelect);
    } else {
      setSelected([]);
    }
  };
  
  
  const selectAllRenderer = ({ mode, checked, indeterminate }) => (
    <input
      type={mode}
      checked={checked}
      ref={input => {
        if (input) input.indeterminate = indeterminate;
      }}
      // onChange={e => {
      //   if (e.target.checked) {
      //     const idsToSelect = clients.map(client => client._id);  // Assurez-vous que cette ligne utilise la bonne clé
      //     setSelected(idsToSelect);
      //   } else {
      //     setSelected([]);
      //   }
      // }}
      onChange={e => {
        handleOnSelectAll(e.target.checked, clients);  // Appelez handleOnSelectAll avec le bon contexte
      }}
    />
  );
  
  const handleDeleteSelected = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer les clients sélectionnés ?")) {
      for (const clientId of selected) {
        await fetch(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/${clientId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete client ${clientId}, status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.success) {
            throw new Error(data.message);
          }
          setTotalClients(prevTotal => prevTotal - 1);
          toast.success(`Client supprimé avec succès!`);
        })
        .catch(error => {
          console.error('Error:', error);
          toast.error(`Error deleting client ${clientId}: ${error.message}`);
        });
      }
      // Mise à jour de l'état après la suppression de tous les clients sélectionnés
      const newClients = clients.filter(client => !selected.includes(client._id));
      setClients(newClients);
      setSelected([]);
    }
  };
  
  
  const deleteButton = selected.length > 0 ? (
    <Button color="danger" onClick={handleDeleteSelected} style={{ marginLeft: '10px' }}>
      Supprimer la sélection
    </Button>
  ) : null;
  
  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    selected: selected,
    onSelect: handleOnSelect,
    onSelectAll: handleOnSelectAll,
    selectionHeaderRenderer: selectAllRenderer,
    style: { backgroundColor: '#c8e6c9' }
  };
  

  const fetchClients = (setClients) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }

    const cleanToken = token.trim();
    const formattedToken = cleanToken.replace('JWT ', '');

    console.log("Formatted Token from localStorage:", formattedToken);

    fetch('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients', {
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
      setClients(data);
      setTotalClients(data.length);
    })
    .catch(err => {
      console.error('Error fetching clients:', err.message);
    });
};

  const handleAddClient = () => {
    console.log('Redirection to /admin/nouveauClient');
    history.push('/admin/nouveauClient');
  };

  const handleStatusChange = (clientId, newStatus) => {
    // Mise à jour de l'état local
    const updatedClients = clients.map(client =>
      client._id === clientId ? { ...client, statut: newStatus } : client
    );
    setClients(updatedClients);
  
    // Envoie de la mise à jour au serveur
    fetch(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/${clientId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
      },
      body: JSON.stringify({ statut: newStatus })
    })
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        console.error('Failed to update status:', data.message);
        toast.error(`Erreur lors de la mise à jour du statut: ${data.message}`);
      } else {
        toast.success('Statut mis à jour avec succès!');
      }
    })
    .catch(error => {
      console.error('Error updating status:', error);
      toast.error(`Erreur: ${error.message}`);
    });
  };
  

  const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    { dataField: "nom", text: "Nom", sort: true },  // Permet le tri sur la colonne "Nom"
    { dataField: "prenom", text: "Prénom", sort: true },  // Permet le tri sur la colonne "Prénom"
    { dataField: "email", text: "Email", sort: true },  // Permet le tri sur la colonne "Email"
    { dataField: "telephonePortable", text: "Tel", sort: true },  // Permet le tri sur la colonne "Téléphone Portable"
    { dataField: "ville", text: "Ville", sort: true },  // Permet le tri sur la colonne "Ville"
    {
      dataField: "dateNaissance",
      text: "Date de Naissance",
      formatter: (cellContent, row) => formatDate(row.dateNaissance),
      sort: true  // Permet le tri sur la colonne "Date de Naissance"
    },
    {
      dataField: "statut",
      text: "Statut",
      formatter: (cell, row) => {
        return (
          <select
            defaultValue={row.statut}
            onClick={(e) => e.stopPropagation()} 
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
            className="form-control"
          >
            <option value="none"></option>
            <option value="Rdv fixé">Rdv fixé</option>
            <option value="Rdv Annulé">Rdv Annulé</option>
            <option value="Appareillé">Appareillé</option>
            <option value="Période d'essai">Période d'essai</option>
            <option value="Facturé">Facturé</option>
          </select>
        );
      },
      editor: {
        type: 'select',
        options: [
          { value: 'Rdv fixé', label: 'Rdv fixé' },
          { value: 'Rdv Annulé', label: 'Rdv Annulé' },
          { value: 'Appareillé', label: 'Appareillé' },
          { value: "Période d'essai", label: "Période d'essai" },
          { value: 'Facturé', label: 'Facturé' }
        ]
      }
    },
    {
      dataField: 'actions',
      text: 'Actions',
      formatter: (cell, row) => (
        <div>
          <Button color="primary" size="sm" onClick={() => handleEditClient(row)}>
            <i className="fas fa-pencil-alt" />
          </Button>
          {' '}
          <Button color="danger" size="sm" onClick={() => handleDeleteClient(row._id)}>
            <i className="fas fa-trash" />
          </Button>
        </div>
      )
    }
  ];
  

  const handleEditClient = (client) => {
    history.push({
      pathname: '/admin/nouveauClient',
      state: { client: client }
    });
  };


  const handleDeleteClient = (clientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      fetch(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to delete client, status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Mettre à jour l'état immédiatement pour refléter la suppression
          const newClients = clients.filter(client => client._id !== clientId);
          
          setSelected(selected.filter(id => id !== clientId)); // Nettoyer aussi les sélections
          setTotalClients(prevTotal => prevTotal - 1);
          toast.success("Client supprimé avec succès!");
          setClients(newClients);
          console.log("Clients after deletion", newClients);
        } else {
          throw new Error(data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        toast.error(`Error: ${error.message}`);
      });
    }
  };
  
  

  const handleFileUpload = () => {
    if (!selectedFile) {
      toast.warn("No file selected for upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
      },
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        return response.json();
      })
      .then(data => {
        setUploadSuccess(true);
        console.log("Import success:", data);
        fetchClients(setClients);
        setIsUploading(false);
        
        setSelectedFile(null);
        toast.success("Fichier importé avec succès!");
        toggleModal(); // Ferme le modal après l'importation réussie
      })
      .catch(err => {
        console.error("Import error:", err);
        setIsUploading(false);
        setUploadError("Error during import: " + err.message);
        toast.error("Error during import: " + err.message);
      });
      setUploadSuccess(false);
  };

  const pagination = paginationFactory({
    page: 1,
    alwaysShowAllBtns: true,
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
    fetchClients(setClients);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      console.log(acceptedFiles);
      setSelectedFile(acceptedFiles[0]);
      setUploadSuccess(true);
      setUploadError("");
      //toast.info("File selected for upload.");
    }
  });

  const sendEmailsToSelected = () => {
    const selectedClients = clients.filter(client => selected.includes(client.id));
    console.log("Sending emails to:", selectedClients.map(c => c.email));
    // Logique pour envoyer des emails
  };

  const handleSelectAllClick = () => {
    if (selected.length < clients.length) {
      setSelected(clients.map(x => x.id)); // Sélectionner tous les ID
    } else {
      setSelected([]); // Désélectionner tous
    }
  };

  

  return (
    <>
      <Header totalClients={totalClients} />
      <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <div>
                  <h3 className="mb-0" style={{ paddingBottom: '10px' }}>Clients (Total : {totalClients})</h3>
                  {/* <Button color="info" onClick={handleSelectAllClick}>
  {selected.length === clients.length ? "Désélectionner Tout" : "Sélectionner Tout"}
</Button> */}
                </div>
                <div>
                  <Button color="primary" onClick={handleAddClient} style={{ marginRight: '10px' }}>Ajouter Client</Button>
                  <Button color="info" onClick={toggleModal}>Importer Clients</Button>
                  {/* <Button color="info" onClick={sendEmailsToSelected}>Envoyer Mail</Button> */}
                </div>
              </CardHeader>
              <CardBody>
              <ToolkitProvider keyField="id" data={clients} columns={columns} search>
  {props => (
    <div>
      <div className="row mb-2">
        <div className="col-6">
        {deleteButton}
          {/* Ici, vous pouvez remettre les boutons ou autres éléments comme avant */}
        </div>
        <div className="col-6 text-right">
          <SearchBar {...props.searchProps} className="form-control-sm" placeholder="Rechercher" style={{ border: '1px solid black', maxWidth: '250px' }} />
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <BootstrapTable
          {...props.baseProps}
          keyField="_id"
          bootstrap4
          pagination={pagination}
          data={clients}
          columns={columns}
          selectRow={selectRow}
          bordered={false}
        />
      </div>
    </div>
  )}
</ToolkitProvider>

              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Importer des fichiers</ModalHeader>
        <ModalBody>
          <div {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}>
            <input {...getInputProps()} />
            <i className="fas fa-file-upload fa-2x"></i>
            <p>Formats supportés : .csv, .xlsx</p>
            {isDragActive ? (
              <p>Relâchez le fichier ici...</p>
            ) : (
              <p>Glissez-déposez des fichiers ici, ou cliquez pour sélectionner des fichiers</p>
            )}
            {isUploading && <div>Chargement...</div>}
            {uploadSuccess && <div className="alert alert-success">Fichier importé avec succès!</div>}
            {uploadError && <div className="alert alert-danger">{uploadError}</div>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleFileUpload} disabled={!selectedFile}>
            OK
          </Button>
          <Button color="secondary" onClick={toggleModal}>Fermer</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Tables;