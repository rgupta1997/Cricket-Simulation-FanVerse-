import { LOGIN, LOGOUT, SHOW_LOADER, HIDE_LOADER } from "./actionTypes/AuthTypes";
import { toast } from 'react-toastify';
import axios from 'axios';
import { domain } from '../utils/utils';


export const login = ({ userName, password, history }) => async (dispatch) => {
    dispatch({
        type: SHOW_LOADER
    });

    try {
        if(userName && password) {
            const body = JSON.stringify({ userEmail: userName, userPassword: password });
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
            };
            const res = await axios.post(
                `${domain}/api/Login`,
                body,
                config
            );
            
            const { ResponseData, ResponseMsg, ResponseStatus } = res.data;

            if(ResponseStatus) {
                let { user_id, display_name, privilege_name } = ResponseData[0];
                let is_admin = false;
                if(ResponseData[0].privilege_id === 1 || ResponseData[0].privilege_id === 2) {
                    is_admin = true;
                };

                dispatch({
                    type: LOGIN,
                    payload: { user_id, user_name: display_name, privilege_name, is_admin }
                });
        
                history.push('/calendar');
            } else {
                toast.error(ResponseMsg);
            };
            
        } else {
            toast.error("Please provide correct username and password.")
        };
    }
    catch (error) {
        toast.error("Something went wrong. Please try again.")
    }

    dispatch({
        type: HIDE_LOADER
    });
};

export const logout = () => async (dispatch) => {
    dispatch({
        type: LOGOUT
    });
};