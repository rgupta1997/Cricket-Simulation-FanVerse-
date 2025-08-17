import React from 'react';
import { connect } from "react-redux";
import { toggleText, updateSearch } from '../../actions/CalendarActions';
import { DayAsString } from "../../utils/utils";

function MainCalendarHeader({ days, btnText, toggleText, searchTerm, updateSearch }) {

    return (
        <div className="si-calenderTop">    

            <div className="si-calheader">
                <div className="si-top">
                    <div className="si-left"></div>
                    <div className="si-right">
                        <div className="si-searchBox">
                            <input
                            name="searchQuery"
                            type="search"
                            placeholder="Search by Events"
                            value={searchTerm}
                            onChange={(e) => updateSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="si-weekcalender">
                <div className="si-tblheader">
                    {
                        days.map((obj, index, arr) => {
                            let today = new Date();
                            let thisMonth = today.getMonth() + 1;
                            let thisDay = today.getDate();

                            if (thisMonth < 10) {
                                thisMonth = "0" + thisMonth;
                            };
                            if (thisDay < 10) {
                                thisDay = "0" + thisDay;
                            };

                            let formatedToday = `${today.getFullYear()}-${thisMonth}-${thisDay}`;
                            let thisTime = new Date(formatedToday).getTime();

                            let style = { cursor: "pointer" };

                            if (arr.length === 1) {
                                style = { width: "100%", flex: "0 0 100%" };
                            };

                            let dayFullName = DayAsString(obj._d.getDay());
                            let dayColor = "";
                            if(dayFullName === "Saturday" || dayFullName === "Sunday") {
                                dayColor = "red";
                            };

                            return (
                                <div 
                                    className={`si-column ${thisTime == obj.JSTime ? "active" : ""}`}
                                    data-date={obj._d.toDateString()}
                                    data-index={index}
                                    key={index}
                                    style={style}
                                    onClick={(e) => btnText == "Today" ? toggleText(btnText, obj._d) : ""}
                                >
                                    <span className="si-day si-fullName" style={{color: dayColor}}>
                                        { dayFullName }
                                    </span>
                                    <span className="si-day si-shortName" style={{color: dayColor}}>
                                        { dayFullName.slice(0, 3) }
                                    </span>
                                    <span className="si-date" style={{color: dayColor}}>
                                        {obj._d.getDate()}
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        days: state.CalendarReducer.days,
        btnText: state.CalendarReducer.btnText,
        searchTerm: state.CalendarReducer.searchTerm
    };
};

export default connect(mapStateToProps, { toggleText, updateSearch })(MainCalendarHeader);
