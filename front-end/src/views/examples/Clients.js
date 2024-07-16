import { useHistory } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button,
  //ButtonGroup,
  CardBody,
  Card,
  //Col,
  CardHeader,
  Container,
  Row,
} from "reactstrap";
//import ReactToPrint from "react-to-print";
import { useDropzone } from 'react-dropzone';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
//import ReactBSAlert from "react-bootstrap-sweetalert";
import Header from "components/Headers/Header.js";
//import { dataTable } from "variables/general";

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR');  // ou 'en-US' selon le format local que vous préférez
}





const Tables = () => {
  //const [modal, setModal] = useState(false);
  //const toggleModal = () => setModal(!modal);
  const history = useHistory();
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const componentRef = useRef(null);
  //const inputFileRef = useRef(null);
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
    if (!modal) { // Si le modal va être ouvert, ne réinitialisez pas
      // Réinitialisez tout seulement si le modal est fermé sans importer
      if (!isUploading && !uploadSuccess) {
        setSelectedFile(null);
        setUploadError("");
      }
    }
  };
  
  
const [isUploading, setIsUploading] = useState(false);
const [uploadSuccess, setUploadSuccess] = useState(false);
const [uploadError, setUploadError] = useState("");
const [selectedFile, setSelectedFile] = useState(null);






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

  const columns = [
    { dataField: "id", text: "ID", hidden: true },
    { dataField: "nom", text: "Nom" },
    { dataField: "prenom", text: "Prénom" },
    { dataField: "email", text: "Email" },
    { dataField: "telephonePortable", text: "Téléphone Portable" },
    { dataField: "ville", text: "Ville" },
    {
      dataField: "dateNaissance",
      text: "Date de Naissance",
      formatter: (cellContent, row) => {
        return formatDate(row.dateNaissance);  // Formate la date avant de l'afficher
      }
    },
    {
      dataField: 'actions',
      text: 'Actions',
      formatter: (cell, row) => {
        return (
          <div>
            <Button color="primary" size="sm" onClick={() => handleEditClient(row)}>
              <i className="fas fa-pencil-alt" />
            </Button>
            {' '}
            <Button color="danger" size="sm" onClick={() => handleDeleteClient(row._id)}>
              <i className="fas fa-trash" />
            </Button>
          </div>
        );
      }
    }
  ];
  
  // Fonction pour gérer la modification des clients
  const handleEditClient = (client) => {
    history.push({
      pathname: '/admin/nouveauClient',
      state: { client: client }
    });
  };
  
  // Fonction pour gérer la suppression des clients
  const handleDeleteClient = (clientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      fetch(`http://localhost:5100/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete client');
        }
        return response.json();  // Assurez-vous que le serveur renvoie une réponse JSON
      })
      .then(data => {
        if (data.success) {
          setClients(prevClients => prevClients.filter(client => client._id !== clientId));
    setTotalClients(prevTotal => prevTotal - 1);
          // ou utilisez une autre méthode de mise à jour de l'état si vous utilisez un autre état global comme Redux
        } else {
          console.error('Failed to delete client:', data.message);
        }
      })
      .catch(error => console.error('Error:', error));
    }
  };
  
  const handleFileUpload = () => {
    if (!selectedFile) return;
  
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
  
    fetch('http://localhost:5100/api/clients/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}`
      },
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Échec de l\'importation');
      }
      return response.json();
    })
    .then(data => {
      console.log("Import success:", data);
      fetchClients(setClients);  // Refresh the client list after import
      setIsUploading(false);
      setUploadSuccess(true);
      setSelectedFile(null); // Clear file after upload
    })
    .catch(err => {
      console.error("Import error:", err);
      setIsUploading(false);
      setUploadError("Erreur lors de l'importation: " + err.message);
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
  useEffect(() => {
    fetchClients(setClients); // Pass setClients here
}, []); 
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: acceptedFiles => {
    console.log(acceptedFiles);
    setSelectedFile(acceptedFiles[0]); // Assurez-vous que c'est bien un fichier
    setUploadSuccess(false);
    setUploadError("");
  }
});



