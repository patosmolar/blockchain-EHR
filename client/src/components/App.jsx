import ReactDOM from "react-dom";
import {
    Routes,
    Route,
    BrowserRouter
} from "react-router-dom";

import SmartContractsProvider from "../shared/SmartContractsProvider"
import Home from "./Home";
import AddRecordData from "./AddRecordData";
import GetRecord from "./GetRecord";
import Login from "./Login";
import Navigation from "./Navigation";
import Register from "./Register";
import CreateNewRecord from "./CreateNewRecord";
import ViewRecords from "./ViewRecords";


function App() {
  return (
    <SmartContractsProvider>
      <BrowserRouter>
        <Navigation/>
        <Routes>
              <Route path ="/" element={<Home/>}/>
              <Route path ="/home" element={<Home/>}/>
              <Route path ="/login" element={<Login/>}/>
              <Route path ="/addRecordData" element={<AddRecordData/>}/>
              <Route path ="/getRecord" element={<GetRecord/>}/>
              <Route path ="/register" element={<Register/>}/>
              <Route path ="/createNewRecord" element={<CreateNewRecord/>}/>
              <Route path ="/viewRecords" element={<ViewRecords/>}/>
        </Routes>
      </BrowserRouter>
    </SmartContractsProvider>
  );
}

export default App;