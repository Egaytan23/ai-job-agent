import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
const = 
function App() {
  //state variables below
  const [jobDescription, setJobDescription] = useState("") //whatever the user typed setJobDescription = to the thing that updates it
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  async function handleAnalyze() {
    setLoading(true);

    const response = await fetch("https://ai-job-agent-lbgs.onrender.com/analyze", {
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
    setLoading(false);
  }

  async function fetchHistory() {
    const response = await fetch("https://ai-job-agent-lbgs.onrender.com/analyses");
    const data = await response.json();

    console.log(data);

    setHistory(data.analyses);
  }

  async function deleteAnalysis(id) {
    await fetch(`https://ai-job-agent-lbgs.onrender.com/analyses/${id}`, {
      method: "DELETE"
    });

    fetchHistory();
  }
  function getRecommendationColor(recommendation) {
    if (recommendation === "APPLY") return "green";
    if (recommendation === "CONSIDER") return "orange";
    return "red";
  }
  //everything in return gets drawn on the screen
  return (
    <div className="container">

      <h2>AI Job Agent</h2>

      <textarea
        placeholder="Paste job description here..."
        rows="10"
        cols="60"
        value={jobDescription} //show whatever is inside jobDescription
        onChange={(event) => setJobDescription(event.target.value)} //everytime the user types, update jobDescription
      ></textarea>
      <p>{jobDescription}</p>
      <button
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      <button onClick={fetchHistory}>
        Load History
      </button>
      {history.length > 0 && (
        <>
          <h2>History</h2>

          {history.map((item) => (
            <div key={item.id} className="history-card">
              <h3>Analysis #{item.id}</h3>

              <p>
                <strong>Score:</strong> {item.match_score}
              </p>

              <p>
                <strong>Recommendation:</strong> {item.recommendation}
              </p>

              <p>
                <strong>Reasoning:</strong> {item.reasoning}
              </p>
              <button onClick={() => deleteAnalysis(item.id)}>
                Delete
              </button>
              <hr />
            </div>
          ))}
        </>
      )}

      {loading && <p>Analyzing...</p>}
      {analysis && ( //mean if analysis exists show results else show nothing 
        <div className="results-card">
          <h2>Results</h2>

          <p>
            <strong>Match Score:</strong>{" "}
            {analysis.analysis.matchScore}
          </p>

          <p>
            <strong>Recommendation:</strong>

            <span
              style={{
                color: getRecommendationColor(
                  analysis.analysis.recommendation
                )
              }}
            >
              {analysis.analysis.recommendation}
            </span>
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

    </div>
  )
}

export default App

//cd ai-job-agent-frontend
//npm run dev 
//line 70 is a ternary operator 