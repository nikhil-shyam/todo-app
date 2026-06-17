import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

// Register a new user endpoint /auth/register
router.post('/register', async (request, response) => {
  const { username, password } = request.body;

  // encrypt password
  const hashedPassword = bcrypt.hashSync(password, 8);

  // save the new user and hashed password to the db
  try {
    const user = await prisma.user.create({
      data: {
        username: username,
        password: hashedPassword
      }
    });

    // add a users first todo for them
    const defaultTodo = 'Hello! Add you first todo!';
    await prisma.todo.create({
      data: {
        task: defaultTodo,
        userId: user.id
      }
    })

    // create a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    response.json({ token });
  } catch (error) {
    console.log(error.message);
    response.sendStatus(503);
  }
});

router.post('/login', async (request, response) => {
  const { username, password } = request.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username
      }
    });

    // if we can't find a user associated with that username
    if (!user) return response.status(404).send({ message: "User not found" });

    // if password doesn't match
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return response.status(401).send({ message: "Invalid password" });

    // then we have a successful auth
    const token = jwt.sign({
      id: user.id
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    response.json({ token });
  } catch (error) {
    console.log(error.message);
    response.sendStatus(503);
  }
});

export default router;
