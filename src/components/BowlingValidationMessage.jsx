import React from 'react';
import './BowlingValidationMessage.css';

const BowlingValidationMessage = ({ isVisible, message }) => {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="bowling-validation-overlay">
      <div className="bowling-validation-container">
        <div className="bowling-validation-text">
          {message}
        </div>
      </div>
    </div>
  );
};

export default BowlingValidationMessage;

