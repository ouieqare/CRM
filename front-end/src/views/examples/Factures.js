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
  const [selected, setSelected] = useState([]);
  const [selectedFactureId, setSelectedFactureId] = useState(null);
  const [hoveredFactureId, setHoveredFactureId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");


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
    setTimeout(() => {
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
    }, 100);  // Délai de 100ms
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
      //     const idsToSelect = factures.map(facture => facture._id);  // Assurez-vous que cette ligne utilise la bonne clé
      //     setSelected(idsToSelect);
      //   } else {
      //     setSelected([]);
      //   }
      // }}
      onChange={e => {
        handleOnSelectAll(e.target.checked, factures);  // Appelez handleOnSelectAll avec le bon contexte
      }}
    />
  );
  
  const handleDeleteSelected = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer les factures sélectionnés ?")) {
      for (const factureId of selected) {
        await fetch(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/factures/${factureId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete facture ${factureId}, status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.success) {
            throw new Error(data.message);
          }
          setTotalFactures(prevTotal => prevTotal - 1);
          toast.success(`Facture supprimé avec succès!`);
        })
        .catch(error => {
          console.error('Error:', error);
          toast.error(`Error deleting facture ${factureId}: ${error.message}`);
        });
      }
      // Mise à jour de l'état après la suppression de tous les factures sélectionnés
      const newFactures = factures.filter(facture => !selected.includes(facture._id));
      setFactures(newFactures);
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
    clickToSelect: false, // Désactive la sélection automatique lors du clic sur la ligne
    selected: selected,
    onSelect: handleOnSelect,
    onSelectAll: handleOnSelectAll,
    selectionHeaderRenderer: selectAllRenderer,
    style: { backgroundColor: '#c8e6c9' },
    hideSelectColumn: false, // Garde la colonne de case à cocher visible
  };

  const handleRowClick = (facture) => {
    console.log(`Navigation to facture details for ID: ${facture._id}`);
    setSelectedFactureId(facture._id);
    history.push({
      pathname: `/admin/nouvelleFacture`, // Assurez-vous que le chemin est correct
      state: { facture: facture }
    });
  };

  const fetchFactures = (setFactures) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in localStorage');
      return;
    }

    const cleanToken = token.trim();
    const formattedToken = cleanToken.replace('JWT ', '');

    console.log("Formatted Token from localStorage:", formattedToken);

    fetch('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/factures', {
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
      console.log('Factures fetched:', data);
      setFactures(data);
      setTotalFactures(data.length);
    })
    .catch(err => {
      console.error('Error fetching factures:', err.message);
    });
};

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleAddFacture = () => {
    console.log('Redirection to /admin/nouvelleFacture');
    history.push('/admin/nouvelleFacture');
  };

  const handleStatusChange = (factureId, newStatus) => {
    // Mise à jour de l'état local
    const updatedFactures = factures.map(facture =>
      facture._id === factureId ? { ...facture, statut: newStatus } : facture
    );
    setFactures(updatedFactures);
  
    // Envoie de la mise à jour au serveur
    fetch(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/factures/${factureId}/status`, {
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
  
  const handleEditFacture = (e, facture) => {
    e.stopPropagation(); // Empêche l'événement de se propager à d'autres éléments
    history.push({
      pathname: '/admin/nouvelleFacture',
      state: { facture: facture }
    });
  };
  
  const handleDeleteFacture = (e, factureId) => {
    e.stopPropagation(); // Empêche l'événement de se propager à d'autres éléments
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce facture ?")) {
      fetch(`https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/factures/${factureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to delete facture, status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          const newFactures = factures.filter(facture => facture._id !== factureId);
          setSelected(selected.filter(id => id !== factureId)); // Nettoyer aussi les sélections
          setTotalFactures(prevTotal => prevTotal - 1);
          toast.success("Facture supprimé avec succès!");
          setFactures(newFactures);
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
  
  
  const columns = [
    { dataField: "_id", text: "ID", hidden: true },
    {
      dataField: "objet",
      text: "Objet",
      sort: true,
      classes: 'col-lg-2',
      headerClasses: 'col-lg-2'
    },
    {
      dataField: "heureCreation",
      text: "Heure de Création",
      sort: true,
      classes: 'col-lg-2',
      headerClasses: 'col-lg-2'
    },
    {
      dataField: "dateFacture",
      text: "Date de la Facture",
      sort: true,
      classes: 'col-lg-2',
      headerClasses: 'col-lg-2',
      formatter: (cellContent, row) => {
        if (cellContent) {
          const date = new Date(cellContent);
          return date.toLocaleDateString("fr-FR");
        } else {
          return 'Non spécifiée';
        }
      }
    },
    {
      dataField: "nomClient",
      text: "Nom du Client",
      sort: true,
      classes: 'col-lg-2',
      headerClasses: 'col-lg-2'
    },
    {
      dataField: "totalGeneral",
      text: "Total Général",
      sort: true,
      classes: 'col-lg-2',
      headerClasses: 'col-lg-2',
      formatter: (cellContent) => typeof cellContent === 'number' ? `${cellContent.toFixed(2)} €` : 'Non spécifié' // Formate le total en euros
    },
    {
      dataField: "statut",
      text: "Statut",
      classes: 'col-md-4 col-lg-3',
      headerClasses: 'd-none d-lg-table-cell col-md-4 col-lg-3',
      formatter: (cell, row) => (
        <select
          defaultValue={row.statut}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="form-control"
          style={{ minWidth: "150px" }}
        >
          <option value="Envoyée">Envoyée</option>
          <option value="Payée">Payée</option>
          <option value="Annulée">Annulée</option>
          <option value="Créée">Créée</option>
        </select>
      )
    },
    {
      dataField: 'actions',
      text: 'Actions',
      classes: 'col-md-2 col-lg-2 text-center',
      headerClasses: 'col-md-2 col-lg-2 text-center',
      formatter: (cell, row) => (
        <div>
          <Button color="primary" size="sm" onClick={(e) => handleEditFacture(e, row)}>
            <i className="fas fa-pencil-alt"></i>
          </Button>
          <Button color="danger" size="sm" onClick={(e) => handleDeleteFacture(e, row._id)}>
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      )
    }
  ];
  
  
  // useEffect(() => {
  //   const uniqueFacturesStatuses = [...new Set(factures.map(facture => facture.statut))];
  //   localStorage.setItem('uniqueFacturesStatuses', JSON.stringify(uniqueFacturesStatuses));
  // }, [factures]);
  
  useEffect(() => {
    localStorage.setItem('totalFactures', totalFactures);
  }, [totalFactures]);
  

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

  // const columns = [
  //   { dataField: "_id", text: "ID", hidden: true },
  //   { dataField: "nomFacture", text: "Nom du Facture", sort: true },
  //   { dataField: "date", text: "Date", sort: true },
  //   { dataField: "montant", text: "Montant", sort: true },
  //   {
  //     dataField: "pdf",
  //     text: "PDF",
  //     formatter: (cellContent, row) => (
  //       <a href={row.pdf} target="_blank" rel="noopener noreferrer">
  //         Voir PDF
  //       </a>
  //     )
  //   }
  // ];

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
    fetchFactures(setFactures);
  }, [totalFactures]);

  const rowEvents = {
    onClick: (e, row, rowIndex) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.type !== 'checkbox') {
        handleRowClick(row);
      }
    },
    onMouseEnter: (e, row, rowIndex) => {
      setHoveredFactureId(row._id); // Met à jour l'état pour la ligne survolée
    },
    onMouseLeave: (e, row, rowIndex) => {
      setHoveredFactureId(null); // Réinitialise l'état lorsque la souris quitte la ligne
    }
  };
  
  
  const rowStyle = (row, rowIndex) => {
    if (row._id === selectedFactureId) {
      return { backgroundColor: '#f8f9fe', cursor: 'pointer' }; // Style pour la ligne sélectionnée
    } else if (row._id === hoveredFactureId) {
      return { backgroundColor: '#e9ecef', cursor: 'pointer' }; // Style pour la ligne survolée
    }
    return {}; // Style par défaut
  };

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
                {/* <Button color="primary" onClick={handleAddFacture} style={{ marginRight: '10px' }}>Ajouter Facture</Button> */}
                {/* <Button onClick={toggleModal} style={{ background: 'linear-gradient(87deg, #003D33 0%, #007D70 100%)',  color: 'white' }}>Importer Factures</Button> */}
                <Button onClick={handleAddFacture} style={{ background: 'linear-gradient(87deg, #003D33 0%, #007D70 100%)',  color: 'white' }}>Ajouter Facture</Button>
              </CardHeader>
              <CardBody>
                <ToolkitProvider keyField="id" data={factures} columns={columns} search>
                  {props => (
                    <div>
                      <div className="row mb-2">
                        <div className="col-6 text-left">
                        {deleteButton}
                        </div>
                        <div className="col-6 text-right">
                          <SearchBar {...props.searchProps} className="form-control-sm" placeholder="Rechercher" />
                        </div>
                      </div>
                      <BootstrapTable
  {...props.baseProps}
  keyField="_id"
  bootstrap4
  pagination={pagination}
  data={factures}
  columns={columns}
  selectRow={selectRow}
  rowEvents={rowEvents}
  rowStyle={rowStyle}
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
