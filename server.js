const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// Catch all other routes and serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
