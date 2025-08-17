import React, { useState, useEffect } from 'react';
import { showHideMatchDetails } from '../../actions/ScorecardActions';
import { connect } from 'react-redux';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

function MatchDetails({ 
    matchDetails, teams, homeTeamInns, awayTeamInns, isMatchDetails, showHideMatchDetails
 }) {

    // const [homeTeamImg, setHomeImg] = useState("");
    // const [awayTeamImg, setAwayImg] = useState("");

    // useEffect(() => {
    //     setHomeImg(`./images/teamFlags/${matchDetails.Team_Home}.png`);
    //     setAwayImg(`./images/teamFlags/${matchDetails.Team_Away}.png`);
    // }, [matchDetails]);

    // const showDefaultImg = (team) => {
    //     if(team === "home") {
    //         setHomeImg("./images/teamFlags/default.png");
    //     } else {
    //         setAwayImg("./images/teamFlags/default.png");
    //     };
    // };
    
    return (
        <div className="simc-highlights">
            <div className="simc-matchbox match-type-test">
                <div className="simc-head">
                    <div className="simc-content-wrap">
                        <div className="match-title si-widgets" data-type="si-venue">
                            <span className="si-series-detail">
                                { matchDetails.Series ? matchDetails.Series.Name : "" }
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="simc-match-details si-widgets" data-type="si-matchstats">
                    <span 
                        className="simc-match-details-hd si-detail-title"
                        onClick={ (e) => showHideMatchDetails() }
                    >
                        <span className="simc-detail-box">
                            Match Details
                        </span>
                    </span> 
                    <div 
                        className="simc-matchdetail-container"
                        style={isMatchDetails ? { transform : "translateX(0)"  } : {}}
                    >
                        <div className="simc-matchdetail-wrap">
                            <div className="simc-content-box">
                                <div className="simc-content-head">
                                    <div className="simc-team simc-team-a si-team-home">
                                        {/* <div className="simc-team-image si-team-img">
                                            <img 
                                                src={ homeTeamImg } 
                                                onError={ (e) => showDefaultImg("home") }
                                            />
                                        </div> */}
                                        <div className="simc-team-name">
                                            <span 
                                                className="si-team-name si-full-name" 
                                                data-id={ matchDetails.Team_Home ? matchDetails.Team_Home : "" }
                                            >
                                                { matchDetails.Team_Home ? teams[matchDetails.Team_Home].Name_Full : "" }
                                            </span>
                                            <span className="si-short-name">
                                                { matchDetails.Team_Home ? teams[matchDetails.Team_Home].Name_Short : "" }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="simc-team simc-team-b si-team-away">
                                        {/* <div className="simc-team-image si-team-img">
                                            <img 
                                                src={ awayTeamImg } 
                                                onError={ () => showDefaultImg("away") }
                                            />
                                        </div> */}
                                        <div className="simc-team-name">
                                            <span 
                                                className="si-team-name si-full-name" 
                                                data-id={ matchDetails.Team_Away ? matchDetails.Team_Away : "" }
                                            >
                                                { matchDetails.Team_Away ? teams[matchDetails.Team_Away].Name_Full : "" }
                                            </span>
                                            <span className="si-short-name">
                                                { matchDetails.Team_Away ? teams[matchDetails.Team_Away].Name_Short : "" }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="simc-date"> 
                                        <span className="simc-match-date si-match-date"></span>
                                    </div>
                                </div>
                                <div className="simc-content-body">
                                    <div className="simc-match-schedule-wrap">
                                        <div className="simc-match-schedule"> 
                                            <p className="si-series-name">
                                                { matchDetails.Series ? matchDetails.Series.Name : "" }
                                            </p> 
                                            <p className="si-match-time">
                                                <b> Time: </b> 
                                                { 
                                                    matchDetails.Match 
                                                    ? 
                                                    `${matchDetails.Match.Time} (GMT) | ${moment.tz(`${moment(matchDetails.Match.Date).format('YYYY-MM-DD')}T${matchDetails.Match.Time}:00${matchDetails.Match.Offset}`, "Asia/Kolkata").format("HH:mm")} (Local time) - ${moment(matchDetails.Match.Date, "MM/DD/YYYY").format("DD MMMM YYYY")}`
                                                     : 
                                                     "" 
                                                }
                                            </p> 
                                        </div>
                                        <p className="simc-match-schedule si-match-toss">
                                            <span>
                                                <b>Toss:</b> { `${matchDetails.Tosswonby ? teams[matchDetails.Tosswonby].Name_Short : ""}  won the toss and elected to ${matchDetails.Toss_elected_to ? matchDetails.Toss_elected_to : ""}` }
                                            </span>
                                        </p>
                                        <p className="simc-match-umpire"> 
                                            <span className="si-match-refree"> 
                                                <b>Referee:</b> { matchDetails.Officials ? matchDetails.Officials.Referee : "" }
                                            </span> 
                                        </p>
                                        <p className="simc-match-umpire"> 
                                            <span className="si-umpire-name">
                                                <b>Umpires:</b> { matchDetails.Officials ? matchDetails.Officials.Umpires : "" }
                                            </span>
                                        </p>
                                        <p className="simc-match-status" style={{ display : "none" }}> 
                                            <span className="si-series-status"></span> 
                                            <span className="si-playerofmatch"></span> 
                                            <span className="si-playerofseries"></span> 
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="simc-body si-widgets match-type-test" data-type="si-scores">
                    <div className="match-status-type si-match-status">
                        <span>
                            { 
                                (matchDetails.Match && matchDetails.Match.Type === "Test") &&
                                `Day ${ matchDetails.Day } - ${ matchDetails.Status }` 
                            }
                        </span>
                    </div>
                    <div className="team-box">
                        <div className="content-box">
                            <div 
                                className="team team-a si-team-home" 
                                data-id={ matchDetails.Team_Home ? matchDetails.Team_Home : "" }
                            >
                                <div className="content-wrap">
                                    <div className="content-top">
                                        {/* <div className="team-image si-team-img">
                                            <img 
                                                src={ homeTeamImg } 
                                                onError={ () => showDefaultImg("home") }
                                            />
                                        </div> */}
                                        <div className="team-name"> 
                                            <span className="si-full-name si-team-name">
                                                <span>
                                                    { matchDetails.Team_Home ? teams[matchDetails.Team_Home].Name_Full : "" }
                                                </span>
                                            </span> 
                                            <span className="si-short-name">
                                                { matchDetails.Team_Home ? teams[matchDetails.Team_Home].Name_Short : "" }
                                            </span> 
                                        </div>
                                    </div>
                                    <div className="content-bottom">
                                        {
                                            homeTeamInns.length 
                                            ?
                                            homeTeamInns.map(inn => {
                                                return (
                                                    <div 
                                                        className="team-score si-team-score" 
                                                        key={ uuidv4() }
                                                    >
                                                        <div 
                                                            className="team-inning inning-1  current-inning" 
                                                            data-inningno={ inn.Number }
                                                        >
                                                            <span className="overs" style={{ marginRight : "3px" }}> { `(${inn.Overs} overs)` }</span>
                                                            <span className="score">{ `${inn.Total}/${inn.Wickets}` }</span>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                            :
                                            <div className="team-score si-team-score si-yet-to-bat">
                                                <span>Yet To Bat</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="team-vs">
                                <div className="content-wrap">
                                    <div className="teamvs-txt"> 
                                        <span>vs</span> 
                                    </div>
                                </div>
                            </div>
                            <div 
                                className="team team-b si-team-away active" 
                                data-id={ matchDetails.Team_Away ? matchDetails.Team_Away : "" }
                            >
                                <div className="content-wrap">
                                    <div className="content-top">
                                        {/* <div className="team-image si-team-img">
                                            <img 
                                                src={ awayTeamImg } 
                                                onError={ () => showDefaultImg("away") }
                                            />
                                        </div> */}
                                        <div className="team-name"> 
                                            <span className="si-full-name si-team-name">
                                                <span>
                                                    { matchDetails.Team_Away ? teams[matchDetails.Team_Away].Name_Full : "" }
                                                </span>
                                            </span> 
                                            <span className="si-short-name">
                                                { matchDetails.Team_Away ? teams[matchDetails.Team_Away].Name_Short : "" }
                                            </span> 
                                        </div>
                                    </div>
                                    <div className="content-bottom">
                                        {
                                            awayTeamInns.length
                                            ?
                                            awayTeamInns.map(inn => {
                                                return (
                                                    <div 
                                                        className="team-score si-team-score" 
                                                        key={ uuidv4() }
                                                    >
                                                        <div 
                                                            className="team-inning inning-1  current-inning" 
                                                            data-inningno={ inn.Number }
                                                        >
                                                            <span className="score">{ `${inn.Total}/${inn.Wickets}` }</span>
                                                            <span className="overs"> { `(${inn.Overs} overs)` }</span>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                            :
                                            <div className="team-score si-team-score si-yet-to-bat">
                                                <span>Yet To Bat</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="match-result si-match-equ">
                        <span>
                            { matchDetails.Equation ? matchDetails.Equation : "" }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    let { matchDetails, teams, homeTeamInns, awayTeamInns, isMatchDetails } = state.ScorecardReducer;

    return {
        matchDetails,
        teams,
        homeTeamInns,
        awayTeamInns,
        isMatchDetails
    };
};

export default connect(mapStateToProps, { showHideMatchDetails })(MatchDetails);
