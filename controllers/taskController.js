const Task = require('../models/Task');
const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.error('Redis error:', err));

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get tasks with pagination and caching
exports.getTasks = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const cacheKey = `tasks:${page}:${limit}`;

  try {
    // Check Redis cache
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Fetch tasks from DB
      const tasks = await Task.find()
        .sort({ createdAt: -1 }) // Sort by latest tasks
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const totalTasks = await Task.countDocuments();

      const response = {
        success: true,
        data: tasks,
        pagination: {
          totalTasks,
          currentPage: Number(page),
          totalPages: Math.ceil(totalTasks / limit),
        },
      };

      // Cache the response
      redisClient.setex(cacheKey, 3600, JSON.stringify(response)); 
      res.status(200).json(response);
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tasks' });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching task' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting task' });
  }
};
