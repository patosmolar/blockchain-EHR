import React from "react";
import { Navigate } from "react-router-dom";
import SmartContractsContext from "../shared/SmartContractsContext";


function PrivateRoute({ children }) {
    const context = React.useContext(SmartContractsContext);
    const auth = context.account !== "" &&  context.privateKey !== undefined;
    if (!auth) {
        // not logged in so redirect to login page with the return url
        return <Navigate to="/login" />
    }
    return children;
};

export default PrivateRoute;