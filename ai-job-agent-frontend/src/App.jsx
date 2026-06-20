import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  //state variables below
  const [jobDescription, setJobDescription] = useState("") //whatever the user typed setJobDescription = to the thing that updates it
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  async function handleAnalyze() {
    setLoading(true);
    const response = await fetch("http://localhost:3000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobDescription: jobDescription
      })
    });

    async function fetchHistory() {
      const response = await fetch("http://localhost:3000/analyses");
      const data = await response.json();

      console.log(data);

      setHistory(data.analyses);
    }
    const data = await response.json();

    console.log(data);

    setAnalysis(data);
    setLoading(false);
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
      <button onClick={fetchHistory}>
        Load History
      </button>
      {loading && <p>Analyzing...</p>}
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

          <h3>Strengths</h3>

          <ul>
            {analysis.analysis.strengths.map((strength) => ( //map is basically a loop
              <li>{strength}</li>
            ))}
          </ul>

          <h3>Risks</h3>

          <ul>
            {analysis.analysis.risks.map((risk) => ( //map is basically a loop
              <li>{risk}</li>
            ))}
          </ul>
        </div>
      )}

    </>
  )
}

export default App
