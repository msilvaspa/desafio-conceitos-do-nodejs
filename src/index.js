const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const userExists = users.find(
    (user) => user.username === request.body.username
  );

  if (userExists) {
    return response.status(400).json({ error: "user already exists" });
  } else {
    next();
  }
}

app.post("/users", (request, response) => {
  const userExists = users.find(
    (user) => user.username === request.body.username
  );

  if (userExists) {
    return response.status(400).send({ error: "user already exists" });
  }

  const user = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: [],
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = users.find((user) => user.username === request.headers.username);
  return response.status(200).json(user.todos);
  // Complete aqui
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const user = users.find((user) => user.username === request.headers.username);
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const user = users.find((user) => user.username === request.headers.username);
  const _todo = user.todos.find((todo) => todo.id === id);
  if (!_todo) return response.status(404).json({ error: "todo not found" });
  const todo = user.todos.map((todo) => {
    if (todo.id === id) return { ...todo, ...request.body };
    return todo;
  });
  user.todos = todo;

  return response.status(200).json({ ...request.body, done: false });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const user = users.find((user) => user.username === request.headers.username);
  const _todo = user.todos.find((todo) => todo.id === id);

  if (!_todo) return response.status(404).json({ error: "todo not found" });

  const todo = user.todos.map((todo) => {
    if (todo.id === id) return { ...todo, done: true };
    return todo;
  });
  user.todos = todo;

  return response.status(200).json({ ..._todo, done: true });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const user = users.find((user) => user.username === request.headers.username);
  const _todo = user.todos.find((todo) => todo.id === id);
  if (!_todo) return response.status(404).json({ error: "todo not found" });

  const todo = user.todos.filter((todo) => todo.id !== id);
  user.todos = todo;

  return response.status(204).send();
});

module.exports = app;
