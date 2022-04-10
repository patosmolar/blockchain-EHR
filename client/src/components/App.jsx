import ReactDOM from "react-dom";
import {
    Routes,
    Route,
    BrowserRouter
} from "react-router-dom";

import Home from "./Home";
import UploadRecord from "./UploadRecord";
import GetRecord from "./GetRecord";
import Login from "./Loggin";
import Navigation from "./Navigation";


function App() {
  return (
      <BrowserRouter>
        <Navigation/>
        <Routes>
              <Route path ="/" element={<Home/>}/>
              <Route path ="/home" element={<Home/>}/>
              <Route path ="/uploadRecord" element={<UploadRecord/>}/>
              <Route path ="/getRecord" element={<GetRecord/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;