import { useState } from 'react';
import UploadForm from './components/UploadForm';
import ResultsViewer from './components/ResultsViewer';

function App() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadStart = () => {
    setIsLoading(true);
    setResults(null);
  };

  const handleUploadSuccess = (data) => {
    setIsLoading(false);
    setResults(data);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>MedicalSight AI</h1>
        <p>Deep Learning Medical Image Diagnosis & CNN Interpretability</p>
      </header>
      
      <main className="main-content">
        <UploadForm 
          onUploadStart={handleUploadStart} 
          onUploadSuccess={handleUploadSuccess} 
        />
        <ResultsViewer 
          results={results} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
}

export default App;
