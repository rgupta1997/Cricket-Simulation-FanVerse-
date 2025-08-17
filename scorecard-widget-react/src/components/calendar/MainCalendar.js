import React, { useEffect } from 'react';
import MainCalendarHeader from './MainCalendarHeader';
import MainCalendarBody from './MainCalendarBody';
import { getNextDays } from '../../actions/CalendarActions';
import { connect } from 'react-redux';

function MainCalendar({ getNextDays, startDate, btnText }) {

    useEffect(() => {
        if(btnText === "Today") {
            getNextDays(startDate);
        } else {
            getNextDays(startDate, 1);
        };
    }, []);

    return (
        <section>
            <div className="main__containerFluid">
                <div className="si-calender">
                    <MainCalendarHeader />
                    <MainCalendarBody />
                </div>
            </div>
        </section>
    );
};

const mapStateToProps = (state) => {
    return {
        startDate: state.CalendarReducer.startDate,
        btnText: state.CalendarReducer.btnText,
    }
}

export default connect(mapStateToProps, { getNextDays })(MainCalendar);
