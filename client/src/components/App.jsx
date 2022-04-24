import ReactDOM from "react-dom";
import {
    Routes,
    Route,
    BrowserRouter
} from "react-router-dom";

import SmartContractsProvider from "../shared/SmartContractsProvider"
import Home from "./Home";
import UploadRecord from "./UploadRecord";
import GetRecord from "./GetRecord";
import Login from "./Login";
import Navigation from "./Navigation";


function App() {
  return (
    <SmartContractsProvider>
      <BrowserRouter>
        <Navigation/>
        <Routes>
              <Route path ="/" element={<Home/>}/>
              <Route path ="/home" element={<Home/>}/>
              <Route path ="/login" element={<Login/>}/>
              <Route path ="/uploadRecord" element={<UploadRecord/>}/>
              <Route path ="/getRecord" element={<GetRecord/>}/>
        </Routes>
      </BrowserRouter>
    </SmartContractsProvider>
  );
}

export default App;