const express = require('express');
const app = express();

// Define your routes
app.get('/api/data', (_req, res) => {
    // Handle database queries or other logic
    res.json({ message: 'Data from server' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
