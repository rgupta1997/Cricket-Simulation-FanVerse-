import React from 'react';
import { logout } from '../../actions/AuthActions';
import { toggleActiveTab, toggleCommentaryType } from '../../actions/ScorecardActions';
import { getCookie } from '../../utils/utils';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

function ScorecardHeader({ logout, toggleActiveTab, toggleCommentaryType }) {

    let history = useHistory();
    let userName = getCookie("user_name");

    const handleLogout = () => {
        logout();
        history.push('/');
    };

    const handleBackBtn = (e) => {
        e.preventDefault();
        toggleActiveTab("scorecard");
        toggleCommentaryType("full");
        history.push('/calendar');
    };

    return (
        <div className="si-Mainheader si-Mainheader1">
            <div className="si-left">
                <div className="si-Logo"><img src="./images/sportz-logo.png" /></div>
            </div>
            <div className="si-right">
                <div className="si-admin" style={{ alignItems: "center" }}>
                    <span className="si-text">
                        { userName }
                    </span>
                    <div className="si-adminImage"></div>
                </div>

                <button 
                    className="custom-btn btn-10" 
                    onClick={ handleBackBtn }
                >
                    <span style={{ top: "9px" }}>
                        Back
                    </span>
                </button>

                <div className="si-logout" onClick={ handleLogout }>
                    <a href=""><img src="./images/logout.png" /></a>
                </div>
            </div>
       </div>
    )
}

export default connect(null, { logout, toggleActiveTab, toggleCommentaryType })(ScorecardHeader);
