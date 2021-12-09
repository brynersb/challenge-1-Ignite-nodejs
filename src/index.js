const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findedUser = users.find(user => user.username === username);

  if (!findedUser) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = findedUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const useralreadyExist = users.some(
    (user) => user.username === username
  );

  if (useralreadyExist) {
    return response.status(400).json({ error: " User already existis!!! " })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body;
  const { user } = request;

  const todos = user.todos;
  const foundTodo = todos.find(m => m.id == id);

  if (!foundTodo) {
    return response.status(404).send({ error: 'todo not found' });
  }

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.send(foundTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request;

  const todos = user.todos;
  const foundTodo = todos.find(m => m.id == id);

  if (!foundTodo) {
    return response.status(404).send({ error: 'todo not found' });
  } 

  foundTodo.done = true;

  return response.status(201).send(foundTodo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodo = user.todos.findIndex(todo => todo.id === id);

  if (foundTodo >= 0) {
    user.todos.splice(foundTodo, 1);
  } else {
    return response.status(404).json({ error: 'ToDo not found' });
  }


  return response.status(204).json();

});

module.exports = app;