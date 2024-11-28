import express from 'express';
import mysql from 'mysql2/promise';
import {config} from "dotenv"
config()

// Initialize Express app
const app = express();
app.use(express.json()); // To parse JSON requests

// Function to calculate the distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

// MySQL connection setup using async/await
const db = await mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.DATABASE_NAME
});

app.get("/", async (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Endpoints</title>
    </head>
    <body>
      <h1>Welcome to the School Management API</h1>
      <p>Use the following endpoints to interact with the API:</p>
      <ul>
        <li><strong>Add School:</strong> <code>POST /addSchool</code></li>
        <li><strong>List Schools:</strong> <code>GET /listSchools?latitude=&longitude=</code></li>
      </ul>
      <p>Refer to the API documentation for more details on how to use these endpoints.</p>
    </body>
    </html>`)
})

// Set up a route to add a school
app.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate input data
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Insert school data into the database
    const [result] = await db.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)', 
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully', schoolId: result.insertId });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set up a route to list schools sorted by proximity
app.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    // Query all schools from the database
    const [schools] = await db.execute('SELECT * FROM schools');

    // Sort schools by proximity to the user's location
    const sortedSchools = schools.map(school => ({
      ...school,
      distance: calculateDistance(latitude, longitude, school.latitude, school.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.status(200).json(sortedSchools);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
