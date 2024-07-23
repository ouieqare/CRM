import React, {useEffect} from 'react';
//import { useParams } from 'react-router-dom';
//import {confirmRegister} from "../../network/ApiAxios";
import {Card, CardBody, Col} from "reactstrap";

const ResetPasswordSuccess = props => {

    useEffect(() => {
        setTimeout(() => {
            props.history.push("/auth/login");
        }, 5000);
    }, [props.history])

    return (
        <>
            <Col lg="6" md="8">
                <Card className="bg-secondary shadow border-0">
                    <CardBody className="px-lg-5 py-lg-5">
                        <div className="text-center mb-4">
                            <h1>Réinitialisation du mot de passe confirmée ! Vous serez redirigé vers la page de connexion....</h1>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </>
    )
};

export default ResetPasswordSuccess;
