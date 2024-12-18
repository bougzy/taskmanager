const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  shareTask,
} = require('../controllers/taskController');
const { check } = require('express-validator');

const router = express.Router();

router.post(
  '/',
  [check('title', 'Task title is required').notEmpty()],
  createTask
);
router.get('/', getTasks); 
router.get('/:id', getTaskById);
router.put(
  '/:id',
  [check('title', 'Task title is required').optional().notEmpty()],
  updateTask
);
router.delete('/:id', deleteTask);
router.post('/share', shareTask); 

module.exports = router;
