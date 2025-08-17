import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

function FowCommentary({ fowCommentary }) {
    return (
        <div className="simc-block-content">
            <div className="simc-block-section si-all-comm">
                {
                    (fowCommentary.length) 
                    ?
                    fowCommentary.map(obj => {
                        let ballClass = "simc-wicket kt-wicket";
                        let ballContent = "";

                        if(parseInt(obj.Runs) !== 0) {
                            ballClass += " simc-wicket-noball";
                            ballContent = obj.Runs
                        };
                        ballContent += "W";

                        return (
                            <div className="simc-comment-description si-comm-desc" key={ uuidv4() }>
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
                        )
                    })
                    :
                    <div className="simc-block-content">
                        <div className="simc-block-section si-all-comm">
                            <div className="simc-comment-description si-comm-desc">
                                <div className="simc-comment-item si-comm-row">
                                    <div className="simc-content-box">
                                        <div className="simc-comment-text"> 
                                            <span className="si-comm-text">
                                                No Wickets have fallen!
                                            </span> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        fowCommentary: state.ScorecardReducer.fowCommentary
    };
};

export default connect(mapStateToProps)(FowCommentary);