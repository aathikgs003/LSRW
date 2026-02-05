import React from 'react';

const TopicSelection = ({ title, topics, onSelect, onBack }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', textAlign: 'center', fontFamily: 'Arial' }}>
      <button onClick={onBack} style={{float:'left', border:'none', background:'none', fontSize:'20px', cursor:'pointer'}}>← Back</button>
      <h2 style={{ color: '#333', clear:'both' }}>Select a {title} Topic</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {topics.map((t) => (
          <div key={t.id} style={cardStyle}>
            <div style={{height:'120px', background: t.color || '#ddd', borderRadius:'10px 10px 0 0'}}></div>
            <div style={{padding:'20px'}}>
                <h3 style={{margin:'0 0 10px 0'}}>{t.title}</h3>
                <p style={{fontSize:'13px', color:'#666', height:'40px'}}>{t.desc}</p>
                <button onClick={() => onSelect(t)} style={btnStyle}>Start</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const cardStyle = { background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' };
const btnStyle = { width: '100%', padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' };

export default TopicSelection;