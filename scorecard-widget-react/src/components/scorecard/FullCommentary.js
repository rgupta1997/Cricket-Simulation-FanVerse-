import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

function FullCommentary({ fullCommentary, teams, activeInnData }) {

    return (
        <div className="simc-block-content">
            <div className="simc-block-section si-all-comm">
                {
                    fullCommentary.map(obj => {
                        let ballClass = "simc-noball-com";
                        let ballContent = "";

                        if(obj.Isboundary) {
                            if(obj.Runs === "6") {
                                ballClass = "simc-six kt-six";
                                ballContent = "6";
                            }
                            else {
                                ballClass = "simc-four kt-four";
                                ballContent = "4";
                            };
                        }
                        else if(obj.Iswicket) {
                            ballClass = "simc-wicket kt-wicket";
                            if(parseInt(obj.Runs) !== 0) {
                                ballClass += " simc-wicket-noball";
                                ballContent = obj.Runs
                            };
                            ballContent += "W";
                        }
                        else {
                            if(obj.Detail === "nd") {
                                ballClass = "simc-noball kt-noball";
                                if(parseInt(obj.Runs) > 1) {
                                    ballClass += " simc-wicket-noball";
                                    ballContent = obj.Runs
                                };
                                ballContent += "NB";
                            }
                            else if(obj.Detail === "wd") {
                                ballClass = "simc-wide kt-wide";
                                if(parseInt(obj.Runs) > 1) {
                                    ballClass += " simc-wicket-noball";
                                    ballContent = obj.Runs
                                };
                                ballContent += "WD";
                            }
                            else if(obj.Detail === "lb") {
                                ballClass = "simc-legbye kt-legbye";
                                if(parseInt(obj.Runs) > 0) {
                                    ballClass += " simc-wicket-noball";
                                    ballContent = obj.Runs
                                };
                                ballContent += "LB";
                            }
                            else if(obj.Detail === "b") {
                                ballClass = "simc-bye kt-bye";
                                if(parseInt(obj.Runs) > 0) {
                                    ballClass += " simc-wicket-noball";
                                    ballContent = obj.Runs
                                };
                                ballContent += "B";
                            }
                            else {
                                if(obj.Isball) {
                                    ballClass = "";
                                    ballContent = obj.Runs;
                                };
                            };
                        };

                        return (
                            <Fragment key={ uuidv4() }>
                                {
                                    obj.Summary && 
                                    <div className="simc-comment-description si-comm-desc">
                                        <div className="simc-comment-hd si-comm-head"  style={{ display: "block" }}>
                                            <div className="si-lft">
                                                <div className="simc-content-wrap">
                                                    <h3>
                                                        <span className="si-endofover">
                                                            {
                                                                `End of Over ${obj.Summary.Over} (${obj.Summary.Runs} runs)`
                                                            }
                                                        </span>
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="si-rgt">
                                                <div className="simc-content-wrap"> 
                                                    <span className="si-team-score">
                                                        {
                                                            `${teams[activeInnData.Battingteam].Name_Short} : ${obj.Summary.Score}`
                                                        }
                                                    </span> 
                                                </div>
                                            </div>
                                        </div>
                                        <div className="simc-comment-summary si-comm-summary" style={{ display: "block" }}>
                                            <div className="simc-content-box">
                                                <div className="simc-summary-list row">
                                                    <div className="simc-summary-item col-sm-6">
                                                        <div className="si-table">
                                                            <div className="si-table-tr si-bat-a">
                                                                <div className="si-table-td"> 
                                                                    <span className="si-plyr-name">
                                                                        {
                                                                            (obj.Summary.Batsmen[0].Batsman === obj.Batsman) 
                                                                            ?
                                                                            obj.Batsman_Name
                                                                            :
                                                                            obj.Non_Striker_Name
                                                                        }
                                                                    </span> 
                                                                </div>
                                                                <div className="si-table-td"> 
                                                                    <span className="si-plyr-runs">
                                                                        {
                                                                            `${obj.Summary.Batsmen[0].Runs} (${obj.Summary.Batsmen[0].Balls})`
                                                                        }
                                                                    </span> 
                                                                </div>
                                                            </div>
                                                            <div className="si-table-tr si-bat-b">
                                                                <div className="si-table-td"> 
                                                                    <span className="si-plyr-name">
                                                                        {
                                                                            (obj.Summary.Batsmen[1].Batsman === obj.Batsman) 
                                                                            ?
                                                                            obj.Batsman_Name
                                                                            :
                                                                            obj.Non_Striker_Name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="si-table-td"> 
                                                                    <span className="si-plyr-runs">
                                                                        {
                                                                            `${obj.Summary.Batsmen[1].Runs} (${obj.Summary.Batsmen[1].Balls})`
                                                                        }
                                                                    </span> 
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="simc-summary-item col-sm-6">
                                                        <div className="si-table">
                                                            <div className="si-table-tr si-ball-a">
                                                                <div className="si-table-td"> 
                                                                    <span className="si-plyr-name">
                                                                        {
                                                                            obj.Bowler_Name
                                                                        }
                                                                    </span> 
                                                                </div>
                                                                <div className="si-table-td"> 
                                                                    <span className="si-plyr-stat">
                                                                        {
                                                                            `${obj.Summary.Bowlers[0].Overs} - ${obj.Summary.Bowlers[0].Maidens} - ${obj.Summary.Bowlers[0].Runs} - ${obj.Summary.Bowlers[0].Wickets}`
                                                                        }
                                                                    </span> 
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }

                                <div className="simc-comment-description si-comm-desc">
                                    <div className="simc-comment-item si-comm-row">
                                        <div className="simc-content-box">
                                            {
                                                obj.Isball &&
                                                <div className="simc-over-no si-ball-no">
                                                    {
                                                        obj.Over
                                                    }
                                                </div>
                                            }
                                            <div className={`simc-overscored si-runs ${ballClass}`}>
                                                {
                                                    ballContent 
                                                    ?
                                                    <span>{ ballContent }</span>
                                                    :
                                                    <span>"</span>
                                                }
                                            </div>
                                            <div className="simc-comment-text"> 
                                                <span className="si-comm-text">
                                                    {
                                                        obj.Isball &&
                                                        <b>
                                                            {
                                                                `${obj.Bowler_Name} to ${obj.Batsman_Name}, `
                                                            }
                                                        </b>
                                                    }
                                                    {
                                                        obj.Commentary
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        )
                    })
                }
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        fullCommentary: state.ScorecardReducer.fullCommentary,
        teams: state.ScorecardReducer.teams,
        activeInnData: state.ScorecardReducer.activeInnData
    };
};

export default connect(mapStateToProps)(FullCommentary);