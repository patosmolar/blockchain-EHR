import React, { useState,useEffect  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button} from "react-bootstrap";
import rsa from 'js-crypto-rsa';
import SmartContractsContext from "../shared/SmartContractsContext";


const data = [{
    address: "0x6d0a4170a36689917C999D57894c42da5b3c4E55",
    name: "patrik",
    surename: "smolar"
},{
    address: "0x2C9353499784c1D3BBA16648903BAa030d3452f1",
    name: "jakub",
    surename: "trstensky"
},{
    address: "0x0436Ee0D71e5c7AD270DD93288e65F7E6320B818",
    name: "martin",
    surename: "trojan"
},{
    address: "0xE72e24b36bBF4E70889226d2fF9A5034cdf6F658",
    name: "maros",
    surename: "kovalak"
}] ;

function UploadRecord() {
    const [file, setFile] = useState({});
    const [addressToUpload, setAddressToUpload] = useState();
    const [isLoading, setLoading] = useState(false);
    const context = React.useContext(SmartContractsContext);

    useEffect(() => {
        if (isLoading) {
            uploadFile().then(() => {
            setLoading(false);
          });
        }
      }, [isLoading]);
    
    const handleClick = () => setLoading(true);

    const uploadFile = ()  => {
        return new Promise( async (resolve)  => 
        {
            readFileAsArrayBuffer(file).then( async(fileAsArray) => {
                rsa.encrypt(fileAsArray, 
                            context.publicKey,
                            'SHA-256').then( async(encrypted) =>{
                                console.log(encrypted);
                                var result = "";
                                encrypted.forEach(element => {
                                    result += element.toString() + ",";
                                });
                                result = result.slice(0, -1);
                                var fileToUpload = new File([result], "foo.txt", {
                                    type: "text/plain",
                                  });
                                console.log(fileToUpload);
                                const fileHash = await context.ipfsClient.add(fileToUpload);
                                context.SfileHash(fileHash);
                                await context.recordsContract.methods.addMedicalRecord(addressToUpload,
                                                                       fileHash,
                                                                       fileHash,
                                                                       context.account.address);
                                resolve();
                                });
                        });
                });
    };

    
    const readFileAsArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (err) => {
                reject(err);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const readBlobAsText = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (err) => {
                reject(err);
            };
            reader.readAsArrayBuffer()(blob);
        });
    };

    
  

    return(
        <Form className="justify-content-center w-50 m-auto">
            <Form.Group className="" >
                <Form.Label>Pacient</Form.Label>
                <Form.Select value={addressToUpload} onChange={(e) => setAddressToUpload(e.target.value)}>
                    {data.map((o) => {
                        const { address,name, surename } = o;
                        return <option key={address} value={address}>{name + " " + surename}</option>;
                    })}
                </Form.Select>
            </Form.Group>     

            <Form.Group controlId="formFileLg" className="mb-3 pt-3">
                <Form.Label>Zdravotný záznam</Form.Label>
                <Form.Control 
                    onChange={(e) => setFile(e.target.files[0])}
                    type="file"
                    size="lg"
                    accept=".txt" />
            </Form.Group>

            <Form.Group className="" >
                <Button
                variant="primary"
                disabled={isLoading}
                onClick={!isLoading ? handleClick : null}
                >
                {isLoading ? 'Nahrávam...' : 'Potvrdiť'}
                </Button>
            </Form.Group>
        </Form>
    );
}

export default UploadRecord;