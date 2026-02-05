const express = require('express');
const cors = require('cors');
const fs = require('fs');
const evaluateRoute = require('./routes/evaluate');
const writingRoute = require('./routes/writing');

const app = express();

// Allow Frontend to communicate
app.use(cors());
app.use(express.json());

// Create uploads folder if missing
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

// REGISTER ROUTES
// This creates the URL: http://localhost:5000/api/evaluate/...
app.use('/api/evaluate', evaluateRoute);
app.use('/api/writing', writingRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));