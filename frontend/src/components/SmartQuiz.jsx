import React, { useState, useEffect } from 'react';

const SmartQuiz = ({ questions, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questions[0].time || 30);
  const [answers, setAnswers] = useState({});

  useEffect(() => { setTimeLeft(questions[currentQ].time || 30); }, [currentQ, questions]);

  useEffect(() => {
    if (timeLeft === 0) { handleNext(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(prev => prev + 1);
    else onComplete(answers);
  };

  const q = questions[currentQ];

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'Arial', textAlign:'center' }}>
      
      {/* Progress Bar */}
      <div style={{ height: '5px', background: '#eee', marginBottom: '20px', borderRadius:'5px' }}>
        <div style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, height: '100%', background: '#4caf50', borderRadius:'5px', transition: 'width 0.3s' }}></div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', color: '#555' }}>Q {currentQ + 1} / {questions.length}</span>
        <span style={{ color: timeLeft < 10 ? 'red' : '#333', fontWeight: 'bold' }}>⏱ {timeLeft}s</span>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom:'20px', color:'#2c3e50' }}>{q.text}</h3>
        
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {q.opts.map(opt => (
            <div 
                key={opt} 
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                style={{ 
                    padding: '15px', borderRadius: '10px', 
                    border: answers[q.id] === opt ? '2px solid #2196f3' : '1px solid #eee',
                    background: answers[q.id] === opt ? '#e3f2fd' : 'white',
                    cursor: 'pointer', fontWeight:'500', transition:'0.2s', textAlign:'center'
                }}
            >
                {opt}
            </div>
          ))}
        </div>

        <button onClick={handleNext} style={{ width: '100%', padding: '15px', background: '#333', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', marginTop: '30px', cursor: 'pointer', fontWeight:'bold' }}>
          {currentQ === questions.length - 1 ? "Finish Test" : "Next Question →"}
        </button>
      </div>
    </div>
  );
};

export default SmartQuiz;