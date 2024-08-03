import React, { useState, useRef, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa'; 
import {
  Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label, Container, Row, Col, UncontrolledAlert,
  Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import classnames from 'classnames';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importez autoTable si vous comptez l'utiliser



function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

const NouvelleFacture = () => {
  const history = useHistory();
  const location = useLocation();
  const [facture, setFacture] = useState({
    objet: "",
    dateFacture: "",
    heureCreation: "",
    nomClient: "",
    totalGeneral: "",
    statut: "" 
  });
  const [isEditable, setIsEditable] = useState(!location.state || !location.state.facture);
  const [activeTab, setActiveTab] = useState('1');
  //const [audiogrammeSuccessMessage, setAudiogrammeSuccessMessage] = useState("");

  useEffect(() => {
    // Si un facture est passé dans l'état, utilisez ses valeurs pour initialiser le formulaire
    if (location.state && location.state.facture) {
      const formattedFactures = {
        ...location.state.facture,
        dateFacture: formatDate(location.state.facture.dateFacture)
      };
      setFacture(formattedFactures);
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

    if (!facture.objet.trim()) {
      formIsValid = false;
      tempErrors["objet"] = "L'objet est requis.";
    }

    if (!facture.email.trim()) {
      formIsValid = false;
      tempErrors["email"] = "L'email est requis.";
    }

    setErrors(tempErrors);
    return formIsValid;
  };


const saveFacture = async (factureData) => {
  const url = factureData._id ? `https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/factures/${factureData._id}` : 'https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/factures/add';
  const method = factureData._id ? 'PUT' : 'POST';

  console.log('Envoi des données du facture:', factureData);  // Log des données envoyées

  try {
      const response = await fetch(url, {
          method: method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify(factureData)
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
      toast.success("Le facture a été ajoutée/modifiée avec succès !");
      setIsEditable(false);
      // setTimeout(() => {
      //     history.push('/admin/factures');
      // }, 3000);
  } catch (error) {
      console.error('Erreur lors de l\'opération sur le facture:', error);
      toast.error(`Erreur lors de l'opération sur le facture: ${error.message}`);
  }
};







  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFacture({ ...facture, [name]: value });
    // Clear errors
    if (!!errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      saveFacture(facture);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // En-tête de la facture
    doc.setFontSize(18);
    doc.text('Facture', 105, 25, null, null, 'center');
    doc.setFontSize(11);
    doc.text(`Date: ${facture.dateFacture}`, 200, 30, null, null, 'right');

    // Informations du client
    doc.text(`Nom du Client: ${facture.nomClient}`, 20, 50);
    doc.text(`Email: ${facture.email}`, 20, 65);
    // Plus d'infos
    doc.text(`Objet: ${facture.objet}`, 20, 80);

    // Vous pouvez ajouter ici un AutoTable si vous avez des listes d'éléments
    autoTable(doc, {
        head: [['Description', 'Quantité', 'Prix Unitaire', 'Total']],
        body: [
            // Supposons que vous avez un état qui contient ces informations
            // Chaque ligne représenterait un item de la facture
            ['Appareillage 1', '1', '550.00 €', '550.00 €'],
            // ['Service 2', '2', '30.00 €', '60.00 €'],
            // Ajoutez ici les lignes selon les données de votre application
        ],
        startY: 95
    });

    // Total général
    doc.text(`Total Général: ${facture.totalGeneral} €`, 20, doc.lastAutoTable.finalY + 20);

    // Statut de la facture
    // doc.text(`Statut: ${facture.statut}`, 20, doc.lastAutoTable.finalY + 35);

    // Sauvegarder le PDF
    doc.save('facture.pdf');
};


  return (
      //  <div style={{ paddingTop: '50px', background: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%)' }}>
      <div id="facture-content" style={{ paddingTop: '50px', background: 'linear-gradient(87deg, #003D33 0, #007D70 100%)' }}>
    <Container className="mt-5">
      <Card>
      <ToastContainer position="bottom-left" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />          
<CardHeader className="bg-white text-white">
  <Button color="link" onClick={handleBack} style={{ marginRight: '20px', color: 'black' }}>
    <FaArrowLeft />
  </Button>
  <h4 className="mb-0">{facture._id ? "Modifier Factures" : "Ajouter Nouvelle Facture"}</h4>
  <div style={{ float: 'right' }}>
    {facture._id && (
      <>
      <Button color="info" onClick={generatePDF}>Générer PDF</Button>
        <Button color="info" onClick={() => setIsEditable(true)} disabled={isEditable}>Modifier</Button>
        <Button color="primary" onClick={() => {
          if (validateForm()) {
            saveFacture(facture);
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
              {/* <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' })}
                  onClick={() => { toggleTab('2'); }}
                  style={{ cursor: 'pointer' }}
                >
                  Bilan Auditif
                </NavLink>
              </NavItem> */}
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
                  <Label for="objet">Objet</Label>
                  <Input
                    type="text"
                    name="objet"
                    id="objet"
                    value={facture.objet}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="nomClient">Nom du Client</Label>
                  <Input
                    type="text"
                    name="nomClient"
                    id="nomClient"
                    value={facture.nomClient}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    required
                  />
                </FormGroup>
              </Col>
              </Row>
              <Row form>
              <Col md={4}>
                <FormGroup>
                  <Label for="dateFacture">Date de la Facture</Label>
                  <Input
                    type="date"
                    name="dateFacture"
                    id="dateFacture"
                    value={facture.dateFacture}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="heureCreation">Heure de Création</Label>
                  <Input
                    type="time"
                    name="heureCreation"
                    id="heureCreation"
                    value={facture.heureCreation}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="totalGeneral">Total Général</Label>
                  <Input
                    type="number"
                    name="totalGeneral"
                    id="totalGeneral"
                    value={facture.totalGeneral}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                  />
                </FormGroup>
              </Col>
              </Row>
              <Row>
              <Col md={12}>
                <FormGroup>
                  <Label for="statut">Statut</Label>
                  <Input
                    type="select"
                    name="statut"
                    id="statut"
                    value={facture.statut}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                  >
                    <option value="">Sélectionner un statut</option>
                    <option value="Envoyée">Envoyée</option>
                    <option value="Payée">Payée</option>
                    <option value="Annulée">Annulée</option>
                    <option value="Créée">Créée</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telephoneFixe">Téléphone Fixe</Label>
                    <Input type="text" name="telephoneFixe" id="telephoneFixe" value={facture.telephoneFixe} onChange={handleInputChange} disabled={!isEditable}/>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="telephonePortable">Téléphone Portable</Label>
                    <Input type="text" name="telephonePortable" id="telephonePortable" value={facture.telephonePortable} onChange={handleInputChange} disabled={!isEditable}/>
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="adresse">Adresse</Label>
                <Input type="text" name="adresse" id="adresse" value={facture.adresse} onChange={handleInputChange} disabled={!isEditable} />
              </FormGroup>
              <Row form>
                <Col md={6}>
                  <FormGroup>
                    <Label for="codePostal">Code Postal</Label>
                    <Input type="text" name="codePostal" id="codePostal" value={facture.codePostal} onChange={handleInputChange} disabled={!isEditable} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="ville">Ville</Label>
                    <Input type="text" name="ville" id="ville" value={facture.ville} onChange={handleInputChange} disabled={!isEditable} />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input type="email" name="email" id="email" value={facture.email} onChange={handleInputChange} required disabled={!isEditable} />
                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
              </FormGroup>
              <FormGroup>
                <Label for="note">Note</Label>
                <Input type="textarea" name="note" id="note" value={facture.note} onChange={handleInputChange} disabled={!isEditable} style={{ minHeight: '100px', maxHeight: '300px' }}/>
              </FormGroup>
                {/* <Button type="submit" color="primary" disabled={!isEditable}>Enregistrer</Button>
                <Button type="button" color="secondary" onClick={() => history.push('/admin/factures')}>Annuler</Button> */}
              </Form>
            </TabPane>

          </TabContent>
        </CardBody>
      </Card>
      
    </Container>
    
    </div>
  );
}
  

export default NouvelleFacture;
