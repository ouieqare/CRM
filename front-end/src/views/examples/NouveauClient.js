import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button, Card, CardBody, CardHeader, Form, FormGroup, Input, Label, Container, Row, Col
} from "reactstrap";

const NouveauClient = () => {
  const history = useHistory();
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
    note: ""
  });
  const [errors, setErrors] = useState({});

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
    try {
      const response = await fetch('http://localhost:5100/api/clients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
         'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify(clientData)
      });
      
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP status ${response.status}: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Client ajouté avec succès', data);
      history.push('/admin/clients');
    } catch (error) {
      console.error('Erreur lors de la connexion au serveur', error);
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

  return (
    <div style={{ paddingTop: '50px' }}>
      <Container className="mt-5">
        <Card>
          <CardHeader>Ajouter un Nouveau Client</CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <Row form>
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
                    <Input type="date" name="dateNaissance" id="dateNaissance" value={client.dateNaissance} onChange={handleInputChange} />
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
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default NouveauClient;
