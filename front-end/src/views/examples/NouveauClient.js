import React, { useState, useRef, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label, Container, Row, Col, UncontrolledAlert,
  Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import classnames from 'classnames';

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

const NouveauClient = () => {
  const history = useHistory();
  const location = useLocation();
  const [client, setClient] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    mutuelle: "",
    numeroSecu: "",
    email: "",
    telephoneFixe: "",
    telephonePortable: "",
    adresse: "",
    codePostal: "",
    ville: "",
    note: "",
    audiogramme: "",
    statut: "" 
  });
  const [activeTab, setActiveTab] = useState('1');
  const [audiogrammeSuccessMessage, setAudiogrammeSuccessMessage] = useState("");

  useEffect(() => {
    // Si un client est passé dans l'état, utilisez ses valeurs pour initialiser le formulaire
    if (location.state && location.state.client) {
      const formattedClient = {
        ...location.state.client,
        dateNaissance: formatDate(location.state.client.dateNaissance)
      };
      setClient(formattedClient);
    }
  }, [location.state]);

  const toggleTab = tab => {
    if(activeTab !== tab) setActiveTab(tab);
  };

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const isMounted = useRef(false);

useEffect(() => {
  isMounted.current = true;
  return () => {
    isMounted.current = false;  // Nettoyage en démontant le composant
  };
}, []);

  const validateForm = () => {
    let tempErrors = {};
    let formIsValid = true;

    if (!client.nom.trim()) {
      formIsValid = false;
      tempErrors["nom"] = "Le nom est requis.";
    }

    if (!client.email.trim()) {
      formIsValid = false;
      tempErrors["email"] = "L'email est requis.";
    }

    setErrors(tempErrors);
    return formIsValid;
  };

//   const saveClient = async (clientData) => {
//     const url = clientData._id ? `http://localhost:5100/api/clients/${clientData._id}` : 'http://localhost:5100/api/clients/add';
//     const method = clientData._id ? 'PUT' : 'POST';

//     try {
//         const response = await fetch(url, {
//             method: method,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': localStorage.getItem('token')
//             },
//             body: JSON.stringify(clientData)
//         });

//         if (!response.ok) {
//           const data = await response.json();
//           toast.error(`Erreur: ${data.message}`);
//       } else {
//           const data = await response.json();
//           toast.success("Le client a été ajouté/modifié avec succès !");
//           setTimeout(() => {
//               history.push('/admin/clients');
//           }, 3000);
//       }
//   } catch (error) {
//       console.error('Erreur lors de l\'opération sur le client:', error);
//       toast.error(`Erreur lors de l'opération sur le client: ${error.message}`);
//   }
// };

