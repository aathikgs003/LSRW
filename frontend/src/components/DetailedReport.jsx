import React from 'react';

const DetailedReport = ({ title, score, metrics, mistakes, criteria, recommendations, transcript, onRetry, onHome }) => {
  const isPass = score >= 60;

  return (
    <div style={styles.container}>
      <div style={styles.paper}>

        {/* HEADER */}
        <div style={{ ...styles.header, backgroundColor: isPass ? '#27ae60' : '#e74c3c' }}>
          <div>
            <h1 style={{ margin: 0, color: 'white', fontSize: '28px' }}>{title} Assessment</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '5px 0 0 0' }}>Performance Report</p>
          </div>
          <div style={styles.scoreBadge}>
            <span style={{ fontSize: '42px', fontWeight: 'bold' }}>{score}</span>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>/100</span>
          </div>
        </div>

        {/* METRICS */}
        <div style={styles.gridContainer}>
          {metrics.map((m, idx) => (
            <div key={idx} style={styles.metricCard}>
              <span style={styles.metricLabel}>{m.label}</span>
              <span style={styles.metricValue}>{m.value}</span>
            </div>
          ))}
        </div>

        <div style={styles.contentPadding}>

          {/* TRANSCRIPT SECTION */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🗣️ Your Recording Transcript</h3>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0', fontStyle: 'italic', color: '#555' }}>
              "{transcript || <span style={{ color: '#999' }}>No speech text available.</span>}"
            </div>
          </div>

          {/* PLACEMENT CRITERIA */}
          {criteria && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📊 Criteria Breakdown</h3>
              <div style={styles.criteriaBox}>
                {Object.entries(criteria).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#444' }}>
                      <span>{key}</span>
                      <span>{value}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{
                        ...styles.progressBarFill,
                        width: `${value}%`,
                        backgroundColor: value > 75 ? '#2ecc71' : value > 50 ? '#f1c40f' : '#e74c3c'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MISTAKES TABLE */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Correction Report</h3>
            {mistakes.length === 0 ? (
              <div style={styles.successBox}>✨ Outstanding! No errors detected.</div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                      <th style={styles.th}>Issue Context</th>
                      <th style={styles.th}>Your Answer / Input</th>
                      <th style={styles.th}>Correct / Suggestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mistakes.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={styles.td}>
                          <strong>{item.type}</strong><br />
                          <span style={{ fontSize: '12px', color: '#777' }}>{item.question}</span>
                        </td>
                        <td style={{ ...styles.td, color: '#c0392b', background: '#fff5f5', fontWeight: '500' }}>
                          {item.userAnswer}
                        </td>
                        <td style={{ ...styles.td, color: '#27ae60', background: '#f0fdf4', fontWeight: 'bold' }}>
                          {item.correctAnswer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RECOMMENDATIONS */}
          <div style={styles.section}>
            <div style={styles.recBox}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0d47a1' }}>💡 Action Plan</h3>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {recommendations.map((rec, i) => (
                  <li key={i} style={{ marginBottom: '8px', lineHeight: '1.6', color: '#333' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button onClick={onHome} style={styles.secondaryBtn}>Dashboard</button>
          <button onClick={onRetry} style={styles.primaryBtn}>Retry Module</button>
        </div>

      </div>
    </div>
  );
};

// Clean Professional Styles
const styles = {
  container: { padding: '40px 20px', background: '#f4f6f8', minHeight: '100vh', fontFamily: 'Arial, sans-serif' },
  paper: { maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' },
  header: { padding: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scoreBadge: { background: 'rgba(255,255,255,0.25)', padding: '10px 25px', borderRadius: '12px', color: 'white', textAlign: 'center' },
  gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', padding: '30px', borderBottom: '1px solid #f0f0f0', background: '#fff' },
  metricCard: { background: '#f8f9fa', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' },
  metricLabel: { display: 'block', fontSize: '12px', color: '#666', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 'bold' },
  metricValue: { fontSize: '24px', fontWeight: 'bold', color: '#333' },
  contentPadding: { padding: '30px' },
  section: { marginBottom: '40px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' },
  criteriaBox: { background: '#fff', border: '1px solid #eee', padding: '20px', borderRadius: '10px' },
  progressBarBg: { width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '4px' },
  successBox: { padding: '20px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '10px', border: '1px solid #c8e6c9', textAlign: 'center', fontWeight: 'bold' },
  tableContainer: { border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { padding: '15px', color: '#555', fontWeight: 'bold', borderBottom: '2px solid #eee' },
  td: { padding: '15px', verticalAlign: 'top', borderBottom: '1px solid #f9f9f9' },
  recBox: { background: '#e3f2fd', padding: '25px', borderRadius: '12px', borderLeft: '5px solid #2196f3' },
  footer: { padding: '25px', background: '#f8f9fa', display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid #eee' },
  primaryBtn: { padding: '12px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  secondaryBtn: { padding: '12px 30px', background: 'white', color: '#555', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default DetailedReport;