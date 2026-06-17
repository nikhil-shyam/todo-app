import express from 'express';
import db from '../db.js';
import { compileFunction } from 'vm';

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
  const { task } = request.body;
  const insertTodo = db.prepare(`
    INSERT INTO todos (user_id, task)
    VALUES (?, ?)
  `);
  const result = insertTodo.run(request.userId, task);

  response.json({
    id: result.lastInsertRowid,
    task,
    completed: 0
  });
});

// Update a todo
router.put('/:id', (request, response) => {
  console.log(request);
  const { completed } = request.body;
  const { id } = request.params;
  // const { urlParam } = request.query; // get url params

  const updatedTodo = db.prepare(`
    UPDATE todos SET completed = ?
    WHERE id = ?
  `);
  updatedTodo.run(completed, id);

  response.json({ message: "Todo completed" });
});

// Delete a todo
router.delete('/:id', (request, response) => {
  const { id } = request.params;
  const { userId } = request

  const deleteTodo = db.prepare(`
    DELETE FROM todos WHERE id = ? AND user_id = ?
  `);
  deleteTodo.run(id, userId);

  response.send({ message: "Todo deleted"} );
});

export default router;
