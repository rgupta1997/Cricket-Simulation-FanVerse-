import React from 'react';
import { getPrevious, getNext, toggleText } from '../../actions/CalendarActions';
import { logout } from '../../actions/AuthActions';
import { getCookie } from '../../utils/utils';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

function CalendarHeader({ getPrevious, getNext, toggleText, logout, startDate, endDate, btnText }) {

    let history = useHistory();
    let userName = getCookie("user_name");
    let currentDate = new Date(startDate);
    let date = currentDate.getDate();
    let lastDate = new Date(endDate);
    let onejan = new Date(currentDate.getFullYear(), 0, 1);
    let today = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    let dayOfYear = (today - onejan + 86400000) / 86400000;
    let currentWeek = Math.ceil(dayOfYear / 7);

    const handleLogout = () => {
        logout();
        history.push('/');
    };

    const handleMonth = (startDate, endDate) => {
        if(startDate.getMonth() !== endDate.getMonth()) {
            return `${startDate.toLocaleString('default', { month: 'long'})}-${endDate.toLocaleString('default', { month: 'long'})}`;
        }else {
            return startDate.toLocaleString('default', { month: 'long'});
        };
    };

    const handleYear = (startDate, endDate) => {
        if(startDate.getFullYear() !== endDate.getFullYear()) {
            return `${startDate.getFullYear()}-${endDate.getFullYear()}`;
        }else {
            return startDate.getFullYear();
        };
    };

    return (
        <div className="si-Mainheader">
            <div className="si-left">
                <div className="si-Logo">
                    <img src="./images/sportz-logo.png" />
                </div>
            </div>
            <div className="si-hcenter">
                <div className="si-header">
                    <div className="si-header__right">
                        <div className="si-header__rightContainer">
                            <div className="si-left">
                                <div className="si-btn si-todayBtn" onClick={ (e) => toggleText(btnText, new Date()) }>
                                    <span>{ btnText }</span>
                                </div>
                                <div className="si-weekSlider">
                                    <span className="si-icon si-left" onClick={ (e) => getPrevious(btnText, currentDate) }></span>
                                    <span className="si-text">{ btnText==="Today"?`Week ${currentWeek}`:`Day ${date}` }</span>
                                    <span className="si-icon si-right" onClick={ (e) => getNext(btnText, currentDate) }></span>
                                </div>
                                <div className="si-monthYearBox">
                                    <span className="si-month">{ handleMonth(currentDate, lastDate) }</span>
                                    <span className="si-year">{ handleYear(currentDate, lastDate) }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="si-right">
                <div className="si-admin" style={{ alignItems: "center" }}>
                    <span className="si-text">{ userName }</span>
                    <div className="si-adminImage"></div>
                </div>
            
                <div className="si-logout" onClick={ handleLogout }>
                    <a href=""><img src="./images/logout.png" /></a>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        startDate: state.CalendarReducer.startDate,
        endDate: state.CalendarReducer.endDate,
        btnText: state.CalendarReducer.btnText
    };
};

export default connect(mapStateToProps, { getPrevious, getNext, toggleText, logout })(CalendarHeader);
