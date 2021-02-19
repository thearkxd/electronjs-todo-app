const { ipcRenderer } = require("electron");
const addTodoBtn = document.querySelector("#addTodo");
const input = document.querySelector("#willAddTodo");
const todosTable = document.querySelector(".todos-table");
const alertContainer = document.querySelector(".alert-container");

ipcRenderer.on("init", (err, todos) => refreshTodos(todos));

ipcRenderer.on("initApp", (err, data) => {
  for (var i = 0; i < document.querySelectorAll("#deleteTodo").length; i++) {
    document.querySelectorAll("#deleteTodo")[i].addEventListener("click", (e) => {
      if (confirm("Bu görevi silmek istediğinize emin misiniz?")) {
        ipcRenderer.send("deleteTodo", e.target.parentNode.parentNode.children[1].innerText);
        refreshTodos(data.length > 0 ? data.filter(x => x.todo !== e.target.parentNode.parentNode.children[1].innerText) : []);
      }
    });
  }
});

addTodoBtn.addEventListener("click", () => {
  if (input.value === "") return;
  ipcRenderer.send("addTodo", input.value);
  input.value = "";
});

ipcRenderer.on("addedTodo", (err, todo, todos) => {
  todosTable.innerHTML += `
    <tr>
        <th scope="row">${todos.findIndex(x => x.todo === todo.todo) + 1}</th>
        <td>${todo.todo}</td>
        <td>${new Date(todo.date).toLocaleString()}</td>
        <td><button class="btn btn-outline-warning" id="deleteTodo">Sil</button></td>
    </tr>
    `;
    checkAlert();
});

function checkAlert() {
    if (todosTable.children.length === 0) {
        document.querySelector(".todos").style.display = "none";
        alertContainer.style.display = "block";
    } else {
        document.querySelector(".todos").style.display = "block";
        alertContainer.style.display = "none";
    }
}

function refreshTodos(todos) {
  todosTable.innerHTML = "";
  todos.map((x, i) => {
    todosTable.innerHTML += `
      <tr>
          <th scope="row">${i + 1}</th>
          <td>${x.todo}</td>
          <td>${new Date(x.date).toLocaleString()}</td>
          <td><button class="btn btn-outline-warning" id="deleteTodo">Sil</button></td>
      </tr>
      `;
  });
  checkAlert();
}