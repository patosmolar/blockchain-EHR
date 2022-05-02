import SmartContractsContext from "./SmartContractsContext";
import { create } from "ipfs-http-client";
import React, { createContext, useState } from "react";



function SmartContractsProvider({ children }) {
    const [recordsContract, setRecordsContract] = useState();
    const [accManagerContract, setAccManagerContract] = useState();
    const [account, setAccount] = useState("");
    const [privateKey, setPrivateKey] = useState({});
    const [publicKey, setPublicKey] = useState({});
    const ipfsClient = create('https://ipfs.infura.io:5001/api/v0');
    const [recordFile, setRecordFile] = useState({});
    const [logedUserType, setLogedUserType]= useState("NAN");


    return (
        <SmartContractsContext.Provider value={ {recordsContract:recordsContract,
                                                setRecordsContract:setRecordsContract,
                                                accManagerContract:accManagerContract,
                                                setAccManagerContract:setAccManagerContract,
                                                privateKey:privateKey,
                                                setPrivateKey:setPrivateKey,
                                                publicKey:publicKey,
                                                setPublicKey:setPublicKey,
                                                recordFile:recordFile,
                                                setRecordFile:setRecordFile,
                                                logedUserType:logedUserType,
                                                setLogedUserType:setLogedUserType,
                                                account:account,
                                                setAccount:setAccount,
                                                ipfsClient:ipfsClient }}>
            {children}
        </SmartContractsContext.Provider>
    );
}

export default SmartContractsProvider;