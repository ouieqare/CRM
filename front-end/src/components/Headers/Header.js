import React from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import axios from 'axios';

class Header extends React.Component {
  state = {
    totalClients: 0,
    appareilles: 0,
    factures: 0,
  };

  componentDidMount() {
    this.fetchClientCounts();
  }

  fetchClientCounts = async () => {
    try {
      const token = localStorage.getItem('token').trim().replace('JWT ', '');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Assuming these endpoints exist or you manage to compute this data accordingly
      const [totalResponse, appareillesResponse, facturesResponse] = await Promise.all([
        axios.get('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/count', config),
        axios.get('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/count/appareilles', config),
        axios.get('https://ouieqare-crm-336f65ca3acc.herokuapp.com/api/clients/count/factures', config)
      ]);

      this.setState({
        totalClients: totalResponse.data.count,
        appareilles: appareillesResponse.data.count,
        factures: facturesResponse.data.count
      });
    } catch (error) {
      console.error('Error fetching client counts:', error);
    }
  }

  render() {
    const { totalClients, appareilles, factures } = this.state;
    return (
      <>
        <div className="header pb-8 pt-5 pt-md-8" style={{ background: 'linear-gradient(87deg, #003D33 0, #007D70 100%)'}}>
          <Container fluid>
            <div className="header-body">
              {/* Card stats */}
              <Row>
                <Col lg="6" xl="2">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Nombre Clients
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">
                            {totalClients}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                            <i className="fas fa-chart-bar" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                {/* Other columns */}
                <Col lg="6" xl="2">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Appareillés
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{appareilles}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                            <i className="fas fa-users" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" xl="2">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                            Facturés
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">{factures}</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                            <i className="fas fa-percent" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                {/* More columns as needed */}
              </Row>
            </div>
          </Container>
        </div>
      </>
    );
  }
}

export default Header;
