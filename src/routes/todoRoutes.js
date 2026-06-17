import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all todos for logged-in user
router.get('/', (request, response) => {
  const getTodos = db.prepare(`
    SELECT * FROM todos WHERE user_id = ?
  `);
  const todos = getTodos.all(request.userId);

  response.json(todos);
});

// Create a new todo
router.post('/', (request, response) => {

});

// Update a todo
router.put('/:id', (request, response) => {

});

// Delete a tod
router.delete('/:id', (request, response) => {

});

export default router;
