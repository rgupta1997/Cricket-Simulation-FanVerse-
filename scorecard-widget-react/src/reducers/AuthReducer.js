import { LOGIN, LOGOUT, SHOW_LOADER, HIDE_LOADER } from "../actions/actionTypes/AuthTypes";
import { setCookie, deleteCookie } from "../utils/utils";

const initialState = {
    isAuth: false,
    isAdmin: false,
    isLoader: false,
    userId: "",
    userName: "",
    privilegeName: ""
};

export default (state = initialState, action) => {
    const { type, payload } = action;

    switch(type) {
        case LOGIN:
            setCookie("user_id", payload.user_id, 30);
            setCookie("user_name", payload.user_name, 30);
            setCookie("is_admin", payload.is_admin, 30);
            setCookie("privilege_name", payload.privilege_name, 30);
            
            return {
                ...state,
                isAuth: true,
                isAdmin: payload.is_admin == "1" ? true : false,
                userId: payload.user_id,
                userName: payload.user_name,
                privilegeName: payload.privilege_name
            };
        
        case LOGOUT:
            deleteCookie("user_id");
            deleteCookie("user_name");
            deleteCookie("is_admin");
            deleteCookie("privilege_name");

            return {
                ...state,
                isAuth: false,
                isAdmin: false,
                userId: "",
                userName: "",
                privilegeName: ""
            };
        
        case SHOW_LOADER:
            return {
                ...state,
                isLoader: true
            };
        
        case HIDE_LOADER: 
            return {
                ...state,
                isLoader: false
            };

        default: 
            return state;
    };
};