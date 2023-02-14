const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (user) return next();
  else return response.status(400).json({ error: "username not found!" });
}

function checkExistsUserNameAccount(username) {
  return users.find((user) => user.username === username);
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  if ((!name, !username))
    return response.status(401).json({ error: "preencha todos os campos!" });
  if (checkExistsUserNameAccount(username))
    return response.status(400).json({ error: "Usuario já existe!" });
  try {
    const dataUser = {
      id: uuidv4(), // precisa ser um uuid
      name: name,
      username: username,
      todos: [],
    };
    users.push(dataUser);
    return response.status(201).json(dataUser);
  } catch (error) {
    console.log(error);
    return response.status(400).json(error);
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  if (username) {
    const user = users.find((user) => {
      return user.username === username;
    });
    response.status(200).json(user.todos);
  }
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  if ((!title, !deadline))
    return response
      .status(401)
      .json({ error: "Por favor preencher todos os campos!" });
  const userIndex = users.findIndex((user) => user.username === username);
  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString(),
  };
  if (userIndex !== -1) {
    users[userIndex].todos.push(todo);
    response.status(201).json(todo);
  }
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;
  if (!title && !deadline)
    return response
      .status(401)
      .json({ error: "Por favor preencher todos os campos!" });
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);
  if (userIndex !== -1 && todoIndex !== -1) {
    const dataTodo = users[userIndex].todos[todoIndex];
    dataTodo.title = title;
    dataTodo.deadline = new Date(deadline).toISOString();
    response.status(200).json(dataTodo);
  } else return response.status(404).json({ error: "Not Found" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);
  if (userIndex !== -1 && todoIndex !== -1) {
    const dataTodo = users[userIndex].todos[todoIndex];
    dataTodo.done = true;
    response.status(200).json(dataTodo);
  } else return response.status(404).json({ error: "Not Found" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const userIndex = users.findIndex((user) => user.username === username);
  const todoIndex = users[userIndex].todos.findIndex((todo) => todo.id === id);
  if (userIndex !== -1 && todoIndex !== -1) {
    users[userIndex].todos.splice(todoIndex, 1);
    return response.status(204).json();
  } else return response.status(404).json({ error: "Not Found" });
});

module.exports = app;
