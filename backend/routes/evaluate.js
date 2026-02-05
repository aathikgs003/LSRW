const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// The full URL will be: /api/evaluate/assess-speaking
router.post('/assess-speaking', upload.single('audio'), (req, res) => {
    console.log("Received Audio. Processing..."); // debug log

    let audioPath = path.resolve(req.file.path);

    // Rename file to include extension (helps pydub/ffmpeg identify format)
    if (req.file.originalname) {
        const ext = path.extname(req.file.originalname);
        if (ext) {
            const newPath = audioPath + ext;
            fs.renameSync(audioPath, newPath);
            audioPath = newPath;
        }
    }

    const pythonScript = path.resolve(__dirname, '../../ai-engine/full_assessment.py');

    const pythonProcess = spawn('python', [pythonScript, audioPath]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error("Python Error:", data.toString());
    });

    pythonProcess.on('close', (code) => {
        fs.unlinkSync(audioPath); // Cleanup

        try {
            const result = JSON.parse(dataString);
            console.log("Analysis Success:", result); // debug log
            res.json(result);
        } catch (e) {
            console.error("JSON Parse Fail:", dataString);
            res.status(500).json({ error: "Analysis failed", raw: dataString });
        }
    });
});

module.exports = router;