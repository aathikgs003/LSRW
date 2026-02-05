import React, { useState } from 'react';
import TopicSelection from '../components/TopicSelection';
import SmartQuiz from '../components/SmartQuiz';
import DetailedReport from '../components/DetailedReport';

const ReadingTest = () => {
  const [phase, setPhase] = useState('topic');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [report, setReport] = useState(null);
  const [readStartTime, setReadStartTime] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const topics = [
    { 
        id: 1, title: "Technical", desc: "Cloud Computing", color: '#3f51b5',
        passage: "Cloud computing provides on-demand computing resources over the internet. It offers three main models: IaaS, PaaS, and SaaS.",
        questions: [
            { id: 1, type: "Identifying Main Ideas", text: "What is the main function?", opts: ["Gaming", "On-demand resources", "Social Media"], ans: "On-demand resources", time: 15 },
            { id: 2, type: "Vocabulary Understanding", text: "What does 'SaaS' mean?", opts: ["Software as a Service", "System as a Service", "Speed as a Service"], ans: "Software as a Service", time: 15 }
        ]
    },
    { 
        id: 2, title: "Business", desc: "Strategy", color: '#009688',
        passage: "Blue Ocean Strategy involves creating new market space rather than competing. This makes the competition irrelevant.",
        questions: [
            { id: 1, type: "Comprehension Accuracy", text: "What is the goal?", opts: ["Fight competitors", "Create new market", "Lower prices"], ans: "Create new market", time: 15 },
            { id: 2, type: "Inference Ability", text: "What happens to rivals?", opts: ["Increases", "Becomes irrelevant", "Stays same"], ans: "Becomes irrelevant", time: 15 }
        ]
    }
  ];

  const startReading = () => {
    setPhase('read');
    setReadStartTime(Date.now());
  };

  const finishReading = () => {
    setReadTime((Date.now() - readStartTime) / 1000);
    setPhase('quiz');
  };

  const handleComplete = (answers) => {
    let correct = 0;
    let mistakes = [];
    
    // FIX: Initialize ONLY criteria relevant to this topic
    let criteria = {};
    selectedTopic.questions.forEach(q => criteria[q.type] = 0);

    selectedTopic.questions.forEach(q => {
        if(answers[q.id] === q.ans) {
            correct++;
            criteria[q.type] = 100;
        } else {
            mistakes.push({ type: q.type, question: q.text, userAnswer: answers[q.id] || "Skipped", correctAnswer: q.ans });
        }
    });

    const score = Math.round((correct/selectedTopic.questions.length)*100);
    const wpm = Math.round((selectedTopic.passage.split(' ').length / (readTime / 60)) || 0);

    setReport({
        score,
        metrics: [
            { label: "Reading Speed", value: `${wpm} WPM` },
            { label: "Reading Time", value: `${Math.round(readTime)}s` },
            { label: "Accuracy", value: `${score}%` }
        ],
        criteria, // Only shows tested criteria
        mistakes,
        recommendations: [wpm < 100 ? "Try to read faster." : "Good speed.", score < 100 ? "Review the answers below." : "Perfect comprehension."]
    });
    setPhase('report');
  };

  if(phase === 'topic') return <TopicSelection title="Reading" topics={topics} onSelect={(t)=>{setSelectedTopic(t); startReading()}} onBack={()=>window.location.href='/'} />;

  if(phase === 'read') return (
    <div style={{maxWidth:'800px', margin:'40px auto', padding:'20px', fontFamily:'Arial'}}>
        <div style={{padding:'30px', background:'white', borderRadius:'10px', fontSize:'18px', lineHeight:'1.8', borderLeft:'5px solid #3f51b5', marginBottom:'20px'}}>
            {selectedTopic.passage}
        </div>
        <button onClick={finishReading} style={{padding:'15px 30px', background:'#333', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontSize:'16px'}}>I have read it</button>
    </div>
  );

  if(phase === 'quiz') return <SmartQuiz questions={selectedTopic.questions} onComplete={handleComplete} />;

  return <DetailedReport title="Reading" {...report} onRetry={()=>window.location.reload()} onHome={()=>window.location.href='/'} />;
};

export default ReadingTest;