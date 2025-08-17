import React from "react";
import { getCookie } from "../utils/utils";
import { Route, Redirect } from "react-router-dom";
import { connect } from 'react-redux';

const PrivateRoute = ({
    component: Component,
    userId,
    ...rest
}) => (
    <Route
        {...rest}
        render={(props) =>
            !userId ? (
                <Redirect to="/" />
            ) : (
                <Component {...props} />
            )
        }
    />
);

const mapStateToProps = () => {
    return {
        userId: getCookie("user_id")
    };
};

export default connect(mapStateToProps)(PrivateRoute);