const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize the database
const dbPath = path.join(app.getPath('userData'), 'todo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected at:', dbPath);
  }
});

// Create the "todos" table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,           -- Change id to TEXT PRIMARY KEY
      title TEXT,                   
      priority TEXT,
      description TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      status TEXT,
      mode TEXT
    )
  `);
});

// Function to add a new to-do item to the database
function addTodo(id, title, priority, description, status, mode, callback) {
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  
  const query = `
    INSERT INTO todos (id, title, priority, description, createdAt, updatedAt, status, mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [id, title, priority, description, createdAt, updatedAt, status, mode], function (err) {
    if (err) {
      console.error('Error adding to-do:', err);
      return callback(err);
    }
    console.log('To-do added with ID:', id);
    callback(null, { id });
  });
}

// Function to get all to-do items from the database
function getTodos(callback) {
  const query = 'SELECT * FROM todos';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching to-dos:', err);
      return callback(err);
    }
    callback(null, rows);
  });
}

// Function to get a to-do item by its ID
function getTodoById(id, callback) {
  const query = 'SELECT * FROM todos WHERE id = ?';

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching to-do by ID:', err);
      return callback(err);
    }
    if (row) {
      callback(null, row); // Return the found to-do item
    } else {
      callback(null, null); // No to-do found with that ID
    }
  });
}

// Function to update a to-do item
function updateTodo(id, updates, callback) {
  console.log(id,updates)
  const updatedAt = new Date().toISOString();
  let setClauses = [];
  let params = [];

  // Check which fields are provided in the updates object and build the query
  if (updates.title) {
    setClauses.push("title = ?");
    params.push(updates.title);
  }
  if (updates.priority) {
    setClauses.push("priority = ?");
    params.push(updates.priority);
  }
  if (updates.description) {
    setClauses.push("description = ?");
    params.push(updates.description);
  }
  if (updates.status) {
    setClauses.push("status = ?");
    params.push(updates.status);
  }
  if (updates.mode) {
    setClauses.push("mode = ?");
    params.push(updates.mode);
  }

  // Always update the updatedAt timestamp
  setClauses.push("updatedAt = ?");
  params.push(updatedAt);

  // If no fields are provided to update, call the callback with an error
  if (setClauses.length === 0) {
    return callback(new Error("No fields to update"));
  }

  // Build the final query
  const query = `
    UPDATE todos
    SET ${setClauses.join(", ")}
    WHERE id = ?
  `;
  
  // Add the ID to the params
  params.push(id);

  db.run(query, params, function (err) {
    if (err) {
      console.error('Error updating to-do:', err);
      return callback(err);
    }
    console.log('To-do updated with ID:', id);
    callback(null);
  });
}


// Function to delete a to-do item
function deleteTodo(id, callback) {
  const query = 'DELETE FROM todos WHERE id = ?';

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting to-do:', err);
      return callback(err);
    }
    console.log('To-do deleted with ID:', id);
    callback(null);
  });
}

module.exports = {
  addTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
};
