import React, { useState, useEffect } from "react";
import { login } from "../../actions/AuthActions";
import { useHistory } from "react-router-dom";
import { getCookie } from "../../utils/utils";
import { connect } from 'react-redux';

function Login({ login }) {

    // Redirect to Dashboard
    let history = useHistory();
    let cookie_userId = getCookie("user_id");
    let cookie_userName = getCookie("user_name");

    if (cookie_userId && cookie_userName) {
        history.push('/calendar');
    };

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const clickHandler = (e) => {
        e.preventDefault();
        login({ userName, password, history });
    };

    return (
        <div className="si-login-cont">
            <div className="login-wrap">
            <div className="site-logo"></div>
            <div className="login-inner">
                <div className="form">
                <form className="login-form">
                    <input
                        type="text"
                        placeholder="username"
                        id="username"
                        value={ userName }
                        onChange={ (e) => setUserName(e.target.value) }
                        required
                    />

                    <input
                        type="password"
                        placeholder="password"
                        id="password"
                        autoComplete="new-password"
                        value={ password }
                        onChange={ (e) => setPassword(e.target.value) }
                        required
                    />

                    <button 
                        type="submit" 
                        id="login-btn"
                        onClick={ clickHandler }
                    >
                        LOGIN
                    </button>
                    {/* <div className="error-msg">Error Occured</div> */}
                </form>
                </div>
            </div>
            </div>
        </div>
    );
}

export default connect(null, { login })(Login);
