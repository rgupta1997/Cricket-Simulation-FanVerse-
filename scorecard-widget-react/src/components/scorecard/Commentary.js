import React, { Fragment } from 'react';
import { toggleCommentaryType } from '../../actions/ScorecardActions';
import FullCommentary from './FullCommentary';
import FoursCommentary from './FoursCommentary';
import SixesCommentary from './SixesCommentary';
import FowCommentary from './FowCommentary';
import { connect } from 'react-redux';

function Commentary({ toggleCommentaryType, commentaryType, fullCommentary }) {

    return (
        <div className="si-subtab-content">
            {
                (fullCommentary.length)
                ?
                <Fragment>
                    <div className="si-filter si-comm-filters">
                        <ul>
                            <li 
                                data-filterid="full" 
                                className={ commentaryType === "full" ? "active" : "" }
                                onClick={ () => toggleCommentaryType("full") }
                            >
                                <div className="content-wrap"> 
                                    <span className="si-fullcommentary">
                                        Full Commentary
                                    </span> 
                                </div>
                            </li>
                            <li 
                                data-filterid="fours"
                                className={ commentaryType === "fours" ? "active" : "" }
                                onClick={ () => toggleCommentaryType("fours") }
                            >
                                <div className="content-wrap"> 
                                    <span className="si-fours si-lowercase">4s</span>
                                </div>
                            </li>
                            <li 
                                data-filterid="sixes"
                                className={ commentaryType === "sixes" ? "active" : "" }
                                onClick={ () => toggleCommentaryType("sixes") }
                            >
                                <div className="content-wrap"> 
                                    <span className="si-sixes si-lowercase">6s</span>
                                </div>
                            </li>
                            <li 
                                data-filterid="fow"
                                className={ commentaryType === "fow" ? "active" : "" }
                                onClick={ () => toggleCommentaryType("fow") }
                            >
                                <div className="content-wrap"> 
                                    <span className="si-fow">Fall of Wickets</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {
                        (commentaryType === "full")
                        ?
                        <FullCommentary />
                        :
                        (commentaryType === "fours")
                        ?
                        <FoursCommentary />
                        :
                        (commentaryType === "sixes")
                        ?
                        <SixesCommentary />
                        :
                        <FowCommentary />
                    }
                </Fragment>
                :
                <div className="simc-block-content">
                    <div className="simc-block-section si-all-comm">
                        <div className="simc-comment-description si-comm-desc">
                            <div className="simc-comment-item si-comm-row">
                                <div className="simc-content-box">
                                    <div className="simc-overscored si-runs simc-noball-com">
                                        <span>"</span>
                                    </div>
                                    <div className="simc-comment-text"> 
                                        <span className="si-comm-text">
                                            Commentary will be available at the start of the match.
                                        </span> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        commentaryType: state.ScorecardReducer.commentaryType,
        fullCommentary: state.ScorecardReducer.fullCommentary
    };
};

export default connect(mapStateToProps, { toggleCommentaryType })(Commentary);