return (
  <>
    <Header />
    <Container className="mt--7" fluid>
      <Row>
        <div className="col">
          <Card className="shadow">
          <CardHeader className="border-0 d-flex align-items-center justify-content-between">
  <div>
    <h3 className="mb-0">Clients (Total : {totalClients})</h3>
  </div>
  <div>
    <Button color="primary" onClick={handleAddClient} style={{ marginRight: '10px' }}>Ajouter Client</Button>
    <Button color="info" onClick={toggleModal}>Importer Clients</Button>
  </div>
</CardHeader>


            <CardBody>
              <ToolkitProvider keyField="id" data={clients} columns={columns} search>
                {props => (
                  <div>
                    <SearchBar {...props.searchProps} style={{ border: '1px solid black' }} />
                    <div style={{ overflowX: 'auto' }}>
                      <BootstrapTable {...props.baseProps} ref={componentRef} bootstrap4 pagination={pagination} bordered={false} />
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
      <i className="fas fa-file-upload fa-2x"></i> {/* Icone de FontAwesome */}
      {/* <p>Glissez-déposez des fichiers ici, ou cliquez pour sélectionner des fichiers.</p> */}
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


// import { useHistory } from "react-router-dom";
// import React, { useState, useRef, useEffect } from "react";
// import {
//   Button,
//   //ButtonGroup,
//   CardBody,
//   Card,
//   //Col,
//   CardHeader,
//   Container,
//   Row,
// } from "reactstrap";
// //import ReactToPrint from "react-to-print";
// import BootstrapTable from "react-bootstrap-table-next";
// import paginationFactory from "react-bootstrap-table2-paginator";
// import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
// //import ReactBSAlert from "react-bootstrap-sweetalert";
// import Header from "components/Headers/Header.js";
// //import { dataTable } from "variables/general";

// const formatDate = (isoString) => {
//   if (!isoString) return '';
//   const date = new Date(isoString);
//   return date.toLocaleDateString('fr-FR');  // ou 'en-US' selon le format local que vous préférez
// }


// const fetchClients = (setClients) => { // Pass setClients as a parameter
//   const token = localStorage.getItem('token');
//   if (!token) {
//       console.error('Token not found in localStorage');
//       return;
//   }

//   const cleanToken = token.trim();
//   const formattedToken = cleanToken.replace('JWT ', '');

//   console.log("Formatted Token from localStorage:", formattedToken);

//   fetch('http://localhost:5100/api/clients', {
//       headers: {
//           'Authorization': Bearer ${formattedToken}
//       }
//   })
//   .then(response => {
//       if (!response.ok) {
//           throw new Error(HTTP status ${response.status});
//       }
//       return response.json();
//   })
//   .then(data => {
//       console.log('Clients fetched:', data);
//       setClients(data); // Ensure this line is uncommented and correctly used
//   })
//   .catch(err => {
//       console.error('Error fetching clients:', err.message);
//   });
// };


// const Tables = () => {
//   //const [modal, setModal] = useState(false);
//   //const toggleModal = () => setModal(!modal);
//   const history = useHistory();
//   const [clients, setClients] = useState([]);
//   const componentRef = useRef(null);
//   const inputFileRef = useRef(null);


  
// const handleAddClient = () => {
//   console.log('Redirection to /admin/nouveauClient');
//     history.push('/admin/nouveauClient');
//   };

//   const columns = [
//     { dataField: "id", text: "ID", hidden: true },
//     { dataField: "nom", text: "Nom" },
//     { dataField: "prenom", text: "Prénom" },
//     { dataField: "email", text: "Email" },
//     { dataField: "telephonePortable", text: "Téléphone Portable" },
//     { dataField: "ville", text: "Ville" },
//     {
//       dataField: "dateNaissance",
//       text: "Date de Naissance",
//       formatter: (cellContent, row) => {
//         return formatDate(row.dateNaissance);  // Formate la date avant de l'afficher
//       }
//     },
//     {
//       dataField: 'actions',
//       text: 'Actions',
//       formatter: (cell, row) => {
//         return (
//           <div>
//             <Button color="primary" size="sm" onClick={() => handleEditClient(row)}>
//               <i className="fas fa-pencil-alt" />
//             </Button>
//             {' '}
//             <Button color="danger" size="sm" onClick={() => handleDeleteClient(row._id)}>
//               <i className="fas fa-trash" />
//             </Button>
//           </div>
//         );
//       }
//     }
//   ];
  
//   // Fonction pour gérer la modification des clients
//   const handleEditClient = (client) => {
//     history.push({
//       pathname: '/admin/nouveauClient',
//       state: { client: client }
//     });
//   };
  
//   // Fonction pour gérer la suppression des clients
//   const handleDeleteClient = (clientId) => {
//     if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
//       fetch(http://localhost:5100/api/clients/${clientId}, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}
//         }
//       })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Failed to delete client');
//         }
//         return response.json();  // Assurez-vous que le serveur renvoie une réponse JSON
//       })
//       .then(data => {
//         if (data.success) {
//           setClients(prevClients => prevClients.filter(client => client._id !== clientId));
//           // ou utilisez une autre méthode de mise à jour de l'état si vous utilisez un autre état global comme Redux
//         } else {
//           console.error('Failed to delete client:', data.message);
//         }
//       })
//       .catch(error => console.error('Error:', error));
//     }
//   };

//   // const handleFileUpload = (event) => {
//   //   const file = event.target.files[0];
//   //   if (file) {
//   //     const reader = new FileReader();
//   //     reader.onload = (e) => {
//   //       const text = e.target.result;
//   //       // Convertir CSV en JSON ici ou envoyer le texte brut au serveur pour traitement
//   //       uploadData(text);
//   //     };
//   //     reader.readAsText(file);
//   //   }
//   // };
  
//   // const uploadData = (data) => {
//   //   fetch('http://localhost:5100/api/clients/import', {
//   //     method: 'POST',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //       'Authorization': Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}
//   //     },
//   //     body: JSON.stringify({ data })
//   //   })
//   //   .then(response => response.json())
//   //   .then(data => {
//   //     console.log("Import success:", data);
//   //     fetchClients(setClients);  // Rafraîchir la liste des clients après l'import
//   //   })
//   //   .catch(err => console.error("Import error:", err));
//   // };
  
//   // // Ajouter un bouton et input dans le JSX
  
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('file', file);

//     fetch('http://localhost:5100/api/clients/import', {
//         method: 'POST',
//         headers: {
//           'Authorization': Bearer ${localStorage.getItem('token').trim().replace('JWT ', '')}
//         },
//         body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Import success:", data);
//         fetchClients(setClients);  // Refresh the client list after import
//     })
//     .catch(err => console.error("Import error:", err));
// };

//   const pagination = paginationFactory({
//     page: 1,
//     alwaysShowAllBtns: true,
//     //showTotal: true,
//     withFirstAndLast: false,
//     sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
//       <div className="dataTables_length" id="datatable-basic_length">
//         <label>
//           {" "}
//           {
//             <select
//               name="datatable-basic_length"
//               aria-controls="datatable-basic"
//               className="form-control form-control-sm"
//               onChange={e => onSizePerPageChange(e.target.value)}
//             >
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//               <option value="100">100</option>
//             </select>
//           }{" "}
          
//         </label>
//       </div>
//     )
//   });

//   const { SearchBar } = Search;
//   useEffect(() => {
//     fetchClients(setClients); // Pass setClients here
// }, []); 


//   return (
//     <>
//       <Header />
//       <Container className="mt--7" fluid>
//         <Row>
//           <div className="col">
//             <Card className="shadow">
//               <CardHeader className="border-0 d-flex align-items-center justify-content-between">
//                 <h3 className="mb-0">Clients</h3>
//                 <input type="file" onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} ref={inputFileRef} />
// <Button color="info" onClick={() => inputFileRef.current && inputFileRef.current.click()}>
//   Importer Clients
// </Button>
//                 {/* <Button color="primary" onClick={toggleModal}>Ajouter Client</Button> */}
//                 <Button color="primary" onClick={handleAddClient}>Ajouter Client</Button>
//               </CardHeader>
              
//               <CardBody>
                
//                 <ToolkitProvider
//                   keyField="id"
//                   data={clients}
//                   columns={columns}
//                   search
//                 >
//                   {props => (
//                     <div>
                      
//                       <SearchBar {...props.searchProps} style={{ border: '1px solid black' }} />
//                       <div style={{ overflowX: 'auto' }}>
//                         <BootstrapTable
//                           {...props.baseProps}
//                           ref={componentRef}
//                           bootstrap4
//                           pagination={pagination}
//                           bordered={false}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </ToolkitProvider>
//               </CardBody>
//             </Card>
//           </div>
//         </Row>
//       </Container>
//       {/* <AddClientModal isOpen={modal} toggle={toggleModal} onSave={addNewClient} /> */}
//     </>
//   );
// };



// export default Tables;