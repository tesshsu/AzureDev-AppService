const express = require('express');
     const path = require('path');
     const app = express();

     // Serve static files from the public directory
     app.use(express.static(path.join(__dirname, 'public')));

     // API route
     app.get('/api/hello', (req, res) => {
         res.json({ message: 'Hello from the API!' });
     });

     // Start the server
     const PORT = process.env.PORT || 3000;
     app.listen(PORT, () => {
         console.log(`Server running on port ${PORT}`);
     });