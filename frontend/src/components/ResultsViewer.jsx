import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const ResultsViewer = ({ results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="loading-spinner"></div>
        <h3 style={{ fontSize: '1.25rem' }}>Analyzing Scan...</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Running inference with CNN model
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
        <Activity size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Awaiting Scan</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Upload a medical image to see AI classification and Grad-CAM diagnosis explanation.
        </p>
      </div>
    );
  }

  if (results.error) {
    return (
      <div className="glass-card" style={{ borderColor: 'var(--error)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', marginBottom: '1rem' }}>
          <AlertTriangle />
          <h3 style={{ fontSize: '1.25rem' }}>Analysis Failed</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Could not communicate with the diagnosis backend. Ensure the server is running.
        </p>
      </div>
    );
  }

  const isNormal = results.prediction === 'Normal';

  return (
    <div className="glass-card" style={{ animation: 'fadeInDown 0.5s ease-out' }}>
      <div className="results-header">
        {isNormal ? <ShieldCheck color="var(--success)" /> : <Activity color="var(--error)" />}
        Diagnosis Results
      </div>
      
      <div className="prediction-highlight" style={{
        borderColor: isNormal ? 'var(--success)' : 'var(--error)',
        background: isNormal ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: isNormal ? 'var(--success)' : 'var(--error)'
      }}>
        Primary Finding: {results.prediction}
        <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.25rem', opacity: 0.9 }}>
          Confidence: {(results.confidence * 100).toFixed(1)}%
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        Class Probabilities
      </h3>
      
      {Object.entries(results.probabilities).sort((a,b) => b[1] - a[1]).map(([className, prob]) => (
        <div key={className}>
          <div className="stat-item">
            <span style={{ color: 'var(--text-primary)' }}>{className}</span>
            <span className="stat-value">{(prob * 100).toFixed(1)}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${prob * 100}%`,
                backgroundColor: className === 'Normal' ? 'var(--success)' : 
                               (prob > 0.5 ? 'var(--error)' : 'var(--accent-color)')
              }}
            ></div>
          </div>
        </div>
      ))}
      
      {results.heatmap && (
        <div className="heatmap-container">
          <h3>Grad-CAM Attention Map</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Highlighted areas indicate regions the model focused on for this prediction.
          </p>
          <img src={results.heatmap} alt="Grad-CAM Heatmap" className="heatmap-image" />
        </div>
      )}
    </div>
  );
};

export default ResultsViewer;
