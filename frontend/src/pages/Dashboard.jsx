import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const modules = [
    { title: "Listening", desc: "Technical & General", color: "#3498db", icon: "🎧", link: "/listening" },
    { title: "Speaking", desc: "Fluency & Pronunciation", color: "#e74c3c", icon: "🎙️", link: "/test/1" },
    { title: "Reading", desc: "Speed & Comprehension", color: "#f1c40f", icon: "📖", link: "/reading" },
    { title: "Writing", desc: "Grammar & Relevance", color: "#2ecc71", icon: "✍️", link: "/writing" },
  ];

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', textAlign: 'center', background:'#f4f6f8', minHeight:'100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '40px' }}>LSRW Placement Assessment</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        {modules.map((m) => (
          <Link to={m.link} key={m.title} style={{ textDecoration: 'none' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>{m.icon}</div>
              <h2 style={{ color: m.color, margin: '0 0 10px 0' }}>{m.title}</h2>
              <p style={{ color: '#7f8c8d' }}>{m.desc}</p>
              <button style={{...btnStyle, background: m.color}}>Start Module</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const cardStyle = { background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' };
const btnStyle = { padding: '10px 25px', color: 'white', border: 'none', borderRadius: '25px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer' };

export default Dashboard;