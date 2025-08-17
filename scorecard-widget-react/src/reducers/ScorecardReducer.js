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
} from "../actions/actionTypes/ScorecardTypes";

const initialState = {
    isPopup: false,
    isPlayerPopup: false,
    videoLink: "",
    playerId: "",
    isMatchDetails: false,
    matchData: {},
    matchDetails: {},
    teams: {},
    innings: [],
    homeTeamInns: [],
    awayTeamInns: [],
    activeInn: "",
    activeInnData: {},
    previewData: [],
    activeTab: "scorecard",
    commentaryType: "full",
    fullCommentary: [],
    foursCommentary: [],
    sixesCommentary: [],
    fowCommentary: []
};


export default (state = initialState, action) => {
    const { type, payload } = action;

    switch(type) {
        case SHOW_HIDE_POPUP:
            return {
                ...state,
                isPopup: !state.isPopup,
                playerId: payload
            };

        case SHOW_HIDE_VIDEO_POPUP:
            return {
                ...state,
                isPlayerPopup: !state.isPlayerPopup,
                videoLink: payload
            };

        case SHOW_HIDE_MATCHDETAILS:
            return {
                ...state,
                isMatchDetails: !state.isMatchDetails
            };

        case TOGGLE_INNINGS:
            let newActiveInnData = state.innings.filter(inn => {
                return inn.Number === payload;
            });
            
            return {
                ...state,
                activeInn: payload,
                activeInnData: newActiveInnData[0]
            };

        case TOGGLE_ACTIVE_TAB:
            return {
                ...state,
                activeTab: payload
            };

        case TOGGLE_COMMENTARY_TYPE:
            return {
                ...state,
                commentaryType: payload
            };

        case GET_DATA:
            let { Matchdetail, Teams, Innings } = payload;
            let homeTeamInns = []; 
            let awayTeamInns = [];
            if(Matchdetail && Matchdetail.Team_Home && Innings) {
                homeTeamInns = Innings.filter(inn => inn.Battingteam === Matchdetail.Team_Home);
                awayTeamInns = Innings.filter(inn => inn.Battingteam === Matchdetail.Team_Away);
            };
            
            return {
                ...state,
                matchData: payload,
                matchDetails: Matchdetail,
                teams: Teams,
                homeTeamInns,
                awayTeamInns,
                innings: payload.Innings,
                activeInn: payload.Innings ? payload.Innings.slice(-1)[0].Number : "First",
                activeInnData: payload.Innings ? payload.Innings.slice(-1)[0] : {}
            };

        case GET_LIVE_DATA:
            let newInnings = [ ...state.innings ];
            let newActiveInngData = { ...state.activeInnData };
            let updatedBatsmen = [];
            if(newInnings.length) {
                updatedBatsmen = payload.Innings[0].Batsmen.map(batsman => {
                    // for(let i=0; i<newActiveInngData.Batsmen.length; i++) {
                    //     if(batsman.Batsman === newActiveInngData.Batsmen[i].Batsman) {
                    //         batsman.upload_video_link = newActiveInngData.Batsmen[i].upload_video_link;
                    //         batsman.upload_type = newActiveInngData.Batsmen[i].upload_type;
                    //         break;
                    //     };
                    // };

                    state.previewData.forEach(data => {
                        if(data.player_id == batsman.Batsman && !data.is_deleted) {
                            batsman.upload_video_link = data.upload_video_link;
                            batsman.upload_type = data.upload_type;
                        }
                        else if(data.player_id == batsman.Batsman && data.is_deleted) {
                            batsman.upload_video_link = "";
                            batsman.upload_type = "";
                        };
                    });
                    return batsman;
                });

                let inInnings = false;
                newInnings = newInnings.map((inning) => {
                                if(inning.Number === payload.Innings[0].Number) {
                                    inInnings = true;
                                    return { ...payload.Innings[0], Batsmen: updatedBatsmen };
                                };
                                return inning;
                            });
                
                if(!inInnings) {
                    newInnings.push({ ...payload.Innings[0], Batsmen: updatedBatsmen });
                };
            };
            let newHomeTeamInns = newInnings.filter(inn => inn.Battingteam === state.matchDetails.Team_Home);
            let newAwayTeamInns = newInnings.filter(inn => inn.Battingteam === state.matchDetails.Team_Away);
            
            return { 
                ...state,
                matchData: { ...state.matchData, Innings: newInnings },
                innings: newInnings,
                homeTeamInns: newHomeTeamInns,
                awayTeamInns: newAwayTeamInns,
                activeInnData: newInnings.filter(inn => inn.Number === state.activeInn)[0]
            };

        case GET_PREVIEW_DATA:
            let newBatsmen = [];
            if(state.activeInnData.Batsmen) {
                newBatsmen = state.activeInnData.Batsmen.map(batsman => {
                    payload.forEach(data => {
                        if(data.player_id == batsman.Batsman && !data.is_deleted) {
                            batsman.upload_video_link = data.upload_video_link;
                            batsman.upload_type = data.upload_type;
                        }
                        else if(data.player_id == batsman.Batsman && data.is_deleted) {
                            batsman.upload_video_link = "";
                            batsman.upload_type = "";
                        };
                    });
                    return batsman;
                });
            };

            return {
                ...state,
                activeInnData: { ...state.activeInnData, Batsmen: newBatsmen },
                previewData: payload,
            };

        case GET_COMMENTARY:
            let foursCommentary = [];
            let sixesCommentary = [];
            let fowCommentary = [];
            payload.Commentary.forEach((obj) => {
                if(obj.Isboundary && obj.Runs === "4") {
                    foursCommentary.push(obj);
                }
                else if(obj.Isboundary && obj.Runs === "6") {
                    sixesCommentary.push(obj);
                }
                else if(obj.Iswicket) {
                    fowCommentary.push(obj);
                };
            });
            return {
                ...state,
                fullCommentary: payload.Commentary,
                foursCommentary,
                sixesCommentary,
                fowCommentary
            };

        default:
            return state;
    };
};