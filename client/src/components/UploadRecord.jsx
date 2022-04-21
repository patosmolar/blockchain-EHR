import React, { useState,useEffect  } from "react";
import FileUpload from "./file-upload/file-upload.component";
import Web3 from "web3";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {recordsABI, aManagerABI, accManagerAddress, medRecordsAddress} from "../contractsConfig.js";
import { create } from "ipfs-http-client";
import { JSEncrypt } from "jsencrypt";



function UploadRecord() {
    return(
        <h2>UploadRecord</h2>

    );
}

export default UploadRecord;