const saveClient = async (clientData) => {
  const url = clientData._id ? `http://localhost:5100/api/clients/${clientData._id}` : 'http://localhost:5100/api/clients/add';
  const method = clientData._id ? 'PUT' : 'POST';

  console.log('Envoi des données du client:', clientData);  // Log des données envoyées

  try {
      const response = await fetch(url, {
          method: method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify(clientData)
      });

      console.log('Statut de la réponse:', response.status);  // Log du statut de réponse HTTP

      if (!response.ok) {
        const data = await response.json();
        console.log('Erreur lors de l\'enregistrement:', data);  // Log de l'erreur
        toast.error(`Erreur: ${data.message}`);
        return;
      }

      const data = await response.json();
      console.log('Réponse du serveur:', data);  // Log de la réponse
      toast.success("Le client a été ajouté/modifié avec succès !");
      setTimeout(() => {
          history.push('/admin/clients');
      }, 3000);
  } catch (error) {
      console.error('Erreur lors de l\'opération sur le client:', error);
      toast.error(`Erreur lors de l'opération sur le client: ${error.message}`);
  }
};







  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
    // Clear errors
    if (!!errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      saveClient(client);
    }
  };
  const handleSubmitAudiogramme = async (e) => {
    e.preventDefault();
    const audiogrammeData = {
      ...client,
      audiogramme: client.audiogramme
    };
  
    const url = client._id ? `http://localhost:5100/api/clients/${client._id}` : 'http://localhost:5100/api/clients/add';
    const method = client._id ? 'PUT' : 'POST';
  
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(audiogrammeData)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP status ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Opération réussie:', data);
      setAudiogrammeSuccessMessage("Le bilan auditif a été enregistré avec succès.");
      setTimeout(() => {
        setAudiogrammeSuccessMessage("");
        history.push('/admin/clients'); // Redirection après l'affichage du message de succès
      }, 3000); // Affichage du message pendant 3 secondes
  
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du bilan auditif:", error);
      setErrors({ form: "Erreur lors de l'opération sur le bilan auditif." });
    }
  };
  

  return (
    // <div style={{ paddingTop: '50px', backgroundColor: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%) !important' }}>
       <div style={{ paddingTop: '50px', background: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%)' }}>
    <Container className="mt-5">
      <Card>
      <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <CardHeader className="bg-white text-white">
            <h4 className="mb-0">{client._id ? "Modifier Client" : "Ajouter Nouveau Client"}</h4>
          </CardHeader>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '1' })}
                  onClick={() => { toggleTab('1'); }}
                  style={{ cursor: 'pointer' }}
                >
                  Informations Générales
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' })}
                  onClick={() => { toggleTab('2'); }}
                  style={{ cursor: 'pointer' }}
                >
                  Bilan Auditif
                </NavLink>
              </NavItem>
            </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              {/* Votre formulaire existant ici */}
              {successMessage && (
                <UncontrolledAlert color="success" className="fixed-alert" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1050 }} fade={false}>
                  <span className="alert-inner--icon">
                    <i className="ni ni-like-2" />
                  </span>
                  <span className="alert-inner--text">
                    <strong>Succès!</strong> {successMessage}
                  </span>
                </UncontrolledAlert>
              )}
              <Form onSubmit={handleSubmit}>
              <Row form style={{ paddingTop: '50px' }}>
                <Col md={6}>
                  <FormGroup>
                    <Label for="nom">Nom</Label>
                    <Input type="text" name="nom" id="nom" value={client.nom} onChange={handleInputChange} required />
                    {errors.nom && <p style={{ color: 'red' }}>{errors.nom}</p>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="prenom">Prénom</Label>
                    <Input type="text" name="prenom" id="prenom" value={client.prenom} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={4}>
                <FormGroup>
                    <Label for="dateNaissance">Date de Naissance</Label>
                    <Input type="date" name="dateNaissance" id="dateNaissance" value={client.dateNaissance || ''} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="mutuelle">Mutuelle</Label>
                    <Input type="text" name="mutuelle" id="mutuelle" value={client.mutuelle} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="numeroSecu">Numéro de Sécurité Sociale</Label>
                    <Input type="text" name="numeroSecu" id="numeroSecu" value={client.numeroSecu} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
              <Col md={4}>
              <FormGroup>
  <Label for="statut">Statut</Label>
  <Input type="select" name="statut" id="statut" value={client.statut} onChange={handleInputChange}>
    <option value="">Sélectionner un statut</option>
    <option value="Rdv fixé">Rdv fixé</option>
    <option value="Rdv Annulé">Rdv Annulé</option>
    <option value="Appareillé">Appareillé</option>
    <option value="Période d'essai">Période d'essai</option>
    <option value="Facturé">Facturé</option>
  </Input>
</FormGroup>
</Col>
</Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telephoneFixe">Téléphone Fixe</Label>
                    <Input type="text" name="telephoneFixe" id="telephoneFixe" value={client.telephoneFixe} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telephonePortable">Téléphone Portable</Label>
                    <Input type="text" name="telephonePortable" id="telephonePortable" value={client.telephonePortable} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="adresse">Adresse</Label>
                <Input type="text" name="adresse" id="adresse" value={client.adresse} onChange={handleInputChange} />
              </FormGroup>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="codePostal">Code Postal</Label>
                    <Input type="text" name="codePostal" id="codePostal" value={client.codePostal} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="ville">Ville</Label>
                    <Input type="text" name="ville" id="ville" value={client.ville} onChange={handleInputChange} />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input type="email" name="email" id="email" value={client.email} onChange={handleInputChange} required />
                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
              </FormGroup>
              <FormGroup>
                <Label for="note">Note</Label>
                <Input type="textarea" name="note" id="note" value={client.note} onChange={handleInputChange} />
              </FormGroup>
                <Button type="submit" color="primary">Enregistrer</Button>
                <Button type="button" color="secondary" onClick={() => history.push('/admin/clients')}>Annuler</Button>
              </Form>
            </TabPane>
            <TabPane tabId="2">
  {audiogrammeSuccessMessage && (
    <UncontrolledAlert color="success" className="fixed-alert" fade={false}>
      <span className="alert-inner--icon"><i className="ni ni-like-2" /></span>
      <span className="alert-inner--text"><strong>Succès!</strong> {audiogrammeSuccessMessage}</span>
    </UncontrolledAlert>
  )}
  <Form onSubmit={handleSubmitAudiogramme} style={{ paddingTop: '50px' }}>
    <FormGroup>
      <Label for="audiogramme">Audiogramme</Label>
      <Input type="text" name="audiogramme" id="audiogramme" value={client.audiogramme} onChange={handleInputChange} />
    </FormGroup>
    {/* Ajoutez plus de champs selon vos besoins ici */}
    <Button type="submit" color="primary">Enregistrer Bilan</Button>
  </Form>
</TabPane>

          </TabContent>
        </CardBody>
      </Card>
      
    </Container>
    
    </div>
  );
}
  

export default NouveauClient;
