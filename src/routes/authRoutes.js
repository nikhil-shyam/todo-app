import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

// Register a new user endpoint /auth/register
router.post('/register', (request, response) => {
  const { username, password } = request.body;

  // encrypt password
  const hashedPassword = bcrypt.hashSync(password, 8);

  // save the new user and hashed password to the db
  try {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password)
      VALUES (?, ?)
    `);
    const result = insertUser.run(username, hashedPassword);

    // add a users first todo for them
    const defaultTodo = 'Hello! Add you first todo!';
    const insertTodo = db.prepare(`
      INSERT INTO todos (user_id, task)
      VALUES (?, ?)
    `);
    insertTodo.run(result.lastInsertRowid, defaultTodo);

    // create a token
    const token = jwt.sign({
      id: result.lastInsertRowid
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    response.json({ token });
  } catch (error) {
    console.log(error.message);
    response.sendStatus(503);
  }
});

router.post('/login', (request, response) => {
  const { username, password } = request.body;

  try {
    const getUser = db.prepare(`
      SELECT * FROM users WHERE username = ?
    `);
    const user = getUser.get(username);

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
