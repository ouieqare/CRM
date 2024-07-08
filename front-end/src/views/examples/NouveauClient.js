import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
  Container,
  Row,
  Col
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
    statut: "",
    dateRDV: "",
    heureRDV: "",
    bilanAuditif: "",
    note: ""
  });

  const saveClient = async (clientData) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      const data = await response.json();
      if (data.success) {
        console.log('Client ajouté avec succès');
        history.push('/admin/clients'); // Redirige l'utilisateur après l'enregistrement réussi
      } else {
        console.error('Erreur lors de l\'ajout du client');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion au serveur', error);
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClient({ ...client, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(client);
    saveClient(client);
    history.push('/admin/clients'); // Rediriger l'utilisateur après l'envoi
  };
  

  return (
    <Container className="mt-5">
      <Card>
        <CardHeader>Ajouter un Nouveau Client</CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row form>
              <Col md={6}>
                <FormGroup>
                  <Label for="nom">Nom</Label>
                  <Input type="text" name="nom" id="nom" value={client.nom} onChange={handleInputChange} />
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
                  <Label for="mutuelle">Nom de la Mutuelle</Label>
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
              <Input type="email" name="email" id="email" value={client.email} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="telephoneFixe">Téléphone Fixe</Label>
              <Input type="text" name="telephoneFixe" id="telephoneFixe" value={client.telephoneFixe} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="telephonePortable">Téléphone Portable</Label>
              <Input type="text" name="telephonePortable" id="telephonePortable" value={client.telephonePortable} onChange={handleInputChange} />
            </FormGroup>
            <FormGroup>
              <Label for="note">Note</Label>
              <Input type="textarea" name="note" id="note" value={client.note} onChange={handleInputChange} />
            </FormGroup>
            {/* Ajoutez des FormGroup pour chaque champ que vous souhaitez inclure */}
            <Button type="submit" color="primary">Enregistrer</Button>
            <Button type="button" color="secondary" onClick={() => history.push('/admin/clients')}>Annuler</Button>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default NouveauClient;
