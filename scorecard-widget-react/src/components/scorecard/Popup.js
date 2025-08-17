import React, { useState } from 'react';
import { showHidePopup, uploadDeleteLink, uploadVideo } from '../../actions/ScorecardActions';
import { getInningNo } from '../../utils/utils';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

function Popup({ 
    isPopup, 
    playerId,
    matchId,
    seriesId,
    inningNo,
    showHidePopup, 
    uploadDeleteLink, 
    uploadVideo 
}) {
    
    const [file, setFile] = useState("");
    const [link, setLink] = useState("")

    const handleSave = (e) => {
        e.preventDefault();
        let data = {
            series_id: Number(seriesId),
            match_id: Number(matchId),
            player_id: Number(playerId),
            innings_no: Number(inningNo),
            sport_id : 1,
            is_delete: 0
        };
        if(file && link) {
            toast.error("Can upload either video or link.");
        } 
        else if(file) {
            data.upload_type = 1;
            let fileData = new FormData();
            fileData.append('file', file);
            uploadVideo(fileData, data);
            showHidePopup();
        }
        else if(link) {
            data.upload_type = 2;
            data.upload_video_link = link;
            uploadDeleteLink(data);
            showHidePopup();
        }
        else {
            toast.error("Please add video file or link to upload.");
        };
        setFile("");
        setLink("");
    };

    return (
        <div className={`si-popup ${isPopup ? "active" : ""}`}>
            <div className="si-popup-modal si-animated si-clienttPopup">
                <div className="si-popup-modal-bg">
                    <span 
                        className="si-popup-close"
                        onClick={ (e) => showHidePopup() }
                    >
                      
                    </span>
                    <div className="si-popup-body">
                        <div className="si-headwrp">
                            <div className="si-videoUpload">
                                Upload Video
                                <input 
                                    type="file"  
                                    onChange={ (e) => setFile(e.target.files[0]) }
                                />
                            </div>

                            <div className="si-or">OR</div>
                            
                            <div className="si-LinkUpload">
                                <input 
                                    type="text" 
                                    placeholder="Upload Link" 
                                    value={ link }
                                    onChange={ (e) => setLink(e.target.value) }
                                /> 
                            </div>
                        </div>

                        <div className="si-bottomwrp">
                            <div 
                                className="si-save"
                                onClick={ handleSave }
                            >
                                Save
                            </div>
                            <div 
                                className="si-cancel"
                                onClick={ (e) => showHidePopup() }
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    let { isPopup, playerId, matchData, activeInn } = state.ScorecardReducer;
    let inningNo = getInningNo(activeInn);
    
    return {
        isPopup,
        playerId,
        inningNo,
        matchId: matchData.Matchdetail ? matchData.Matchdetail.Match.Id : "",
        seriesId: matchData.Matchdetail ? matchData.Matchdetail.Series.Id : "",
    };
};

export default connect(mapStateToProps, { showHidePopup, uploadDeleteLink, uploadVideo })(Popup);
