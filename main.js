const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');

let win;

function createWindow() {
  win = new BrowserWindow({
    maxWidth: 800,
    maxHeight: 470,
    minWidth: 800,
    minHeight: 470,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle adding a new to-do
ipcMain.on('add-todo', (event, todo) => {
  const {id, title, description, priority, mode, status} = todo;
  
  db.addTodo(id, title, priority, description, status, mode, (err, result) => {
    if (!err) {
      db.getTodos((err, todos) => {
        if (!err) {
          win.webContents.send('todos', todos);
        }
      });
    }
  });
});

// Handle fetching all to-dos
ipcMain.on('get-todos', (event) => {
  db.getTodos((err, todos) => {
    if (!err) {
      win.webContents.send('todos', todos);
    }
  });
});

ipcMain.on('update-todo', (event, todo) => {
  // Create an updates object with only defined properties
  const updates = {};

  // Add only defined fields to the updates object
  if (todo.priority !== undefined) updates.priority = todo.priority;
  if (todo.description !== undefined) updates.description = todo.description;
  if (todo.status !== undefined) updates.status = todo.status;
  if (todo.mode !== undefined) updates.mode = todo.mode;

  // Check if updates object is empty
  if (Object.keys(updates).length === 0) {
      return event.reply('update-todo-error', 'No fields to update');
  }

  // Call the updateTodo function with the ID and updates object
  db.updateTodo(todo.id, updates, (err) => { // Make sure callback is provided
      if (err) {
          console.error('Error updating to-do:', err);
          return event.reply('update-todo-error', err.message); // Send error back to renderer
      }

      // Fetch updated todos and send back to renderer
      db.getTodos((err, todos) => {
          if (err) {
              console.error('Error fetching todos after update:', err);
              return event.reply('fetch-todos-error', err.message); // Send error back to renderer
          }
          win.webContents.send('todos', todos);
      });
  });
});


// Handle deleting a to-do
ipcMain.on('delete-todo', (event, id) => {
  db.deleteTodo(id, (err) => {
    if (!err) {
      db.getTodos((err, todos) => {
        if (!err) {
          win.webContents.send('todos', todos);
        }
      });
    }
  });
});
