import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ListeningPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListeningTasks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks');
        const listeningTasks = (res.data || []).filter((task) => task.type === 'LISTENING');
        setTasks(listeningTasks);
        if (listeningTasks.length > 0) {
          setSelectedTaskId(listeningTasks[0].id);
        }
      } catch (err) {
        console.error('Failed to load listening tasks:', err);
        setError('Unable to load listening tasks right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchListeningTasks();
  }, []);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || tasks[0];
  const questions = selectedTask?.questions || [];

  const handleTaskChange = (taskId) => {
    setSelectedTaskId(taskId);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleOptionChange = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const answer = answers[q.id];
      const correct = q.correctAnswer || q.correct || q.answer;
      if (answer && answer === correct) {
        correctCount += 1;
      }
    });

    const percentage = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    setScore(percentage);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
        <h1>🎧 Listening & Comprehension</h1>
        <p>Loading listening tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
        <h1>🎧 Listening & Comprehension</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
        <h1>🎧 Listening & Comprehension</h1>
        <p>No listening tasks are available yet. Please check back later.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎧 Listening & Comprehension</h1>

      {tasks.length > 1 && (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="task-select" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Task</label>
          <select
            id="task-select"
            value={selectedTask.id}
            onChange={(e) => handleTaskChange(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          >
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>{task.title || task.description || `Listening Task ${task.id}`}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ backgroundColor: '#eef', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '30px' }}>
        <p>{selectedTask.description || 'Listen to the audio clip below, then answer the questions.'}</p>
        <audio controls src={selectedTask.audioUrl} style={{ width: '100%', maxWidth: '500px' }} />
      </div>

      {!submitted ? (
        <div>
          {questions.map((q, index) => (
            <div key={q.id} style={{ marginBottom: '25px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <p style={{ fontWeight: 'bold' }}>{index + 1}. {q.questionText || q.text || q.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(q.options || q.opts || []).map((opt) => (
                  <label key={opt} style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      onChange={() => handleOptionChange(q.id, opt)}
                      checked={answers[q.id] === opt}
                    />
                    <span style={{ marginLeft: '10px' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={calculateScore}
            disabled={Object.keys(answers).length < questions.length}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: Object.keys(answers).length < questions.length ? '#ccc' : '#28a745',
              color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
            }}
          >
            Submit Answers
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #ccc', borderRadius: '10px' }}>
          <h2>Your Score</h2>
          <div style={{ fontSize: '60px', fontWeight: 'bold', color: score >= 70 ? 'green' : 'red' }}>
            {score}%
          </div>
          <p>{score >= 70 ? 'Great Listening Skills!' : 'Keep Practicing!'}</p>

          <Link to="/">
            <button style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>Back to Home</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ListeningPage;
