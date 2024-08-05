import React, { useState, useRef, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    statut: "",
    origine: "" 
  });
  const [isEditable, setIsEditable] = useState(!location.state || !location.state.client);
  const [activeTab, setActiveTab] = useState('1');
  const [audiogrammeSuccessMessage, setAudiogrammeSuccessMessage] = useState("");
  const [facture, setFacture] = useState({ articles: [] }); // Ensure articles is always an array


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


const saveClient = async (clientData) => {
  const url = clientData._id ? `https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/${clientData._id}` : 'https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/add';
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
      setIsEditable(false);
      // setTimeout(() => {
      //     history.push('/admin/clients');
      // }, 3000);
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
  
    const url = client._id ? `https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/${client._id}` : 'https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/add';
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
  const handleBack = () => {
    history.goBack();
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setClient({
  //     ...client,
  //     appareillage: {
  //       ...client.appareillage,
  //       [name]: value
  //     }
  //   });
  // };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setClient({
      ...client,
      appareillage: {
        ...client.appareillage,
        [name]: checked
      }
    });
  };

  const generatePDF = () => {
    const devis = client; // Utilisation de l'état client existant pour générer le devis
    const doc = new jsPDF();
  
    // En-tête du devis
    doc.setFontSize(18);
    doc.text('Devis pour Appareillage Auditif', 105, 25, null, null, 'center');
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, 200, 30, null, null, 'right'); // Date actuelle formatée
  
    // Informations du client
    doc.setFontSize(13);
    doc.text(`Nom du Client: ${devis.nom} ${devis.prenom}`, 20, 50);
    doc.text(`Email: ${devis.email}`, 20, 65);
  
    // Informations supplémentaires
    doc.text(`Adresse: ${devis.adresse}, ${devis.codePostal} ${devis.ville}`, 20, 80);
    doc.text(`Téléphone: ${devis.telephonePortable}`, 20, 95);
  
    // Ajout d'une table pour les détails de l'appareillage (exemple statique)
    autoTable(doc, {
      theme: 'grid',
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: [
        ['Appareil Auditif', '1', '1200.00 €', '1200.00 €']
        // Vous pouvez ajouter plus de lignes ici selon les données de l'état `client`
      ],
      startY: 110
    });
  
    // Affichage du total
    doc.text('Total Général: 1200.00 €', 20, doc.lastAutoTable.finalY + 20);
  
    // Sauvegarde du PDF
    doc.save('Devis.pdf');
  };

  

  return (
      //  <div style={{ paddingTop: '50px', background: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%)' }}>
      <div style={{ paddingTop: '50px', background: 'linear-gradient(87deg, #003D33 0, #007D70 100%)' }}>
    <Container className="mt-5">
      <Card>
      <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />          
          {/* <CardHeader className="bg-white text-white">
          <Button color="link" onClick={handleBack} style={{ marginRight: '20px', color: 'black' }}>
              <FaArrowLeft />
            </Button>
  <h4 className="mb-0">{client._id ? "Modifier Client" : "Ajouter Nouveau Client"}</h4>
  <div style={{ float: 'right' }}>
    {client._id && !isEditable && (
      <>
        <Button color="info" onClick={() => setIsEditable(true)} disabled={isEditable}>Modifier</Button>
        <Button color="primary" onClick={() => {
          if (validateForm()) {
            saveClient(client);
            setIsEditable(false); // Désactiver les champs après la sauvegarde
          }
        }} disabled={!isEditable} style={{ marginLeft: '10px' }}>Enregistrer Modifications</Button>
      </>
    )}
  </div>
</CardHeader> */}
<CardHeader className="bg-white text-white">
  <Button color="link" onClick={handleBack} style={{ marginRight: '20px', color: 'black' }}>
    <FaArrowLeft />
  </Button>
  <h4 className="mb-0">{client._id ? "Modifier Client" : "Ajouter Nouveau Client"}</h4>
  <div style={{ float: 'right' }}>
    {client._id && (
      <>
        <Button color="info" onClick={() => setIsEditable(true)} disabled={isEditable}>Modifier</Button>
        <Button color="primary" onClick={() => {
          if (validateForm()) {
            saveClient(client);
          }
        }} disabled={!isEditable} style={{ marginLeft: '10px' }}>Enregistrer Modifications</Button>
      </>
    )}
  </div>
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
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '3' })}
                  onClick={() => { toggleTab('3'); }}
                  style={{ cursor: 'pointer' }}
                >
                  Devis
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '4' })}
                  onClick={() => { toggleTab('4'); }}
                  style={{ cursor: 'pointer' }}
                >
                  Appareillage
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
                    <Input type="text" name="nom" id="nom" value={client.nom} onChange={handleInputChange} required disabled={!isEditable}/>
                    {errors.nom && <p style={{ color: 'red' }}>{errors.nom}</p>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="prenom">Prénom</Label>
                    <Input type="text" name="prenom" id="prenom" value={client.prenom} onChange={handleInputChange} disabled={!isEditable}/>
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
                <Col md={4}>
                <FormGroup>
                    <Label for="dateNaissance">Date de Naissance</Label>
                    <Input type="date" name="dateNaissance" id="dateNaissance" value={client.dateNaissance || ''} onChange={handleInputChange} disabled={!isEditable} />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="mutuelle">Mutuelle</Label>
                    <Input type="text" name="mutuelle" id="mutuelle" value={client.mutuelle} onChange={handleInputChange} disabled={!isEditable}/>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label for="numeroSecu">Numéro de Sécurité Sociale</Label>
                    <Input type="text" name="numeroSecu" id="numeroSecu" value={client.numeroSecu} onChange={handleInputChange} disabled={!isEditable} />
                  </FormGroup>
                </Col>
              </Row>
              <Row form>
              <Col md={4}>
              <FormGroup>
  <Label for="statut">Statut</Label>
  <Input type="select" name="statut" id="statut" value={client.statut} onChange={handleInputChange} disabled={!isEditable}>
    <option value="">Sélectionner un statut</option>
    <option value="Rdv fixé">Rdv fixé</option>
    <option value="Rdv Annulé">Rdv Annulé</option>
    <option value="Appareillé">Appareillé</option>
    <option value="Période d'essai">Période d'essai</option>
    <option value="Facturé">Facturé</option>
  </Input>
</FormGroup>
</Col>
<Col md={4}>
              <FormGroup>
  <Label for="origine">Origine</Label>
  <Input type="select" name="statut" id="origine" value={client.origine} onChange={handleInputChange} disabled={!isEditable}>
    <option value="">Sélectionner une origine</option>
    <option value="Site">Site</option>
    <option value="Facebook">Facebook</option>
    <option value="Ouieqare">Ouieqare</option>
    <option value="Audibene">Audibene</option>
    <option value="Direct">Direct</option>
    <option value="Google">Google</option>
    <option value="Doctolib">Doctolib</option>
  </Input>
</FormGroup>
</Col>
</Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telephoneFixe">Téléphone Fixe</Label>
                    <Input type="text" name="telephoneFixe" id="telephoneFixe" value={client.telephoneFixe} onChange={handleInputChange} disabled={!isEditable}/>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telephonePortable">Téléphone Portable</Label>
                    <Input type="text" name="telephonePortable" id="telephonePortable" value={client.telephonePortable} onChange={handleInputChange} disabled={!isEditable}/>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="adresse">Adresse</Label>
                <Input type="text" name="adresse" id="adresse" value={client.adresse} onChange={handleInputChange} disabled={!isEditable} />
              </FormGroup>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="codePostal">Code Postal</Label>
                    <Input type="text" name="codePostal" id="codePostal" value={client.codePostal} onChange={handleInputChange} disabled={!isEditable} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="ville">Ville</Label>
                    <Input type="text" name="ville" id="ville" value={client.ville} onChange={handleInputChange} disabled={!isEditable} />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input type="email" name="email" id="email" value={client.email} onChange={handleInputChange} required disabled={!isEditable} />
                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
              </FormGroup>
              <FormGroup>
                <Label for="note">Note</Label>
                <Input type="textarea" name="note" id="note" value={client.note} onChange={handleInputChange} disabled={!isEditable} style={{ minHeight: '100px', maxHeight: '300px' }}/>
              </FormGroup>
                <Button type="submit" color="primary" disabled={!isEditable}>Enregistrer</Button>
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
<TabPane tabId="3">
  <Form onSubmit={handleSubmitAudiogramme} style={{ paddingTop: '50px' }}>
    <FormGroup>
      <Label for="typeAppareil">Type d'Appareil</Label>
      <Input type="text" name="typeAppareil" id="typeAppareil" value={client.typeAppareil} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="modeleAppareil">Modèle de l'Appareil</Label>
      <Input type="text" name="modeleAppareil" id="modeleAppareil" value={client.modeleAppareil} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="numeroSerie">Numéro de Série</Label>
      <Input type="text" name="numeroSerie" id="numeroSerie" value={client.numeroSerie} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="prix">Prix</Label>
      <Input type="number" name="prix" id="prix" value={client.prix} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="garantie">Durée de la Garantie</Label>
      <Input type="text" name="garantie" id="garantie" value={client.garantie} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="servicesInclus">Services Inclus</Label>
      <Input type="text" name="servicesInclus" id="servicesInclus" value={client.servicesInclus} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="acompte">Acompte Requis</Label>
      <Input type="number" name="acompte" id="acompte" value={client.acompte} onChange={handleInputChange} />
    </FormGroup>
    <Button color="secondary" onClick={generatePDF}>Générer Devis PDF</Button>
    <Button type="submit" color="primary">Enregistrer Devis</Button>
  </Form>
</TabPane>

<TabPane tabId="4">
  <Form onSubmit={handleSubmitAudiogramme} style={{ paddingTop: '50px' }}>
    <FormGroup>
      <Label for="marqueAppareil">Marque de l'appareil</Label>
      <Input type="text" name="marqueAppareil" id="marqueAppareil" value={client.marqueAppareil} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup>
      <Label for="montantAppareil">Montant de l'appareil</Label>
      <Input type="text" name="montantAppareil" id="montantAppareil" value={client.montantAppareil} onChange={handleInputChange} />
    </FormGroup>
    <FormGroup check>
      <Label check>
        <Input type="checkbox" name="monoAppareil" id="monoAppareil" checked={client.monoAppareil || false} onChange={handleCheckboxChange} />
        Mono Appareil
      </Label>
    </FormGroup>
    <FormGroup>
      <Label for="observations">Observations</Label>
      <Input type="textarea" name="Appobservations" id="Appobservations" value={client.Appobservations} onChange={handleInputChange} />
    </FormGroup>
    <Button type="submit" color="primary">Enregistrer Appareillage</Button>
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
