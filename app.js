const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const todos = require("./src/schemas/todo");
const mongoose = require("mongoose");
const path = require("path");
const url = require("url");

// </> DB Connection </>
mongoose.connect("mongodb+srv://Theark:8ePNhZC68qDj3HAM@cluster0.irato.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })

  .then(() => console.log("Connected to DB"))
  .catch(() => console.log("DB Connection Failed"));
// </> DB Connection </>

// </> Main Page </>
app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: { nodeIntegration: true },
  });
  mainWindow.setResizable(false);

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/views/index.html"),
      protocol: "file:",
    })
  );

  ipcMain.on("addTodo", async (err, todo) => {
    let data = await todos.findOne({});
    const opt = { todo, date: Date.now() };
    if (!data) {
      new todos({
        todos: [opt],
      }).save();
      data = await todos.findOne({});
    } else {
      data.todos.push(opt);
      data.save();
    }

    data = await todos.findOne({});
    data = await todos.findOne({});
    mainWindow.webContents.send("addedTodo", opt, data.todos);
    if (data.todos.length > 0) mainWindow.webContents.send("initApp", data.todos);
  });

  ipcMain.on("deleteTodo", async (err, todoName) => {
    let data = await todos.findOne({});
    data.todos = data.todos.filter((x) => x.todo != todoName);
    data.save();

    data = await todos.findOne({});
    data = await todos.findOne({});
    if (data.todos.length > 0) mainWindow.webContents.send("initApp", data);
  });

  mainWindow.webContents.on("dom-ready", async () => {
    const data = await todos.findOne({});
    mainWindow.webContents.send("init", data ? data.todos : []);
    if (data.todos.length > 0)
      mainWindow.webContents.send("initApp", data.todos);
  });
});
// </> Main Page </>

// </> Menu </>
const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        role: "quit",
      },
    ],
  },
];

if (process.env.NODE_ENV !== "production") {
  template.push({
    label: "DevTools",
    submenu: [
      {
        label: "DevTools",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        label: "Reload",
        role: "reload",
      },
    ],
  });
}

if (process.platform === "darwin") template.unshift({ label: app.name });

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
// </> Menu </>
