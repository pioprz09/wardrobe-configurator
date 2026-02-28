import React from 'react';

const LoadingSpinner = ({ message = "Ładowanie..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div>{message}</div>
    </div>
  );
};

export default LoadingSpinner;
