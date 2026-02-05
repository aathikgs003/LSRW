const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

router.post('/analyze', (req, res) => {
    const { text, topic } = req.body;

    // Path to the Python script
    const pythonScript = path.resolve(__dirname, '../../ai-engine/writing_analysis.py');
    
    // Spawn Python Process (NO arguments passed here anymore)
    const pythonProcess = spawn('python', [pythonScript]);

    let dataString = '';
    let errorString = '';

    // 1. SEND DATA TO PYTHON (The "Handshake")
    // We send the text and topic as a JSON object
    const inputData = JSON.stringify({ text, topic });
    
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end(); // CRITICAL: Tells Python "I am done sending data"

    // 2. LISTEN FOR DATA FROM PYTHON
    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    // 3. LISTEN FOR ERRORS
    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error("Python Error Log:", data.toString());
    });

    // 4. ON COMPLETE
    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error("Process ended with error code:", code);
            return res.status(500).json({ error: "Analysis Failed", details: errorString });
        }

        try {
            const result = JSON.parse(dataString);
            res.json(result);
        } catch (e) {
            console.error("Failed to parse JSON:", dataString);
            res.status(500).json({ error: "Invalid Response from AI", details: dataString });
        }
    });
});

module.exports = router;