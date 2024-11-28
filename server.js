import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const { Pool } = pkg

// Connect to Supabase Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Add School API
app.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Input validation
  if (!name || !address || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully', school: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding school' });
  }
});

// List Schools API
app.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const { rows: schools } = await pool.query('SELECT * FROM schools');
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Calculate distances and sort
    const sortedSchools = schools
      .map((school) => {
        const distance = calculateDistance(userLat, userLon, school.latitude, school.longitude);
        return { ...school, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({ schools: sortedSchools });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching schools' });
  }
});

// Helper Function: Haversine Formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
