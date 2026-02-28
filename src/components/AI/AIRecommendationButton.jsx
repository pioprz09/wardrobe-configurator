import React, { useState } from 'react';
import AIQuestionnaireComponent from './AIQuestionnaire';

const AIRecommendationButton = ({ onApplyRecommendations, currentConfig }) => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpenQuestionnaire = () => {
    setShowQuestionnaire(true);
  };

  const handleCloseQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  const handleRecommendations = (recommendations) => {
    onApplyRecommendations(recommendations);
    setShowQuestionnaire(false);
  };

  return (
    <>
      {/* AI Button */}
      <button
        onClick={handleOpenQuestionnaire}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: '#E17C4F',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '24px',
          fontWeight: '600',
          boxShadow: '0 4px 20px rgba(225, 124, 79, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          animation: 'pulse 2s infinite'
        }}
        title="Asystent AI - Personalne rekomendacje"
      >
        🤖
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1001,
          animation: 'fadeIn 0.2s ease'
        }}>
          Asystent AI - Personalne rekomendacje
        </div>
      )}

      {/* Questionnaire Modal */}
      {showQuestionnaire && (
        <AIQuestionnaireComponent
          onRecommendations={handleRecommendations}
          onClose={handleCloseQuestionnaire}
          currentConfig={currentConfig}
        />
      )}

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 4px 20px rgba(225, 124, 79, 0.3);
          }
          50% {
            box-shadow: 0 6px 30px rgba(225, 124, 79, 0.5);
          }
          100% {
            box-shadow: 0 4px 20px rgba(225, 124, 79, 0.3);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default AIRecommendationButton;