import ReactDOM from "react-dom";
import {
    Routes,
    Route,
    BrowserRouter
} from "react-router-dom";

import SmartContractsProvider from "../shared/SmartContractsProvider"
import Home from "./Home";
import Login from "./Login";
import Navigation from "./Navigation";
import Register from "./Register";
import ViewRecords from "./ViewRecords";
import PrivateRoute from "./PrivateRoute";


function App() {
  return (
    <SmartContractsProvider>
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route path ="/login" element={<Login/>}/>
          <Route 
            path ="/" 
            element={
              <PrivateRoute>
                <Home/>
              </PrivateRoute>}/>
          <Route 
            path ="/home" 
            element={
              <PrivateRoute>
                <Home/>
              </PrivateRoute>}/>
          <Route 
            path ="/register" 
            element={
              <PrivateRoute>
                <Register/>
              </PrivateRoute>}/>
          <Route 
            path ="/viewRecords/:isNew" 
            element={
              <PrivateRoute>
                <ViewRecords/>
              </PrivateRoute>}/>
        </Routes>
      </BrowserRouter>
    </SmartContractsProvider>
  );
}

export default App;