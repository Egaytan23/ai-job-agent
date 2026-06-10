const { Pool } = require("pg"); //imports POSTGRESPQL
const express = require("express"); //imports express so we can use it
const OpenAI = require("openai"); //imports openai so we can use it
require("dotenv").config(); //load variables from .env into the application
const app = express(); //creates the backend application/ creates server application

//creates a connection object to openai (think "this object knows how to talk to AI models")
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY //Go grab the API key from my environment variables NOT from the code
});
//creates a postgreSQL connection pool ie "my backend's connection to the database"
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

//Test DB connection, When the server starts backend attempts DB connection, princes sucess or failure
//Test early to make sure the app doesnt break GOOD PRACTICE 
pool.connect() //pretty much asks PostgreSQL can my backend sucessfully connect to you
    .then(() => {
        console.log("Connected to PostgreSQL");
    })
    .catch((err) => {
        console.log("Database connection error", err);
    });

app.use(express.json()); //this is used to the server can read incoming JSON w/o it cant read it properly, if JSON data comes then read it automatically

const PORT = 3000;


// TEST ROUTE
//get mean "I want data"
app.get("/", (req, res) => { //a URL path that the backend listens for. "/" means homepage/root route aka http://localhost:3000/
    res.json({ //structured JSON data over plain text
        message: "AI Job Agent API Running",
        status: "success"
    });
});

//app.post = listen for POST requests at /analyze
//async and await handle asynchronous operations meaning operations take time ie ai requests take time so Node waits for the response 
app.post("/analyze", async (req, res) => {

    const jobDescription = req.body.jobDescription; //Gets incoming job description

    if (!jobDescription) {
        return res.status(400).json({ //the 400 means bad request
            sucess: false,
            error: "Job description is required"
        });
    }

    try {

        const completion = await openai.chat.completions.create({ //job description gets sent here, next ai generates a response, this is also where the pause is excuded 
            model: "gpt-4.1-mini",
            response_format: { type: "json_object" }, //tells the API that the response MUST be a JSON object
            messages: [

                {
                    role: "system", //rules for the AI from line 38 to 59. line 43 is critical since it makes the output structed no intro text or markdown formatting
                    //line 55 is making the ai forceably explain why score was given
                    //content is us talking to the AI Model 
                    content: `
            Return ONLY a valid JSON object.
            
            Required format:

        {

        "matchScore": number,
        "reasoning": "string",
        "strengths": ["string"],
        "risks": ["string"],
        "recommendation": "APPLY | CONSIDER | SKIP"
        "Good bye": ["string"],
        }

        Rules:
        - No markdown
        - No explanations outside JSON
        - No bullet points outside arrays
        - No intro text
        - No formatting symbols
        - Output must start with {
        - Output must end with }
        `
                },

                {
                    role: "user",
                    content: `
    Analyze this job description and return the required JSON object.

    Job Description:
    ${jobDescription}
    `
                }

            ]
        });

        const aiResponse = JSON.parse( //JSON.parse makes the ai json txt into acutal javascript object
            completion.choices[0].message.content
        );
        console.log(aiResponse);
        console.log(aiResponse.matchScore);
        console.log(aiResponse.recommendation);

        //Sends SQL into PostgreSQL
        //Insert Into - adds a new row into this table 
        const result = await pool.query(

            `INSERT INTO job_analyses
    (job_description, match_score, reasoning, recommendation)

    VALUES ($1, $2, $3, $4)

    RETURNING *`,

            [
                jobDescription,
                aiResponse.matchScore,
                aiResponse.reasoning,
                aiResponse.recommendation
            ]

        );

        //SELECT gets existing rows and RETURNING returns the row that was just inserted or updated
        res.json({
            success: true,
            id: result.rows[0].id,
            analysis: aiResponse
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({ //the 500 means server error
            success: false,
            error: "AI request failed"
        });

    }

});
//app.get(analyses) creates a new endpoint, backend listens for GET http://localhost:3000/analyses
app.get("/analyses", async (req, res) => {
    try {
        const result = await pool.query( //send SQL to PostgreSQL (which is this below)
            "SELECT * FROM job_analyses ORDER BY created_at DESC" //Select * = Get all columms, FROM job_analyses = get rows from this table, ORDER By created_at DESC = show newest analyses first
        );
        res.json({
            success: true,
            analyses: result.rows //contains all rows returned from PostgreSQL
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch analyses"
        });
    }
});

app.get("/analyses/:id", async (req, res) => { //listens for number after /analyses/
    const id = req.params.id; //this line will become 1 or whatever number row we need which will give us that rows info
    //req.body = data sent inside the request and req.params = data sent through the URL
    try {

        const result = await pool.query(
            "SELECT * FROM job_analyses WHERE id = $1", //give me ONLY the row whose id matches
            [id] //place holder 
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Analysis not found"
            });
        }
        res.json({
            success: true,
            analysis: result.rows[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch analysis"
        });
    }
});

//this will let us delete rows based on ids
app.delete("/analyses/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await pool.query(
            "DELETE FROM job_analyses WHERE id = $1", //Go into the job_analyses table and remove the row whose id matches similar to line 167
            [id]
        );
        res.json({
            success: true,
            message: `Analysis ${id} deleted`
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            sucess: false,
            error: "Failed to delete analysis"
        });
    }
});

app.put("/analyses/:id", async (req, res) => {
    const id = req.params.id
    const recommendation = req.body.recommendation

    if (!recommendation) {
        return res.status(400).json({
            sucess: false,
            error: "Recommendation is required"
        });
    }
    try {
        await pool.query( //update means modify an existing row
            `UPDATE job_analyses 
            SET recommendation = $1
            WHERE id = $2`, //SET means change this column so here replace the recommendation value, WHERE mean which row
            [recommendation, id]
        );
        res.json({
            success: true,
            message: `Analysis ${id} updated`
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            error: "Failed to update analysis"
        });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//node server.js reads the server.js from top to bottom
//req (request) contains incoming data, URL info, headers, and body
///res (response) How the server talks back ie the message it sends on line 11
//NEVER HARDCODE THE KEY
//Inside content we are talking TO the AI model thats why its in plain english
//content is the only way to talk to the AI
//backend needs some way to send SQL queries/reveive results thats why we use pool line 23
// pool = connection manager
//when using pool.query() PostgreSQL returns a RESULT OBJECT inside it .rows contains acutal database rows
//backticks ` insert a variable into a string
//GET = read
//POST = create
//PUT = update
//DELETE = delete
//PostgreSQL = actual database
//pgadmin = tool used to look at PostgreSQL