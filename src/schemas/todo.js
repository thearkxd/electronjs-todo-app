const { Schema, model } = require("mongoose");

const schema = Schema({
  todos: { type: Array, default: [] }
});

module.exports = model("todos", schema);