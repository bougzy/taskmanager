const Task = require('../models/Task');
const nodemailer = require('nodemailer'); // For email notifications
const redis = require('redis');

// Initialize Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.error('Redis error:', err));

// Filter and Fetch Tasks
exports.getTasks = async (req, res) => {
  const { status, priority, tags, page = 1, limit = 20 } = req.query;
  const query = {};
  const cacheKey = `tasks:${JSON.stringify(req.query)}`;

  // Build query filters
  if (status) query.completed = status === 'completed';
  if (priority) query.priority = priority;
  if (tags) query.tags = { $all: tags.split(',') }; // Match all tags

  try {
    // Check Redis cache
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Fetch tasks from DB
      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      const totalTasks = await Task.countDocuments(query);

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
      redisClient.setex(cacheKey, 3600, JSON.stringify(response)); // Cache for 1 hour
      res.status(200).json(response);
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tasks' });
  }
};

// Share Task with Other Users
exports.shareTask = async (req, res) => {
  const { taskId, emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ success: false, message: 'Emails are required' });
  }

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Update the task with shared emails
    task.sharedWith.push(...emails);
    await task.save();

    // Send email notifications (optional)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails,
      subject: 'Task Shared With You',
      text: `A task titled "${task.title}" has been shared with you.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending emails:', err);
      } else {
        console.log('Emails sent:', info.response);
      }
    });

    res.status(200).json({ success: true, message: 'Task shared successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
