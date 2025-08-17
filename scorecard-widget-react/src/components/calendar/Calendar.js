import React from 'react';
import CalendarHeader from './CalendarHeader';
import MainCalendar from './MainCalendar';

function Calendar() {
    return (
        <div className="si-main">
            <div className="si-wrapper">
                <div className="si-page-bg">
                    <CalendarHeader />
                    <MainCalendar />
                </div>
            </div>
        </div>
    );
};

export default Calendar;
