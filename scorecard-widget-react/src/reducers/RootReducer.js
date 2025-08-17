import { combineReducers } from "redux";
import AuthReducer from './AuthReducer';
import CalendarReducer from "./CalendarReducer";
import ScorecardReducer from "./ScorecardReducer";

const RootReducer = combineReducers({
    AuthReducer,
    CalendarReducer,
    ScorecardReducer
});

export default RootReducer;