import React, {useState} from "react";

// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    Row,
    Col
} from "reactstrap";
import {login} from "../../network/ApiAxios";

const Login = props => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const tryLogin = async () => {
        const response = await login(email, password);
        const {data} = response;
        if (data.success) {
            setError("");
            localStorage.setItem("token", data.token);
            console.log('Stored token:', localStorage.getItem('token'));
            localStorage.setItem("user", JSON.stringify(data.user));
            props.history.push("/");
        } else {
            setPassword("");
            setError(data.msg);
        }
    }

    const handleClick = () => {
        alert('Cette fonctionnalité est en cours de développement.');
    };

    return (
        <>
            <Col lg="5" md="7">
                <Card className="bg-secondary shadow border-0">
                    <CardHeader className="bg-transparent pb-5">
                        <div className="text-muted text-center mt-2 mb-3">
                            <small>Se connecter avec</small>
                        </div>
                        <div className="btn-wrapper text-center">
                             <Button
                                className="btn-neutral btn-icon"
                                color="default"
                                href="#pablo"
                                onClick={handleClick}
                            >
                  <span className="btn-inner--icon">
                    <img
                        alt="..."
                        src={require("assets/img/icons/common/google.svg").default}
                    />
                  </span>
                                <span className="btn-inner--text">Google</span>
                            </Button>

                        </div>
                    </CardHeader>
                    <CardBody className="px-lg-5 py-lg-5">
                        <div className="text-center text-muted mb-4">
                            <small>Ou inscrivez-vous avec vos identifiants</small>
                        </div>
                        <Form role="form">
                            <FormGroup className="mb-3">
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-email-83"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Email" type="email" autoComplete="email" value={email}
                                           onChange={e => setEmail(e.target.value)}/>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <InputGroup className="input-group-alternative">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="ni ni-lock-circle-open"/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input placeholder="Mot de Passe" type="password" autoComplete="password" value={password}
                                           onChange={e => setPassword(e.target.value)}/>
                                </InputGroup>
                            </FormGroup>
                            {/*<div className="custom-control custom-control-alternative custom-checkbox">*/}
                            {/*    <input*/}
                            {/*        className="custom-control-input"*/}
                            {/*        id=" customCheckLogin"*/}
                            {/*        type="checkbox"*/}
                            {/*    />*/}
                            {/*    <label*/}
                            {/*        className="custom-control-label"*/}
                            {/*        htmlFor=" customCheckLogin"*/}
                            {/*    >*/}
                            {/*        <span className="text-muted">Remember me</span>*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                            {error ?
                                <div className="text-muted font-italic">
                                    <small>
                                        error:{" "}
                                        <span className="text-red font-weight-700">{error}</span>
                                    </small>
                                </div> : null }
                            <div className="text-center">
                                <Button className="my-4" color="primary" type="button" onClick={tryLogin}>
                                    Sign in
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
                <Row className="mt-3">
                    <Col xs="6">
                        {/* <a
                            className="text-light"
                            onClick={() => props.history.push('/auth/reset-password')}
                        >
                            <small>Mot de passe oublié?</small>
                        </a> */}
                        <Button className="text-light p-0" color="link" onClick={() => props.history.push('/auth/reset-password')}>
                            <small>Forgot password?</small>
                        </Button>
                    </Col>
                    <Col className="text-right" xs="6">
                        {/* <a
                            className="text-light"
                            onClick={() => props.history.push('/auth/register')}
                        >
                            <small>Créer un nouveau compte</small>
                        </a> */}
                         <Button className="text-light p-0" color="link" onClick={() => props.history.push('/auth/register')}>
                            <small>Create new account</small>
                        </Button>
                    </Col>
                </Row>
            </Col>
        </>
    );
}

export default Login;
