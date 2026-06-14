import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  //state variables below
  const [jobDescription, setJobDescription] = useState("") //whatever the user typed setJobDescription = to the thing that updates it
  const [analysis, setAnalysis] = useState(null)

  async function handleAnalyze() {
    const response = await fetch("http://localhost:3000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobDescription: jobDescription
      })
    });

    const data = await response.json();

    console.log(data);

    setAnalysis(data);
  }
  //everything in return gets drawn on the screen
  return (
    <>

      <h2>AI Job Agent</h2>

      <textarea
        placeholder="Paste job description here..."
        rows="10"
        cols="60"
        value={jobDescription} //show whatever is inside jobDescription
        onChange={(event) => setJobDescription(event.target.value)} //everytime the user types, update jobDescription
      ></textarea>
      <p>{jobDescription}</p>
      <button onClick={handleAnalyze}>
        Analyze
      </button>
      {analysis && ( //mean if analysis exists show results else show nothing 
        <div>
          <h2>Results</h2>

          <p>
            <strong>Match Score:</strong>{" "}
            {analysis.analysis.matchScore}
          </p>

          <p>
            <strong>Recommendation:</strong>{" "}
            {analysis.analysis.recommendation}
          </p>

          <p>
            <strong>Reasoning:</strong>{" "}
            {analysis.analysis.reasoning}
          </p>
        </div>
      )}
    </>
  )
}

export default App
