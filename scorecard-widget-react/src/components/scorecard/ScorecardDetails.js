import React, { useEffect } from 'react';
import { 
    showHidePopup, showHideVideoPopup, getPreviewData, uploadDeleteLink 
} from '../../actions/ScorecardActions';
import { getCookie,getInningNo } from '../../utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';

function ScorecardDetails({ 
    matchDetails, teams,
    activeInn, activeInnData, showHidePopup, byes,
    legByes, wides, noBalls, penalty, isAdmin, getPreviewData,
    uploadDeleteLink, inningNo, matchId, seriesId, 
    showHideVideoPopup
}) {

    // const [batTeamImg, setBatImg] = useState("");
    // const [bowTeamImg, setBowImg] = useState("");

    useEffect(() => {
        // setBatImg(`./images/teamFlags/${activeInnData.Battingteam}.png`);
        // setBowImg(`./images/teamFlags/${activeInnData.Bowlingteam}.png`);
        if(matchId) {
            getPreviewData(inningNo, matchId);
        };
    }, [activeInn, matchDetails]);

    const handleDelete = (upload_video_link, upload_type, playerId) => {
        if(upload_type && upload_video_link) {
            let data = {
                series_id: Number(seriesId),
                match_id: Number(matchId),
                player_id: Number(playerId),
                innings_no: Number(inningNo),
                sport_id : 1,
                is_delete: 1,
                upload_type,
                upload_video_link
            };
            uploadDeleteLink(data);
        };
    };

    // const showDefaultImg = (team) => {
    //     if(team === "batting") {
    //         setBatImg("./images/teamFlags/default.png");
    //     } else {
    //         setBowImg("./images/teamFlags/default.png");
    //     };
    // };
    
    return (
        <div className="si-subtab-content">
            <div className="simc-matchinfo si-batting-strip">
                <div className="si-lft">
                    <div className="content-wrap si-team">
                        {/* <div className="si-team-image si-team-img">
                            <img 
                                src={ batTeamImg }
                                onError={ () => showDefaultImg("batting") }
                            />
                        </div> */}
                        <div className="simc-team-name"> 
                            <span className="si-full-name si-team-name">
                                { 
                                    activeInnData.Battingteam &&
                                    teams[activeInnData.Battingteam].Name_Full 
                                }
                            </span> 
                            <span className="si-short-name">
                                { 
                                    activeInnData.Battingteam &&
                                    teams[activeInnData.Battingteam].Name_Short 
                                }
                            </span> 
                        </div>
                    </div>
                </div>
                <div className="si-rgt simc-team-score">
                    <div className="content-wrap"> 
                        <span className="si-score">
                            { 
                                activeInnData.Total &&
                                `${activeInnData.Total}/${activeInnData.Wickets}` 
                            }
                        </span>
                        <span className="si-overs">
                            {
                                activeInnData.Overs &&
                                `(${activeInnData.Overs} Overs)`
                            }
                        </span>
                        <span className="si-team-rr si-run-rate">
                            {
                                activeInnData.Runrate &&
                                `RR ${activeInnData.Runrate}`
                            }
                        </span> 
                    </div>
                </div>
            </div>
            <div className="simc-block-content si-batting-content">
                <div className="simc-block-section simc-batting-section">
                    <div className="simc-block-section-body">
                        <div className="simc-table-block si-batting">
                            <div className="simc-table simc-tbl-head">
                                <div className="simc-table-tr">
                                    <div className="simc-table-th tblBatting"> 
                                        <span className="si-bat-title">Batting</span> 
                                    </div>
                                    <div className="simc-table-th tblR"> 
                                        <span className="si-run-title">R</span> 
                                    </div>
                                    <div className="simc-table-th tblB"> 
                                        <span className="si-balls-title">B</span> 
                                    </div>
                                    <div className="simc-table-th tbl4s"> 
                                        <span className="si-fours-title si-lowercase">4s</span> 
                                    </div>
                                    <div className="simc-table-th tbl6s"> 
                                        <span className="si-sixes-title si-lowercase">6s</span> 
                                    </div>
                                    <div className="simc-table-th tblSr"> 
                                        <span className="si-sr-title">S/R</span> 
                                    </div>
                                    <div className="simc-table-th si-action"> 
                                        <span className="">Video</span> 
                                    </div>
                                </div>
                            </div>

                            {
                                activeInnData.Batsmen &&
                                activeInnData.Batsmen.map(obj => {
                                    return (
                                        <div 
                                            className="simc-table kt-batsmen si-accord-head simc-wicketkeeper simc-active" 
                                            key={ uuidv4() }
                                        >
                                            <div className="simc-table-tr simc-scoreboard-data">
                                                <div className="simc-table-td tblBatting">
                                                    <div className="simc-txt1"> 
                                                        <a href="#">
                                                            <span className="si-plyr-name">
                                                                {
                                                                    activeInnData.Battingteam &&
                                                                    teams[activeInnData.Battingteam].Players[obj.Batsman].Name_Full
                                                                }
                                                            </span>
                                                        </a> 
                                                    </div>
                                                    <div className="simc-txt2 si-plyr-status"> 
                                                        <span className="si-wicket-status">
                                                            {
                                                                obj.Howout
                                                            }
                                                        </span> 
                                                    </div>
                                                    </div>
                                                    <div className="simc-table-td tblR si-runs"> 
                                                        <span className="si-value">
                                                            {
                                                                obj.Runs ? obj.Runs : "-"
                                                            }
                                                        </span> 
                                                    </div>
                                                    <div className="simc-table-td tblB si-balls"> 
                                                        <span className="si-value">
                                                            {
                                                                obj.Balls ? obj.Balls : "-"
                                                            }
                                                        </span> 
                                                    </div>
                                                    <div className="simc-table-td tbl4s si-fours"> 
                                                        <span className="si-value">
                                                            {
                                                                obj.Fours ? obj.Fours : "-"
                                                            }
                                                        </span> 
                                                    </div>
                                                    <div className="simc-table-td tbl6s si-sixes"> 
                                                        <span className="si-value">
                                                            {
                                                                obj.Sixes ? obj.Sixes : "-"
                                                            }
                                                        </span> 
                                                    </div>
                                                    <div className="simc-table-td tblSr si-srate"> 
                                                        <span className="si-value">
                                                            {
                                                                obj.Strikerate ? obj.Strikerate : "-"
                                                            }
                                                        </span> 
                                                    </div>
                                                    <div className="simc-table-td tblSr si-action"> 
                                                    {
                                                        (isAdmin === "true" && obj.Dismissal) &&
                                                        <div 
                                                            className="si-upload" 
                                                            data-tooltip="Upload"
                                                            style={
                                                                (obj.upload_type === 1 || obj.upload_type === 2)
                                                                ?
                                                                {opacity: "0.5", cursor: "auto"}
                                                                :
                                                                {cursor: "pointer"}
                                                            }
                                                            onClick={ (e) => {
                                                                if(!obj.upload_video_link) {
                                                                    showHidePopup(obj.Batsman);
                                                                };
                                                            } }
                                                        ></div>
                                                    }

                                                    {
                                                        (obj.Dismissal) &&
                                                        (
                                                            (obj.upload_type && obj.upload_type === 2)
                                                            ?
                                                            <a 
                                                                href={ obj.upload_video_link }
                                                                target="_blank"
                                                                className="si-preview" 
                                                                data-tooltip="Preview"
                                                                style={
                                                                    (obj.upload_type === 1 || obj.upload_type === 2)
                                                                    ?
                                                                    {cursor: "pointer"}
                                                                    :
                                                                    {opacity: "0.5", cursor: "auto"}
                                                                }
                                                            ></a>
                                                            :
                                                            <div
                                                                className="si-preview" 
                                                                data-tooltip="Preview"
                                                                style={
                                                                    (obj.upload_type === 1 || obj.upload_type === 2)
                                                                    ?
                                                                    {cursor: "pointer"}
                                                                    :
                                                                    {opacity: "0.5", cursor: "auto"}
                                                                }
                                                                onClick={ (e) => { 
                                                                    if(!obj.is_deleted && obj.upload_video_link) {
                                                                        showHideVideoPopup(obj.upload_video_link);
                                                                    };
                                                                } }
                                                            ></div>
                                                        )
                                                    }
                                                    
                                                    {
                                                        (isAdmin === "true" && obj.Dismissal) &&
                                                        <div 
                                                            className="si-delete" 
                                                            data-tooltip="Delete"
                                                            style={ 
                                                                (obj.upload_type === 1 || obj.upload_type === 2)
                                                                ?
                                                                {cursor: "pointer"}
                                                                :
                                                                {opacity: "0.5", cursor: "auto"}
                                                            }
                                                            onClick={ (e) => handleDelete(
                                                                obj.upload_video_link, 
                                                                obj.upload_type, 
                                                                obj.Batsman) 
                                                            }
                                                        ></div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <div className="simc-block-section simc-extra-section si-extra-strip">
                    <div className="simc-content-wrap si-extra-runs">
                        <strong>
                            Extras: { byes + legByes + wides + noBalls + penalty } runs
                        </strong> (B: { byes }, LB: { legByes }, WD: { wides }, NB: { noBalls }, P: { penalty })
                    </div>
                </div>

                <div className="simc-block-section simc-fallofwicket-section si-fow">
                    <div className="simc-block-section-hd si-fowstrip img-style-type-1">
                        <div className="content-wrap si-team">
                            {/* <div className="si-team-image si-team-img">
                                <img 
                                    src={ batTeamImg }
                                    onError={ () => showDefaultImg("batting") }
                                />
                            </div> */}
                            <div className="si-fow-title">
                                Fall of Wickets
                            </div>
                        </div>
                    </div>
                    <div className="simc-block-section-body">
                        <p className="si-fow-list si-fow-content">
                            {
                                activeInnData.FallofWickets && 
                                activeInnData.FallofWickets.map(wicket => {
                                    return (
                                        <span className="si-fow-count" key={ uuidv4() }> 
                                            <strong className="si-fow">
                                                { `${wicket.Score}/${wicket.Wicket_No}` }
                                            </strong>
                                            (
                                                <a href="#">
                                                    <span className="si-player-name highlightTxt">
                                                        { 
                                                            teams[activeInnData.Battingteam].Players[wicket.Batsman].Name_Short 
                                                        }
                                                    </span>
                                                </a>
                                                <span className="si-fow-over">
                                                    { wicket.Overs } Overs
                                                </span>
                                            ), 
                                        </span>
                                    )
                                })
                            }
                        </p>
                    </div>
                </div>

                <div className="simc-block-section simc-bowling-section si-bowling-content">
                    <div className="simc-block-section-hd img-style-type-1 si-bowling-wrap">
                        <div className="content-wrap si-team si-bowling-strip">
                            {/* <div className="si-team-image si-team-img">
                                <img 
                                    src={ bowTeamImg }   
                                    onError={ () => showDefaultImg("bowling") }
                                />
                            </div> */}
                            <div className="si-team-name">
                                { 
                                    activeInnData.Bowlingteam &&
                                    teams[activeInnData.Bowlingteam].Name_Full 
                                } Bowling
                            </div>
                        </div>
                    </div>
                    <div className="simc-block-section-body">
                        <div className="simc-table-block">
                            <div className="simc-table si-bowling">
                                <div className="simc-table-tr simc-tbl-head">
                                    <div className="simc-table-th tblBowling"> 
                                        <span className="si-bowl-title">Bowling</span> 
                                    </div>
                                    <div className="simc-table-th tblO"> 
                                        <span className="si-overs-title">O</span> 
                                    </div>
                                    <div className="simc-table-th tblM"> 
                                        <span className="si-maidens-title">M</span> 
                                    </div>
                                    <div className="simc-table-th tblR"> 
                                        <span className="si-runs-title">R</span> 
                                    </div>
                                    <div className="simc-table-th tblW"> 
                                        <span className="si-wickets-title">W</span> 
                                    </div>
                                    <div className="simc-table-th tblNB"> 
                                        <span className="si-nb-title">NB</span> 
                                    </div>
                                    <div className="simc-table-th tblWB"> 
                                        <span className="si-wd-title">WD</span> 
                                    </div>
                                    <div className="simc-table-th tblER"> 
                                        <span className="si-er-title">E/R</span> 
                                    </div>
                                </div>

                                {
                                    activeInnData.Bowlers && 
                                    activeInnData.Bowlers.map(bowler => {
                                        return (
                                            <div className="simc-table-tr" key={ uuidv4() }>
                                                <div className="simc-table-td tblBowling">
                                                    <div className="simc-txt1"> 
                                                        <a href="#">
                                                            <span className="si-plyr-name">
                                                                {
                                                                    activeInnData.Bowlingteam &&
                                                                    teams[activeInnData.Bowlingteam].Players[bowler.Bowler].Name_Full
                                                                }
                                                            </span>
                                                        </a> 
                                                    </div>
                                                </div>
                                                <div className="simc-table-td tblO"> 
                                                    <span className="si-overs">
                                                        { bowler.Overs }
                                                    </span> 
                                                </div>
                                                <div className="simc-table-td tblM si-maidens"> 
                                                    <span className="si-midan">
                                                        { bowler.Maidens }
                                                    </span> 
                                                </div>
                                                <div className="simc-table-td tblR"> 
                                                    <span className="si-runs">
                                                        { bowler.Runs }
                                                    </span> 
                                                </div>
                                                <div className="simc-table-td tblW"> 
                                                    <span className="si-wickets">
                                                        { bowler.Wickets }
                                                    </span> 
                                                </div>
                                                <div className="simc-table-td tblNB"> 
                                                    <span className="si-noballs">
                                                        { bowler.Noballs }
                                                    </span> 
                                                </div>
                                                <div className="simc-table-td tblWB"> 
                                                    <span className="si-wides">
                                                        { bowler.Wides }
                                                    </span> 
                                                </div>
                                                <div className="simc-table-td tblER"> 
                                                    <span className="si-economy">
                                                        { bowler.Economyrate }
                                                    </span> 
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    let { 
        matchDetails, teams,  
        activeInn, activeInnData, matchData
    } = state.ScorecardReducer;
    let isAdmin = getCookie("is_admin");
    let inning_no = getInningNo(activeInn); 

    return {
        isAdmin,
        matchDetails,
        teams,
        activeInn, 
        activeInnData,
        inningNo: inning_no,
        byes: activeInnData.Byes ? Number(activeInnData.Byes) : 0,
        legByes: activeInnData.Legbyes ? Number(activeInnData.Legbyes) : 0,
        wides: activeInnData.Wides ? Number(activeInnData.Wides) : 0,
        noBalls: activeInnData.Noballs ? Number(activeInnData.Noballs) : 0,
        penalty: activeInnData.Penalty ? Number(activeInnData.Penalty) : 0,
        matchId: matchData.Matchdetail ? matchData.Matchdetail.Match.Id : "",
        seriesId: matchData.Matchdetail ? matchData.Matchdetail.Series.Id : "",
    };
};

export default connect(
    mapStateToProps, 
    { showHidePopup, showHideVideoPopup, getPreviewData, uploadDeleteLink }
)(ScorecardDetails);
