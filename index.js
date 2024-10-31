const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to my Task Manager App!');
});

app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
