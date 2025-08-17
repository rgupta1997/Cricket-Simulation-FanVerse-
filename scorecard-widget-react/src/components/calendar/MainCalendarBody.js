import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { segregateEventDayWise, getCookie } from "../../utils/utils";
import { getEvents } from "../../actions/CalendarActions";
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';

function MainCalendarBody({ events, startDate, endDate, days, getEvents, searchTerm }) {
    
    let history = useHistory();
    const [newEvents, setNewEvents] = useState(events);
    
    useEffect(() => {
        getEvents({
            end_date: endDate,
            sport_id: 1,
            op_type: "1",
            start_date: startDate,
            user_id: "1",
        });
    
    }, [endDate, startDate]);

    useEffect(() => {
        let filteredEvents = events;
        if(searchTerm) {
            filteredEvents = events.filter((obj) => {
                if (obj.match_full_name.toLowerCase().includes(searchTerm.toLowerCase())) {
                  return true;
                }; 
                return false;
            });
        };
        setNewEvents(filteredEvents);
    }, [searchTerm, events]);

    const clickHandler = (e, matchFile) => {
        e.preventDefault();
        history.push(`/scorecard?match_file_name=${matchFile}`);
    };

    let segregatedEvents = segregateEventDayWise(days, newEvents);
    let max_col_len = 0;
    segregatedEvents.forEach(arr => {
        let col_len = arr.length;
        if(col_len > max_col_len) {
            max_col_len = col_len;
        };
    });

    return (
        <div className="si-calenderBottom">
            <PerfectScrollbar>
                <div className="si-tableBox">
                    {
                        segregatedEvents.map((obj, index, arr) => {

                            return (
                                <div 
                                    className={`si-card__list ${index === 0 ? "active" : ""}`}
                                    key={ uuidv4() }
                                    style={arr.length === 1 ? { width: "100%", flex: "0 0 100%" } : {}}
                                >
                                    {
                                        obj.map((event) => {

                                            let { 
                                                match_full_name, match_name, series_name, 
                                                match_start_time, match_file_name, match_id,
                                                match_status_id
                                            } = event;

                                            return (
                                                <div 
                                                    className={
                                                        `si-card__box ${
                                                            (
                                                                match_status_id === "113" ||
                                                                match_status_id === "114" || 
                                                                match_status_id === "120" ||
                                                                match_status_id === "130" ||
                                                                match_status_id === "131" ||
                                                                match_status_id === "150" ||
                                                                match_status_id === "160" ||
                                                                match_status_id === "170"
                                                            )
                                                            ? 
                                                            "si-unassigned" 
                                                            : 
                                                            "si-assigned"}
                                                        `
                                                    }
                                                    key={ uuidv4() }
                                                    onClick={ (e) => clickHandler(e, match_file_name) }
                                                >
                                                    <div className="si-card__container">
                                                        <div 
                                                            className="si-teams"
                                                            style={days.length==1 ? {width:"100%"} : {}}
                                                        >
                                                            <span>{ days.length==1 ? match_full_name : match_name }</span>
                                                        </div>

                                                        <div className="si-toolTip">
                                                            <div className="si-tooltipBox" style={{width:`${days.length===1?"auto":""}`}}>
                                                                <span>{ match_full_name }</span>
                                                                <span>{ `, ${series_name}` }</span>
                                                            </div>
                                                        </div>

                                                        <div className="si-time">
                                                            <span>{match_start_time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }

                                    {
                                        Array(max_col_len-obj.length).fill(null).map(() => {
                                            return (
                                              <div className="si-card__box" key={ uuidv4() }></div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </PerfectScrollbar>
        </div>
    );
};

const mapStateToProps = (state) => {
    
    return ({
        events: state.CalendarReducer.events,
        startDate: state.CalendarReducer.startDate,
        endDate: state.CalendarReducer.endDate,
        days: state.CalendarReducer.days,
        searchTerm: state.CalendarReducer.searchTerm
    });
};

export default connect(mapStateToProps, { getEvents })(MainCalendarBody);
