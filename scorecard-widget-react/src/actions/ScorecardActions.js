import { 
    GET_DATA, 
    GET_LIVE_DATA, 
    SHOW_HIDE_POPUP, 
    SHOW_HIDE_VIDEO_POPUP,
    SHOW_HIDE_MATCHDETAILS, 
    TOGGLE_INNINGS,
    GET_PREVIEW_DATA,
    TOGGLE_ACTIVE_TAB,
    TOGGLE_COMMENTARY_TYPE,
    GET_COMMENTARY
} from "./actionTypes/ScorecardTypes";
import { SHOW_LOADER, HIDE_LOADER } from "./actionTypes/AuthTypes";
import { domain, getInningNo } from "../utils/utils";
import { toast } from "react-toastify";
import axios from "axios";



export const showHidePopup = (player_id = "") => async (dispatch) => {
    dispatch({
        type: SHOW_HIDE_POPUP,
        payload: player_id
    });
};

export const showHideVideoPopup = (videoLink = "") => async (dispatch) => {
    dispatch({
        type: SHOW_HIDE_VIDEO_POPUP,
        payload: videoLink
    });
};

export const showHideMatchDetails = () => async (dispatch) => {
    dispatch({
        type: SHOW_HIDE_MATCHDETAILS
    });
};

export const toggleInn = (inningNumber) => async (dispatch) => {
    dispatch({
        type: TOGGLE_INNINGS,
        payload: inningNumber
    });
};

export const toggleActiveTab = (activeTab) => async (dispatch) => {
    dispatch({
        type: TOGGLE_ACTIVE_TAB,
        payload: activeTab
    });
};

export const toggleCommentaryType = (commentaryType) => async (dispatch) => {
    dispatch({
        type: TOGGLE_COMMENTARY_TYPE,
        payload: commentaryType
    });
};


export const getScorecardData = (matchFile) => async (dispatch) => {
    try{
        let matchData = await axios.get(
            `https://demo.sportz.io/sifeeds/repo/cricket/live/json/${matchFile}.json`
        );
        
        if(matchData.status === 200) {
            dispatch({
                type: GET_DATA,
                payload: matchData.data
            });
        } else {
            toast.error("Something went wrong while fetching scorecard data.");
        };
    }
    catch(err) {
        console.log(err);
        // toast.error("Something went wrong while fetching scorecard data.");

    };
};


export const getLiveInnData = (matchFile) => async (dispatch) => {
    try{
        let matchData = await axios.get(
            `https://demo.sportz.io/sifeeds/repo/cricket/live/json/${matchFile}_mini.json`
        );

        if(matchData) {
            dispatch({
                type: GET_LIVE_DATA,
                payload: matchData.data
            });
        } else {
            toast.error("Something went wrong while fetching scorecard data.");
        };
    }
    catch(err) {
        console.log(err);
        // toast.error("Something went wrong while fetching scorecard data.");
    };
};

export const getCommentary = (matchFile) => async (dispatch, getState) => {
    try{
        let activeInn = getState().ScorecardReducer.activeInn;
        let activeInnNo = activeInn === "First" ? 1 : activeInn === "Second" ? 2 : activeInn === "Third" ? 3 : 4;
        
        if(activeInn) {
            let commentaryData = await axios.get(
                `https://demo.sportz.io/sifeeds/repo/cricket/live/json/${matchFile}_commentary_all_${activeInnNo}.json`
            );

            if(commentaryData) {
                dispatch({
                    type: GET_COMMENTARY,
                    payload: commentaryData.data
                });
            } else {
                toast.error("Something went wrong while fetching commentary.");
            };
        };
    }
    catch(err) {
        console.log(err);
        // toast.error("Something went wrong while fetching scorecard data.");
    };
};

export const getPreviewData = (inning_no, match_id) => async (dispatch) => {
    try {
        let previewData = await axios.get(
            `${domain}/api/GetVideoInfo?match_id=${match_id}&innings_no=${inning_no}&sport_id=1`
        );
        if(previewData.status === 200 && previewData.data.length) {
            dispatch({
                type: GET_PREVIEW_DATA,
                payload: previewData.data
            });
        };
    }
    catch(err) {
        console.log(err);
        toast.error("Something went wrong while fetching preview data.")
    };
};

export const uploadDeleteLink = (data) => async (dispatch) => {
    try {
        const body = JSON.stringify(data);
        const config = {
            headers: {
                "Content-Type": "application/json",
            },
        };
        let res = await axios.post(
            `${domain}/api/UploadUrlInsertUpdate`,
            body,
            config
        );

        if(res.data.responseStatus) {
            dispatch(getPreviewData(data.innings_no, data.match_id));
            if(data.is_delete) {
                toast.success("Delete Successful.")
            } else {
                toast.success("Upload Successful.")
            };
        };
    }
    catch(err) {
        console.log(err);
        toast.error("Something went wrong while uploading link.")
    };
};

export const uploadVideo = (videoData, data) => async (dispatch) => {
    dispatch({
        type: SHOW_LOADER
    });
    try {
        const body = videoData;
        let res = await axios.post(
            `${domain}/api/UploadVideo`,
            body
        );
        
        if(res.data.responseStatus) {
            data.upload_video_link = res.data.responseData;
            dispatch(uploadDeleteLink(data));
        };
    }
    catch(err) {
        console.log(err);
        toast.error("Something went wrong while uploading video.")
    };
    dispatch({
        type: HIDE_LOADER
    });
};