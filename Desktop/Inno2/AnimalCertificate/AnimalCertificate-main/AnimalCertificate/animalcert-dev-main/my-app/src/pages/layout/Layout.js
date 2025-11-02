import React, { useEffect, useContext, Component } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import Background from "./Background";
import Tooltip from "../bits/Tooltip";

class Layout extends Component {
    render() {
        return(
            <React.Fragment>
                <Tooltip />
                <Navbar />
                <div className="px-10">
                    <Outlet />
                </div>
                <Footer />
                <Background />
            </React.Fragment>
        );
    }
};

export default Layout;