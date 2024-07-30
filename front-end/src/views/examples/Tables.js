import React, { useState, useEffect } from "react";


// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  UncontrolledTooltip
} from "reactstrap";
// core components
import { useHistory } from "react-router-dom";
import Header from "components/Headers/Header.js";
import bootstrapImg from '../../assets/img/theme/bootstrap.jpg';
import angularImg from '../../assets/img/theme/angular.jpg';
import team1Img from '../../assets/img/theme/team-1-800x800.jpg'; // Et ainsi de suite pour les autres images


const Tables = () => {
  const [statuses, setStatuses] = useState([]);
  const history = useHistory();
  

  useEffect(() => {
    const loadedStatuses = JSON.parse(localStorage.getItem('uniqueStatuses'));
    setStatuses(loadedStatuses);
  }, []);

  const rows = statuses.map(status => ({
    status: status,
    budget: 'Définir une logique pour budget', // Vous pouvez ajouter une logique similaire pour le budget
    completion: 'Définir une logique pour completion', // Et pour le pourcentage de complétion
    projectImg: 'theme/bootstrap.jpg', // Définir si nécessaire
    usersImg: ['team-1-800x800.jpg', 'team-2-800x800.jpg', 'team-3-800x800.jpg'] // Définir si nécessaire
  }));
  const handleRowClick = (status) => {
    history.push(`/admin/statutClient/${status}`);
  };
  // const rows = [
  //   { 
  //     status: 'Appareillé', 
  //     budget: '$2,500 USD', 
  //     completion: '60%', 
  //     projectImg: 'theme/bootstrap.jpg', // Assurez-vous que ce chemin est correct
  //     usersImg: ['team-1-800x800.jpg', 'team-2-800x800.jpg', 'team-3-800x800.jpg', 'team-4-800x800.jpg'] // Ceux-ci doivent également être définis
  //   },
  //   { 
  //     status: 'Période d\'essai', 
  //     budget: '$1,800 USD', 
  //     completion: '100%', 
  //     projectImg: 'theme/angular.jpg', 
  //     usersImg: ['team-1-800x800.jpg', 'team-2-800x800.jpg', 'team-3-800x800.jpg', 'team-4-800x800.jpg']
  //   },
  //   ,
  //   { 
  //     status: 'Rdv fixé', 
  //     budget: '$1,800 USD', 
  //     completion: '100%', 
  //     projectImg: 'theme/angular.jpg', 
  //     usersImg: ['team-1-800x800.jpg', 'team-2-800x800.jpg', 'team-3-800x800.jpg', 'team-4-800x800.jpg']
  //   }
  //   // Continuez à ajouter des lignes selon le même modèle
  // ];
  
 

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Card tables</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Status</th>
                    <th scope="col">Budget</th>
                    <th scope="col">Completion</th>
                    <th scope="col">Users</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} onClick={() => handleRowClick(row.status)} style={{ cursor: 'pointer' }}>
                      <th scope="row">
                        <Media className="align-items-center">
                          <a className="avatar rounded-circle mr-3">
                            <img alt="..." src={bootstrapImg} />
                          </a>
                          <Media>
                            <span className="mb-0 text-sm">{row.status}</span>
                          </Media>
                        </Media>
                      </th>
                      <td>{row.budget}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="mr-2">{row.completion}</span>
                          <Progress max="100" value={row.completion.replace('%', '')} barClassName="bg-danger" />
                        </div>
                      </td>
                      <td>
                        <div className="avatar-group">
                          {row.usersImg.map((img, idx) => (
                            <a className="avatar avatar-sm" key={idx}>
                              <img alt="..." className="rounded-circle" src={bootstrapImg} />
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="text-right">
                        <UncontrolledDropdown>
                          <DropdownToggle className="btn-icon-only text-light" href="#" role="button" size="sm" color="" onClick={(e) => e.preventDefault()}>
                            <i className="fas fa-ellipsis-v" />
                          </DropdownToggle>
                          <DropdownMenu className="dropdown-menu-arrow" right>
                            <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>Action</DropdownItem>
                            <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>Another action</DropdownItem>
                            <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>Something else here</DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                <nav aria-label="...">
                  <Pagination className="pagination justify-content-end mb-0" listClassName="justify-content-end mb-0">
                    <PaginationItem className="disabled">
                      <PaginationLink href="#" onClick={(e) => e.preventDefault()} tabIndex="-1">
                        <i className="fas fa-angle-left" />
                        <span className="sr-only">Previous</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem className="active">
                      <PaginationLink href="#" onClick={(e) => e.preventDefault()}>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                        2 <span className="sr-only">(current)</span>
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                        3
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fas fa-angle-right" />
                        <span className="sr-only">Next</span>
                      </PaginationLink>
                    </PaginationItem>
                  </Pagination>
                </nav>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};
export default Tables;
