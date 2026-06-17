import express from 'express';
import prisma from '../prismaClient.js';
import { compileFunction } from 'vm';

const router = express.Router();

// Get all todos for logged-in user
router.get('/', async (request, response) => {
  const todos = await prisma.todo.findMany({
    where: {
      userId: request.userId
    }
  });

  response.json(todos);
});

// Create a new todo
router.post('/', async (request, response) => {
  const { task } = request.body;

  const todo = await prisma.todo.create({
    data: {
      task,
      userId: request.userId
    }
  });

  response.json(todo);
});

// Update a todo
router.put('/:id', async (request, response) => {
  const { completed } = request.body;
  const { id } = request.params;
  // const { urlParam } = request.query; // get url params

  const updatedTodo = await prisma.todo.update({
    where: {
      id: parseInt(id),
      userId: request.userId
    },
    data: {
      completed: !!completed // !! - converts to boolean
    }
  })

  response.json(updatedTodo);
});

// Delete a todo
router.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const { userId } = request

  await prisma.todo.delete({
    where: {
      id: parseInt(id),
      userId: userId
    }
  });

  response.send({ message: "Todo deleted"} );
});

export default router;
