import {
    TOGGLE_BTN_TEXT,
    GET_NEXT,
    GET_PREVIOUS,
    SETDATES,
    GETEVENTS,
    UPDATESEARCHTERM
} from "./actionTypes/CalendarTypes";
import { SHOW_LOADER, HIDE_LOADER } from "./actionTypes/AuthTypes";
import { formatDate, domain } from "../utils/utils";
import axios from 'axios';
import { toast } from "react-toastify";
import moment from 'moment';
import 'moment-timezone';


export const getNextDays = (day = new Date(), numberOfDays = 7) => async (dispatch) => {
    let endDate = "";

    var days = [];
    for (let i = 0; i < numberOfDays; i++) {
        days.push(moment(day).add(i, "days"));
        let endOfWeek = moment(day).add(i, "days");
        endDate = formatDate(endOfWeek);
    };
    days.forEach((obj) => {
        let d = new Date(obj._d);

        let month = d.getMonth() + 1;
        let day = d.getDate();

        if (month < 10) {
        month = "0" + month;
        }

        if (day < 10) {
            day = "0" + day;
        };

        let formatedDate = `${d.getFullYear()}-${month}-${day}`;

        d = new Date(formatedDate);
        obj.JSTime = d.getTime();
    });

    dispatch({
      type: SETDATES,
      payload: { endDate, days },
    });
};

export const getPrevious = (text, date) => async (dispatch) => {

    if (text === "Today") {
        dispatch({
        type: GET_PREVIOUS,
        payload: moment(date).subtract(1, "weeks").format('YYYY-MM-DD'),
        });
        dispatch(getNextDays(new Date(moment(date).subtract(1, "weeks"))));
    } else {
        dispatch({
        type: GET_PREVIOUS,
        payload: moment(date).subtract(1, "days").format('YYYY-MM-DD'),
        });
        dispatch(getNextDays(new Date(moment(date).subtract(1, "days")), 1));
    }
};

export const getNext = (text, date) => async (dispatch) => {

    if (text === "Today") {
        dispatch({
        type: GET_NEXT,
        payload: moment(date).add(1, "weeks").format('YYYY-MM-DD'),
        });

        dispatch(getNextDays(new Date(moment(date).add(1, "weeks"))));
    } else {
        dispatch({
        type: GET_NEXT,
        payload: moment(date).add(1, "days").format('YYYY-MM-DD'),
        });
        dispatch(getNextDays(new Date(moment(date).add(1, "days")), 1));
    };
};

export const toggleText = (text, date) => async (dispatch) => {
    if (text === "Today") {
        dispatch({
        type: TOGGLE_BTN_TEXT,
        payload: {
            text: "Week",
            date: date,
        },
        });

        dispatch(getNextDays(date, 1));
    } else {
        dispatch({
        type: TOGGLE_BTN_TEXT,
        payload: {
            text: "Today",
            date: date,
        },
        });

        dispatch(getNextDays(date));
    }
};

export const getEvents = (data) => async (dispatch) => {
    if(!data.start_date || !data.end_date) {
        return
    };
    dispatch({
        type: SHOW_LOADER,
    });
  
    data.start_date = moment(data.start_date).subtract(7, "days").format("YYYY-MM-DD");
    const body = JSON.stringify(data);
    const config = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    try {
        const res = await axios.post(
            `${domain}/api/FillEvents`,
            body,
            config
        );
    
        dispatch({
            type: HIDE_LOADER,
        });
      
        let events = res.data.events || [];
        let testMatchEvents = [];
        
        events.forEach((obj) => {
            obj.day = 1;
            obj.eventTime = moment(obj.match_start_time).tz("Asia/Kolkata").format("HH:mm A z");
            let matchStartDate = obj.matchdate.split(" ")[0] || "";
            let d = new Date(matchStartDate);
            obj.JSTime = d.getTime();

            if(obj.no_of_day !== "1") {
                for(var i=2; i <= obj.no_of_day; i++) {
                    var newObj = { ...obj };
                    newObj.day = i;
                    newObj.match_name = obj.match_name + `, Day ${i}`;
                    newObj.match_full_name = obj.match_full_name + `, Day ${i}`;
                    newObj.match_start_time = moment(obj.match_start_time).add(i-1, "days").format('MMM DD, YYYY h:mm A');
                    newObj.matchdate = moment(obj.matchdate).add(i-1, "days").format('YYYY-MM-DD');
                    newObj.eventTime = moment(newObj.match_start_time)
                        .tz("Asia/Kolkata")
                        .format("HH:mm A z");
        
                    let matchStartDate = newObj.matchdate.split(" ")[0] || "";
                    let d = new Date(matchStartDate);
                    newObj.JSTime = d.getTime();
        
                    testMatchEvents.push(newObj);
                };
                obj.match_name = obj.match_name + ", Day 1";
                obj.match_full_name = obj.match_full_name + ", Day 1";
            }
        });
  
        dispatch({
            type: GETEVENTS,
            payload: {
                events: events.length ? [ ...events, ...testMatchEvents ] : []
            }
      });
    } catch (error) {
        console.log(error);
        toast.error(
            "Something Went wrong while loading Events. Please Reload and try again!"
        );
    };
};

export const updateSearch = (term) => async (dispatch) => {
    dispatch({
      type: UPDATESEARCHTERM,
      payload: term,
    });
};
