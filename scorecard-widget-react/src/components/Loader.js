import React from 'react';
import { connect } from 'react-redux';

function Loader({ isLoader }) {

    return (
        <React.Fragment>
            {
                isLoader &&
                <div className="si-loader-wrap" id="loader"> 
                        <div className="si-loader"> 
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>   
                </div>
            }
        </React.Fragment>
    );
};

const mapStateToProps = (state) => {
    return ({
        isLoader: state.AuthReducer.isLoader
    });
};

export default connect(mapStateToProps)(Loader);
