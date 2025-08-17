import React from 'react';
import ReactPlayer from 'react-player';
import { showHideVideoPopup } from '../../actions/ScorecardActions';
import { connect } from 'react-redux';

function PlayerPopup({ showHideVideoPopup, videoLink }) {

    return (
        <div className="si-popup active">
            <div 
                className="si-popup-modal si-animated si-clienttPopup si-player-popup"
                // style={{
                //     transform: "translateY(-50%)",
                //     maxWidth: "700px",
                //     height: "500px",
                //     backgroundColor: "black"
                // }}
            >
                <div 
                    className="si-popup-modal-bg si-player-popup-bg"
                    // style={{
                    //     width: "800px",
                    //     height: "500px"
                    // }}
                >
                    <span 
                        className="si-popup-close"
                        onClick={ (e) => showHideVideoPopup() }
                    >
                    </span>
                    <div 
                        className="si-popup-body"
                        
                    >
                        <ReactPlayer 
                            url={ videoLink }
                            playing
                            controls
                            width="100%"
                            height="95%"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

const mapStateToProps = (state) => {
    return {
        videoLink: state.ScorecardReducer.videoLink
    };
};

export default connect(mapStateToProps, { showHideVideoPopup })(PlayerPopup);
