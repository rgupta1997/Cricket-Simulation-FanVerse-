import React, { Fragment, useEffect } from 'react';
import { getScorecardData, getLiveInnData, toggleInn, toggleActiveTab, getCommentary } from '../../actions/ScorecardActions';
import ScorecardHeader from './ScorecardHeader';
import MatchDetails from './MatchDetails';
import ScorecardDetails from './ScorecardDetails';
import Commentary from './Commentary';
import Popup from './Popup';
import PlayerPopup from './PlayerPopup';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

function Scorecard({ 
    getScorecardData, getLiveInnData, location, isPlayerPopup, matchDetails,
    toggleInn, teams, innings, homeTeamInns, awayTeamInns, activeInn, activeTab,
    toggleActiveTab, getCommentary
}) {

    useEffect(() => {
        let matchFile = location.search.split("=")[1];
        getScorecardData(matchFile);
    }, []);

    useEffect(() => {
        let matchFile = location.search.split("=")[1];
        getCommentary(matchFile);
    }, [activeInn]);

    useEffect(() => {
        let matchFile = location.search.split("=")[1];
        let liveData = setInterval(() => {
            if(matchDetails.Status_Id === "117") {
                getLiveInnData(matchFile);
                getCommentary(matchFile);
            };
        }, 5000);

        return () => { clearInterval(liveData) };
    }, [matchDetails]);

    return (
        <Fragment>
            <ScorecardHeader />

            <div id="siNavContainer">
                <div className="si-main-wrapper" id="siTabMainContainer">
                    <div className="simc-main-container" id="siMtcContainer">
                        <div className="mod simc-matchcentre">
                            <div className="simc-container">
                                <div className="simc-left-sidebar" style={{ maxWidth : "none" }}>
                                    <MatchDetails />

                                    <div className="simc-main-content">
                                        <div className="simc-section-nav si-matchcentre-tabs">
                                            <div className="si-tab si-need-resclass tab-col-2">
                                                <ul className="swiper-wrapper">
                                                    <li 
                                                        className={`swiper-slide ${activeTab === "scorecard" ? "active" : ""}`} 
                                                        data-tabid="si-scorecard"
                                                        onClick={ () => toggleActiveTab("scorecard") }
                                                    >
                                                        <div className="content-wrap"> 
                                                            <span>Scorecard</span> 
                                                        </div>
                                                    </li>

                                                    <li 
                                                        className={`swiper-slide ${activeTab === "commentary" ? "active" : ""}`} 
                                                        data-tabid="si-commentary"
                                                        onClick={ () => toggleActiveTab("commentary") }
                                                    >
                                                        <div className="content-wrap"> 
                                                            <span>Commentary</span> 
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="simc-section-container">
                                            <div className="simc-section simc-scorecard-section" data-cnt-id="si-main-container">
                                                <div 
                                                    className={`si-subtab si-team-tabs si-need-resclass tab-col-${(innings && innings.length > 1) ? innings.length : "2"}`}
                                                >
                                                    <ul>
                                                        {
                                                            (homeTeamInns && homeTeamInns.length)
                                                            ?
                                                            homeTeamInns.map((inn, id) => {
                                                                return (
                                                                    <li 
                                                                        className={`si-inningstab ${inn.Number===activeInn ? "active" : ""}`}
                                                                        key={ uuidv4() }
                                                                        onClick={ (e) => toggleInn(inn.Number) }
                                                                    >
                                                                        <span className="si-team-name">
                                                                            {teams[inn.Battingteam].Name_Short}
                                                                            <em>{id + 1}<sup>{ id===0 ? "st" : "nd" }</sup> Inns</em>
                                                                        </span>
                                                                    </li>
                                                                )
                                                            })
                                                            :
                                                            (
                                                                <li className="si-inningstab">
                                                                    <span className="si-team-name">
                                                                        { 
                                                                            matchDetails.Team_Home 
                                                                            ?
                                                                            teams[matchDetails.Team_Home].Name_Full
                                                                            :
                                                                            "Home Team"
                                                                        }
                                                                    </span>
                                                                </li>
                                                            )
                                                        }

                                                        {
                                                            (awayTeamInns && awayTeamInns.length) 
                                                            ?
                                                            awayTeamInns.map((inn, id) => {
                                                                return (
                                                                    <li 
                                                                        className={`si-inningstab ${inn.Number===activeInn ? "active" : ""}`}
                                                                        key={ uuidv4() }
                                                                        onClick={ (e) => toggleInn(inn.Number) }
                                                                    >
                                                                        <span className="si-team-name">
                                                                            {teams[inn.Battingteam].Name_Short}
                                                                            <em>{id + 1}<sup>{ id===0 ? "st" : "nd" }</sup> Inns</em>
                                                                        </span>
                                                                    </li>
                                                                )
                                                            })
                                                            :
                                                            (
                                                                <li className="si-inningstab">
                                                                    <span className="si-team-name">
                                                                        { 
                                                                            matchDetails.Team_Away 
                                                                            ?
                                                                            teams[matchDetails.Team_Away].Name_Full
                                                                            :
                                                                            "Away Team"
                                                                        }
                                                                    </span>
                                                                </li>
                                                            )
                                                        }
                                                    </ul>
                                                </div>

                                                <div className="si-subtab-container si-matchcentre-container">
                                                    {
                                                        activeTab === "scorecard" 
                                                        ?
                                                        <ScorecardDetails />
                                                        :
                                                        <Commentary />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>    

            <Popup />
            {
                isPlayerPopup && 
                <PlayerPopup />
            }
        </Fragment>
    );
};

const mapStateToProps = (state) => {
    let { 
        isPlayerPopup, matchDetails, teams, activeInn,
        innings, homeTeamInns, awayTeamInns, activeTab
    } = state.ScorecardReducer;
    return {
        isPlayerPopup,
        matchDetails,
        teams,
        innings,
        activeInn,
        homeTeamInns,
        awayTeamInns,
        activeTab
    };
};

export default connect(
    mapStateToProps, 
    { getScorecardData, getLiveInnData, toggleInn, toggleActiveTab, getCommentary }
)(Scorecard);
