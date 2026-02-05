import React, { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import TopicSelection from '../components/TopicSelection';
import DetailedReport from '../components/DetailedReport';

const TestInterface = () => {
    const [phase, setPhase] = useState('topic');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    // Helper for zero report
    const createZeroReport = (errorMsg) => ({
        score: 0,
        title: "Speaking Assessment",
        transcript: "",
        metrics: [
            { label: "WPM", value: 0 },
            { label: "Fluency", value: "0/10" },
            { label: "Vocab", value: "0/10" }
        ],
        criteria: {
            "Pronunciation": 0, "Fluency": 0, "Grammar": 0, "Vocabulary": 0, "Confidence": 0, "Relevance": 0
        },
        mistakes: [],
        recommendations: [`⚠️ ${errorMsg}`, "Please make sure your microphone is working and speak clearly."]
    });

    const onStop = async (url, blob) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('audio', blob, 'test.wav');

        try {
            const res = await fetch('http://localhost:5000/api/evaluate/assess-speaking', { method: 'POST', body: formData });

            if (!res.ok) throw new Error(`Server responded with ${res.status}`);

            const data = await res.json();

            // Handle errors or missing metrics
            if (data.error && !data.metrics) {
                // Determine if it is a "no speech" error vs a system error
                const isNoSpeech = data.error.includes("No speech") || data.error.includes("Could not understand");

                if (isNoSpeech) {
                    setReport(createZeroReport(data.error));
                    setPhase('report');
                } else {
                    alert("System Error: " + data.error);
                }
                setLoading(false);
                return;
            }

            // Map Analysis to 7 Speaking Criteria (Safely)
            const metrics = data.metrics || {};
            const fluency = (metrics.fluency || 0) * 10;
            const pronunciation = (metrics.pronunciation || 0) * 10;
            const vocab = (metrics.vocabulary || 0) * 10;
            const grammar = (metrics.grammar || 0) * 10;

            setReport({
                score: Math.round((data.overall_score || 0) * 10),
                title: "Speaking Assessment",
                transcript: data.transcription || "",
                metrics: [
                    { label: "WPM", value: data.wpm || 0 },
                    { label: "Fluency", value: `${metrics.fluency || 0}/10` },
                    { label: "Vocab", value: `${metrics.vocabulary || 0}/10` },
                    { label: "Fillers", value: metrics.filler_count || 0 }
                ],
                criteria: {
                    "Pronunciation": pronunciation,
                    "Fluency": fluency,
                    "Grammar": grammar,
                    "Vocabulary": vocab,
                    "Confidence": fluency > 70 ? 90 : 60,
                    "Relevance": data.overall_score > 6 ? 100 : 50
                },
                mistakes: data.mistakes || [],
                recommendations: [
                    `Speaking Rate: ${data.wpm || 0} words per minute.`,
                    fluency < 60 ? "Try to speak more continuously with fewer pauses." : "Good flow and pacing.",
                    (metrics.filler_count || 0) > 3 ? "Try to reduce filler words (um, ah) to sound more confident." : "Minimal filler words used. Great job!",
                    ...(data.mistakes?.length > 0 ? [`Found ${data.mistakes.length} grammar issues.`] : ["Grammar looks good!"])
                ]
            });
            setPhase('report');
        } catch (e) {
            console.error("Test Interface Error:", e);
            alert("An error occurred during analysis. Please check console.");
        }
        setLoading(false);
    };

    const { startRecording, stopRecording, status } = useReactMediaRecorder({
        audio: true,
        onStop: onStop
    });

    const topics = [
        { id: 1, title: "Self Introduction", desc: "Tell me about yourself.", color: '#9c27b0' },
        { id: 2, title: "Job Interview", desc: "Why should we hire you?", color: '#009688' }
    ];

    if (phase === 'topic') return <TopicSelection title="Speaking" topics={topics} onSelect={(t) => { setSelectedTopic(t); setPhase('record'); }} onBack={() => window.location.href = '/'} />;

    if (phase === 'record') return (
        <div style={{ maxWidth: '700px', margin: '40px auto', textAlign: 'center', fontFamily: 'Arial' }}>
            <h2>🗣 {selectedTopic.title}</h2>
            <p style={{ fontSize: '18px', color: '#555' }}>{selectedTopic.desc}</p>
            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', marginTop: '30px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                {loading ? (
                    <div>
                        <div className="spinner"></div>
                        <h3 style={{ marginTop: '20px' }}>Analyzing Speech & Grammar...</h3>
                        <p style={{ color: '#777' }}>Converting audio to text...</p>
                    </div>
                ) : (
                    <>
                        {/* Audio Wave Visualizer */}
                        {status === 'recording' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', height: '60px', marginBottom: '30px' }}>
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                                <style>{`
                                    .wave-bar {
                                        width: 8px;
                                        background: #4caf50;
                                        border-radius: 4px;
                                        animation: wave 1s ease-in-out infinite;
                                    }
                                    @keyframes wave {
                                        0%, 100% { height: 10px; opacity: 0.5; }
                                        50% { height: 50px; opacity: 1; }
                                    }
                                `}</style>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '20px' }}>
                            {status !== 'recording' ? (
                                <button onClick={startRecording} style={{ padding: '15px 40px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(33,150,243,0.3)', transition: 'all 0.2s' }}>
                                    🎙 Start Recording
                                </button>
                            ) : (
                                <button onClick={stopRecording} style={{ padding: '15px 40px', background: '#f44336', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(244,67,54,0.3)', animation: 'pulse 1.5s infinite' }}>
                                    ⏹ Stop Recording
                                </button>
                            )}
                        </div>

                        {status === 'recording' && <p style={{ color: '#f44336', marginTop: '20px', fontWeight: 'bold' }}>Recording... Speak now</p>}
                    </>
                )}
            </div>
        </div>
    );

    return <DetailedReport {...report} transcript={report.transcript} onRetry={() => window.location.reload()} onHome={() => window.location.href = '/'} />;
};

export default TestInterface;