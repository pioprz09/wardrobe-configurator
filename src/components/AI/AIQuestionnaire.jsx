import React, { useState } from 'react';
import { AIQuuestionnaire, UserProfile, AIRecommendationEngine } from '../../services/AIRecommendations';

const AIQuestionnaireComponent = ({ onRecommendations, onClose, currentConfig }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const questions = AIQuuestionnaire.questions;
  const progress = (currentQuestion / questions.length) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateRecommendations();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generateRecommendations = async () => {
    setIsAnalyzing(true);
    
    // Symulacja analizy AI (w rzeczywistości można dodać backend call)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userProfile = new UserProfile(answers);
    const aiEngine = new AIRecommendationEngine();
    const recs = aiEngine.generateRecommendations(userProfile, currentConfig);
    
    setRecommendations(recs);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const applyRecommendations = () => {
    onRecommendations(recommendations);
    onClose();
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'radio':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options.map(option => (
              <label 
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '2px solid',
                  borderColor: currentAnswer === option.value ? '#E17C4F' : '#EAE4DC',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: currentAnswer === option.value ? '#FFF5F0' : 'white'
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  style={{ accentColor: '#E17C4F' }}
                />
                <span style={{ flex: 1, fontSize: '14px' }}>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={currentAnswer || question.min}
              onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <div style={{
              minWidth: '60px',
              padding: '8px 16px',
              backgroundColor: '#E17C4F',
              color: 'white',
              borderRadius: '20px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {currentAnswer || question.min}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            {[
              { value: true, label: 'Tak', emoji: '✅' },
              { value: false, label: 'Nie', emoji: '❌' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value)}
                style={{
                  padding: '20px 30px',
                  border: '2px solid',
                  borderColor: currentAnswer === option.value ? '#E17C4F' : '#EAE4DC',
                  borderRadius: '12px',
                  backgroundColor: currentAnswer === option.value ? '#E17C4F' : 'white',
                  color: currentAnswer === option.value ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '24px' }}>{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (isAnalyzing) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #EAE4DC',
            borderTop: '4px solid #E17C4F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>🤖 AI analizuje Twoje potrzeby...</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Przygotowujemy personalne rekomendacje na podstawie Twoich odpowiedzi
          </p>
        </div>
      </div>
    );
  }

  if (showResults && recommendations) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '20px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{ color: '#E17C4F', marginBottom: '10px' }}>
              🎯 Twoje personalne rekomendacje
            </h2>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: '#E8F4FD',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#0C5460'
            }}>
              Pewność AI: {Math.round(recommendations.confidence * 100)}%
            </div>
          </div>

          {/* Layout Recommendations */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '15px' }}>
              📏 Optymalne wymiary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '10px',
              marginBottom: '10px'
            }}>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#E17C4F' }}>
                  {recommendations.layout.height / 10}cm
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Wysokość</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#E17C4F' }}>
                  {recommendations.layout.depth / 10}cm
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Głębokość</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#E17C4F' }}>
                  {recommendations.layout.moduleCount}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Modułów</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              {recommendations.layout.reasoning.join('. ')}
            </div>
          </div>

          {/* Color Recommendations */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '15px' }}>
              Zalecane kolory
            </h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Zewnętrzny</div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: recommendations.colors.exterior[0].value,
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}></div>
                <div style={{ fontSize: '10px', marginTop: '5px', textAlign: 'center' }}>
                  {recommendations.colors.exterior[0].name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Wnętrze</div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: recommendations.colors.interior,
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }}></div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
              {recommendations.colors.reasoning}
            </div>
          </div>

          {/* Module Recommendations */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '15px' }}>
              Najlepsze moduły dla Ciebie
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recommendations.modules.slice(0, 3).map((module, index) => (
                <div key={module.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: index === 0 ? '#E8F4FD' : '#f8f9fa',
                  borderRadius: '8px',
                  border: index === 0 ? '2px solid #E17C4F' : '1px solid #eee'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: index === 0 ? '#E17C4F' : '#666',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginRight: '12px'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>
                      {module.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {module.reasoning?.join(', ') || 'Dopasowane do Twoich potrzeb'}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: index === 0 ? '#E17C4F' : '#28a745',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '500'
                  }}>
                    {Math.round(module.score)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accessories */}
          {recommendations.accessories.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '15px' }}>
                Polecane akcesoria
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendations.accessories.map((accessory, index) => (
                  <div key={index} style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${accessory.priority === 'high' ? '#E17C4F' : '#28a745'}`
                  }}>
                    <div style={{ fontWeight: '500', fontSize: '13px' }}>{accessory.name}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{accessory.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimizations */}
          {recommendations.optimizations.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#333', fontSize: '16px', marginBottom: '15px' }}>
                Sugestie optymalizacji
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendations.optimizations.map((opt, index) => (
                  <div key={index} style={{
                    padding: '8px 12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '6px',
                    borderLeft: '4px solid #ffc107'
                  }}>
                    <div style={{ fontSize: '12px', color: '#856404' }}>{opt.message}</div>
                    {opt.suggestion && (
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                        Sugestia: {opt.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            <button
              onClick={applyRecommendations}
              style={{
                padding: '12px 24px',
                backgroundColor: '#E17C4F',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#d16740'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#E17C4F'}
            >
              Zastosuj rekomendacje
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px 30px 20px',
          borderBottom: '1px solid #eee',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 10px', color: '#333', fontSize: '20px' }}>
            Asystent AI - Personalne rekomendacje
          </h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Odpowiedz na kilka pytań, a AI zaprojektuje idealną szafę dla Ciebie
          </p>
          
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#eee',
            borderRadius: '3px',
            marginTop: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#E17C4F',
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '8px'
          }}>
            Pytanie {currentQuestion + 1} z {questions.length}
          </div>
        </div>

        {/* Question content */}
        <div style={{ 
          padding: '30px',
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 25px',
              color: '#333',
              fontSize: '18px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              {questions[currentQuestion].question}
            </h3>
            
            {renderQuestion(questions[currentQuestion])}
          </div>

          {/* Navigation buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: currentQuestion === 0 ? '#ccc' : '#666',
                border: '1px solid',
                borderColor: currentQuestion === 0 ? '#ccc' : '#ddd',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Wstecz
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                color: '#999',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Anuluj
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[questions[currentQuestion].id]}
              style={{
                padding: '12px 24px',
                backgroundColor: answers[questions[currentQuestion].id] ? '#E17C4F' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: answers[questions[currentQuestion].id] ? 'pointer' : 'not-allowed'
              }}
            >
              {currentQuestion === questions.length - 1 ? 'Generuj rekomendacje' : 'Dalej'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIQuestionnaireComponent;