import React, { useState, useEffect } from 'react';
import TopicSelection from '../components/TopicSelection';
import DetailedReport from '../components/DetailedReport';

const WritingTest = () => {
  // --- STATE MANAGEMENT ---
  const [phase, setPhase] = useState('topic'); // 'topic' | 'write' | 'report'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Timer State (5 Minutes = 300 Seconds)
  const [timeLeft, setTimeLeft] = useState(300); 

  // --- DATA: Topics with Keywords for AI Relevance Check ---
  const topics = [
    { 
      id: 1, 
      title: "Tech Trends", 
      desc: "Discuss the impact of Artificial Intelligence on the job market.", 
      color: '#9c27b0', 
      prompt: "Artificial Intelligence AI machine learning automation future jobs technology innovation data workforce displacement efficiency economy" 
    },
    { 
      id: 2, 
      title: "Remote Work", 
      desc: "Is working from home more productive than office work?", 
      color: '#009688', 
      prompt: "Remote work home office productivity flexibility communication mental health balance commute collaboration zoom teams digital nomad" 
    },
    { 
        id: 3, 
        title: "Sustainability", 
        desc: "Why is sustainable development important?", 
        color: '#4caf50', 
        prompt: "Sustainability environment climate change green energy resources future pollution recycling carbon footprint global warming nature" 
      }
  ];

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timerId;
    if (phase === 'write' && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'write' && timeLeft === 0) {
      handleSubmit(); // Auto-submit on timeout
    }
    return () => clearInterval(timerId);
  }, [phase, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (timeLeft > 0 && (!text || text.length < 20)) {
      alert("Please write at least 20 characters before submitting.");
      return;
    }

    setLoading(true);
    
    try {
        const topicPrompt = selectedTopic?.prompt || "General";
        
        // Call Backend API
        const res = await fetch('http://localhost:5000/api/writing/analyze', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                text: text, 
                topic: topicPrompt 
            }) 
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        // Prepare Data for DetailedReport
        setReportData({
            score: data.score,
            title: "Writing Assessment",
            // 1. Top Cards
            metrics: [
                { label: "Word Count", value: text.split(' ').length },
                { label: "Time Remaining", value: formatTime(timeLeft) },
                { label: "Grammar Score", value: data.criteria['Grammar Accuracy'] },
                { label: "Relevance Score", value: `${data.criteria['Task Fulfillment']}%` }
            ],
            // 2. Placement Criteria (Progress Bars)
            criteria: {
                "Grammar Accuracy": data.criteria['Grammar Accuracy'],
                "Task Fulfillment (Relevance)": data.criteria['Task Fulfillment'],
                "Professional Tone": data.criteria['Professional Tone'],
                "Coherence & Logical Flow": data.criteria['Coherence & Flow'],
                "Clarity of Expression": data.criteria['Clarity of Expression']
            },
            // 3. Mistakes Table
            mistakes: data.errors.map(e => ({ 
                type: "Grammar/Spelling", 
                question: e.issue, 
                userAnswer: e.word, 
                correctAnswer: e.suggestion 
            })),
            // 4. Recommendations
            recommendations: [
                data.structure_feedback,
                data.criteria['Professional Tone'] < 70 ? "Avoid casual slang (e.g., 'gonna', 'cool') for a more professional tone." : "Excellent professional tone used.",
                data.criteria['Task Fulfillment'] < 50 ? "Ensure your essay directly addresses the topic prompt." : "Good job staying on topic."
            ]
        });
        setPhase('report');

    } catch(e) { 
        alert("System Error: " + e.message); 
    }
    
    setLoading(false);
  };

  // --- RENDER PHASES ---

  // 1. Topic Selection
  if(phase === 'topic') {
    return (
      <TopicSelection 
        title="Writing" 
        topics={topics} 
        onSelect={(t) => {
          setSelectedTopic(t); 
          setText(""); 
          setTimeLeft(300); // 5 Minutes
          setPhase('write');
        }} 
        onBack={() => window.location.href='/'} 
      />
    );
  }

  // 2. Writing Interface
  if(phase === 'write') {
    return (
      <div style={{maxWidth:'900px', margin:'20px auto', fontFamily:'Arial', padding:'20px'}}>
          {/* Header Bar */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <button onClick={()=>setPhase('topic')} style={{border:'none', background:'transparent', fontSize:'16px', cursor:'pointer', color:'#555'}}>← Change Topic</button>
            
            <div style={{
                background: timeLeft < 60 ? '#ffebee' : '#e3f2fd', 
                color: timeLeft < 60 ? '#c62828' : '#1565c0', 
                padding: '8px 20px', 
                borderRadius: '30px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
                <span>⏱</span>
                <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          {/* Prompt Box */}
          <div style={{background:'#fff', padding:'25px', borderRadius:'12px', marginBottom:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', borderLeft:'5px solid #673ab7'}}>
            <h3 style={{marginTop:0, color:'#673ab7'}}>{selectedTopic.title}</h3>
            <p style={{color:'#333', fontSize:'18px', margin:0}}>{selectedTopic.desc}</p>
          </div>

          {/* Text Area */}
          <textarea 
            rows="15" 
            style={{
                width:'100%', 
                padding:'20px', 
                fontSize:'16px', 
                borderRadius:'12px', 
                border:'1px solid #ddd', 
                fontFamily:'inherit', 
                boxSizing:'border-box',
                resize: 'vertical',
                lineHeight: '1.6',
                outlineColor: '#673ab7'
            }} 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Start typing your essay here... Focus on clarity, grammar, and relevance." 
          />
          
          {/* Submit Button */}
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            style={{
              marginTop:'20px', 
              padding:'15px 40px', 
              background: loading ? '#b0bec5' : '#673ab7', 
              color:'white', 
              border:'none', 
              borderRadius:'30px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize:'18px',
              fontWeight:'bold',
              float: 'right',
              transition: 'background 0.3s'
            }}
          >
              {loading ? "Analyzing Essay..." : "Submit Essay"}
          </button>
      </div>
    );
  }

  // 3. Report
  if(phase === 'report') {
    return (
      <DetailedReport 
        title="Writing" 
        score={reportData.score}
        metrics={reportData.metrics}
        criteria={reportData.criteria}
        mistakes={reportData.mistakes}
        recommendations={reportData.recommendations}
        onRetry={() => {
          setPhase('write'); 
          setReportData(null);
          setText("");
          setTimeLeft(300);
        }} 
        onHome={() => window.location.href='/'} 
      />
    );
  }

  return null;
};

export default WritingTest;