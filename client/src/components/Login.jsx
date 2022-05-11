import React, { useState,useRef } from "react";
import { ethers } from "ethers";
import { Button, Card, Container, Form } from "react-bootstrap";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import SmartContractsContext from "../shared/SmartContractsContext";
import { useNavigate } from "react-router-dom";
import {utils} from "ethers";
import {unwrapRsaPrivate,stringToArrayBuffer, arrayBufferToString, importRSAKeyPublic, importRSAKeyPrivate} from "../shared/Utils";

function Login() {
    const context = React.useContext(SmartContractsContext);
    const [isRegistered, setIsRegistered] = useState(true);
    const { ethereum } = window;
    let password = useRef(null);
    const navigate = useNavigate();

    const checkIfRegistered = async (account, accManager) => {
      var isRegistered = await accManager.isAccountRegistered(account);
      if(isRegistered === true){
          var privateKey = await accManager.getPrivateKey();
          var publicKey = await accManager.getPublicKey(account);
          if(privateKey === "{}"){
            setIsRegistered(true);
            navigate("/home");
            return;
          }
          publicKey = await importRSAKeyPublic(JSON.parse(publicKey));
          context.setPublicKey(publicKey);
          try {
            var unwrapped = await unwrapRsaPrivate(stringToArrayBuffer(privateKey), password.current.value);
            context.setPrivateKey(unwrapped);
            setIsRegistered(true);
            navigate("/home");
          } catch (error) {
            alert("Nesprávne heslo k účtu "+account );
            password.current.value = "";
            context.setLogedUserType("NAN");
            navigate("/login");
          }
          
         } else{
          setIsRegistered(false);
         }
    }
    
    const connectButtonHandler = async ()  => {
      // Asking if metamask is already present or not
      if (window.ethereum) {
        const accounts  = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        try {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          let records = await new ethers.Contract(medRecordsAddress, recordsABI, provider);
          let accountsManager = await new ethers.Contract(accManagerAddress, aManagerABI, provider);
          records = records.connect(signer);
          accountsManager = accountsManager.connect(signer);
          try {
            await accountsManager.isAdmin();
            context.setLogedUserType("ADMIN_ROLE");
          }catch(error){
            const isDoc = await accountsManager.isMemberOf(ethers.utils.formatBytes32String("DOCTOR_ROLE"), utils.getAddress(accounts[0]));
            if(isDoc === true){
              console.log("DOCTOR_ROLE");
              context.setLogedUserType("DOCTOR_ROLE");
            }else{
              let isPatient = await accountsManager.isMemberOf(ethers.utils.formatBytes32String("PATIENT_ROLE"), utils.getAddress(accounts[0]));
              if(isPatient === true){
                context.setLogedUserType("PATIENT_ROLE");
              }else{
                alert("Účet nie je zaregistrovaný!")
                navigate("/login");
              }
            }
          }
          context.setRecordsContract(records);
          context.setAccManagerContract(accountsManager);
          context.setAccount(accounts[0]);
          await checkIfRegistered(accounts[0], accountsManager);
        } catch (error) {
          alert(error);
        }
      } else {
        alert("install metamask extension!!");
      }
    };

    if(isRegistered){
      return(
        <Container className="w-50 ">
          <Card className="text-center mt-5 blue lighten-5">
            <Card.Header>
              <strong>Účet neprihlásený, prosím prihláste sa</strong>
            </Card.Header>
            <Card.Body >
              <Form>
                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label>Heslo</Form.Label>
                                    <Form.Control ref={password} type="password" />
                                    <Form.Text className="text-muted">
                                    </Form.Text>
                </Form.Group>
              <Button variant="info" onClick={connectButtonHandler}>
                Prihlásiť sa
              </Button >
              </Form>
            </Card.Body>     
          </Card>
        </Container>
      );
    }else{
      return(
      <Container>
        <Card className="text-center mt-5 blue lighten-5">
          <Card.Header>
            <strong>Účet nie je registrovaný {context.account}</strong>
          </Card.Header>
          <Card.Body>
            <Button variant="info">
            <>Požiadať o registráciu</>
          </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default Login;