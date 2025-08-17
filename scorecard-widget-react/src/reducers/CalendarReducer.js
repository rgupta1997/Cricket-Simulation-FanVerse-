import {
    TOGGLE_BTN_TEXT,
    GET_NEXT,
    GET_PREVIOUS,
    SETDATES,
    GETEVENTS,
    UPDATESEARCHTERM
} from '../actions/actionTypes/CalendarTypes';
import moment from 'moment';


const initialState = {
    btnText: "Today",
    days: [],
    startDate: moment(new Date()).format('YYYY-MM-DD'),
    endDate: "",
    events: [],
    searchTerm: ""
};


export default (state = initialState, action) => {
    const { type, payload } = action;

    switch(type) {
        case SETDATES:
            return {
                ...state,
                days: payload.days,
                endDate: payload.endDate,
            };

        case TOGGLE_BTN_TEXT:
            return {
                ...state, 
                btnText: payload.text, 
                startDate: payload.date
            };

        case GET_NEXT:
            return {
                ...state,
                startDate: payload
            };

        case GET_PREVIOUS:
            return {
                ...state,
                startDate: payload
            };

        case GETEVENTS:
            return {
                ...state,
                events: payload.events
            };

        case UPDATESEARCHTERM:
            return {
                ...state,
                searchTerm: payload,
            };
        
        default:
            return state;
    };
};