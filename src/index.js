const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []

function verifyIfExistsUserAccount(req, res, next) {
  const { username } = req.headers

  const user = users.find((user) => user.username === username)

  if(!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  req.user = user

  return next()
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists) {
    return res.status(400).json({ error: "User already exists!" })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user)

  return res.status(201).json(user)
})

app.get('/todos', verifyIfExistsUserAccount, (req, res) => {
  const { user } = req
  return res.json(user.todos)
})

app.post('/todos', verifyIfExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body

  const { user } = req

  const todo = {
    id: uuidv4(), 
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return res.status(201).json(todo)
})

app.put('/todos/:id', verifyIfExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body
  const { user } = req

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  user.todos[todoIndex].title = title
  user.todos[todoIndex].deadline = deadline

  return res.status(200).json(user.todos[todoIndex])
})

app.patch('/todos/:id/done', verifyIfExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  user.todos[todoIndex].done = true

  return res.status(200).json(user.todos[todoIndex])
})

app.delete("/todos/:id", verifyIfExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return res.status(404).json({ error: 'Todo Not Found' });
  }

  user.todos.splice(todoIndex, 1);

  return res.status(204).send();

});

module.exports = app;