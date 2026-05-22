const express = require("express"); //imports express so we can use it
const OpenAI = require("openai"); //imports openai so we can use it
require("dotenv").config(); //load variables from .env into the application
const app = express(); //creates the backend application/ creates server application
//creates a connection object to openai (think "this object knows how to talk to AI models")
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY //Go grab the API key from my environment variables NOT from the code
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

        const aiResponse = JSON.parse(
    completion.choices[0].message.content
);

        res.json({
            success: true,
            analysis: aiResponse
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            error: "AI request failed"
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