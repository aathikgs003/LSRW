import React, { useState } from 'react';
import TopicSelection from '../components/TopicSelection';
import SmartQuiz from '../components/SmartQuiz';
import DetailedReport from '../components/DetailedReport';

const ListeningTest = () => {
  const [phase, setPhase] = useState('topic');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [report, setReport] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  const topics = [
    { 
        id: 1, title: "General Knowledge", desc: "History of Computers", color: '#2c3e50',
        // Reliable Speech Audio
        audio: "https://upload.wikimedia.org/wikipedia/commons/1/1a/The_History_of_the_Computer.ogg", 
        questions: [
            { id: 1, type: "Understanding Main Idea", text: "What is the main topic?", opts: ["Gaming", "History of Computing", "Robots"], ans: "History of Computing", time: 10 },
            { id: 2, type: "Identifying Key Details", text: "Which device is mentioned?", opts: ["iPhone", "Abacus", "Tesla"], ans: "Abacus", time: 15 }
        ]
    },
    { 
        id: 2, title: "Nature", desc: "Animal Sounds", color: '#4caf50',
        // Reliable Nature Audio
        audio: "https://www.w3schools.com/html/horse.mp3", 
        questions: [
            { id: 1, type: "Identifying Key Details", text: "Identify the animal.", opts: ["Cow", "Horse", "Sheep"], ans: "Horse", time: 10 },
            { id: 2, type: "Comprehension Accuracy", text: "Where does it live?", opts: ["Ocean", "Farm", "Space"], ans: "Farm", time: 10 }
        ]
    }
  ];

  const handleComplete = (answers) => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    let correct = 0;
    let mistakes = [];
    
    // 1. Initialize ONLY the criteria present in this specific topic
    let criteria = {};
    selectedTopic.questions.forEach(q => criteria[q.type] = 0);

    // 2. Score Calculation
    selectedTopic.questions.forEach(q => {
        if(answers[q.id] === q.ans) {
            correct++;
            criteria[q.type] = 100;
        } else {
            // FIX: Don't show blank corrections
            mistakes.push({ 
                type: q.type, 
                question: q.text, 
                userAnswer: answers[q.id] || "No Answer", 
                correctAnswer: q.ans 
            });
        }
    });

    const score = Math.round((correct/selectedTopic.questions.length)*100);

    setReport({
        score,
        title: "Listening Assessment",
        metrics: [
            { label: "Time Taken", value: `${totalTime}s` },
            { label: "Replays", value: playCount },
            { label: "Accuracy", value: `${score}%` }
        ],
        criteria, // Only passes relevant criteria
        mistakes,
        recommendations: [playCount > 1 ? "Avoid replaying audio." : "Good listening focus.", score < 100 ? "Pay attention to details." : "Excellent."]
    });
    setPhase('report');
  };

  if(phase === 'topic') return <TopicSelection title="Listening" topics={topics} onSelect={(t)=>{setSelectedTopic(t); setPhase('listen'); setStartTime(Date.now());}} onBack={()=>window.location.href='/'} />;

  if(phase === 'listen') return (
    <div style={{textAlign:'center', padding:'40px', fontFamily:'Arial'}}>
        <h2>🎧 {selectedTopic.title}</h2>
        <div style={{background:'#eceff1', padding:'30px', borderRadius:'15px', maxWidth:'600px', margin:'20px auto', border:'1px solid #ccc'}}>
            <p style={{fontWeight:'bold', color:'#37474f'}}>🔊 Audio Track:</p>
            {/* Standard HTML5 Audio - Works everywhere */}
            <audio controls style={{width:'100%'}} onPlay={() => setPlayCount(p => p + 1)}>
                <source src={selectedTopic.audio} />
                Your browser does not support the audio element.
            </audio>
        </div>
        <button onClick={()=>setPhase('quiz')} style={{padding:'15px 40px', background:'#2980b9', color:'white', border:'none', borderRadius:'30px', fontSize:'18px', cursor:'pointer'}}>Start Quiz</button>
    </div>
  );

  if(phase === 'quiz') return <SmartQuiz questions={selectedTopic.questions} onComplete={handleComplete} />;

  return <DetailedReport {...report} onRetry={()=>window.location.reload()} onHome={()=>window.location.href='/'} />;
};

export default ListeningTest;