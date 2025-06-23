const { ipcRenderer } = require("electron");
const stickyNoteColors = [
  "#fef68a", // Light Yellow (Pastel)
  "#ffabbb", // Pastel Pink
  "#a8d5e2", // Soft Blue
  "#e6e6fa", // Lavender
  "#bdf7b7", // Mint Green
  "#ffe5b4", // Peach
  "#ffeb3b", // Bright Yellow
  "#ff6f91", // Bright Pink
  "#00b0ff", // Bright Blue
  "#ffa726", // Bright Orange
  "#76ff03", // Neon Green
  "#f5f5dc", // Beige
  "#d3d3d3", // Light Gray
  "#d2b48c", // Light Tan
  "#fffff0", // Ivory
  "#c2b280", // Pale Brown
  "#b5b35c", // Olive Green
  "#e07a5f", // Terracotta
  "#8d9b6a", // Moss Green
  "#f4a460", // Sandy Brown
  "#d1603d", // Clay Red
  "#87ceeb", // Sky Blue
  "#008080", // Cool Teal
  "#e0ffff", // Pale Cyan
  "#b2dfdb", // Light Aqua
  "#20b2aa", // Light Sea Green
  "#ff7f50", // Coral
  "#ffa07a", // Light Salmon
  "#fd5e53", // Sunset Orange
  "#daa520", // Goldenrod
  "#f5deb3", // Wheat
  "#f8c8dc", // Pale Pink
  "#a6b1e1", // Dusty Blue
  "#9b5de5", // Muted Purple
  "#b0b0b0", // Soft Gray
  "#f7a072", // Muted Peach
];

// Calculate the number of characters per line based on font-size and width of the sticky note
const maxCharactersPerLine = 20; // Approximation based on font-size and note width
const maxLinesPerCard = 6; // Assuming 6 lines fit in a 150px height with padding

// Function to split description by both newline characters and length
const splitDescriptionByLines = (text, maxCharsPerLine, maxLinesPerCard) => {
  let parts = [];
  let paragraphs = text.split('\n'); // Split by newline characters first

  paragraphs.forEach(paragraph => {
    let words = paragraph.split(' '); // Split by words to prevent mid-word breaks
    let currentLine = '';
    let lines = [];

    words.forEach(word => {
      // If adding the next word exceeds the character limit per line
      if (currentLine.length + word.length + 1 > maxCharsPerLine) {
        lines.push(currentLine); // Push current line to lines array
        currentLine = word; // Start a new line with the current word
      } else {
        currentLine += (currentLine ? ' ' : '') + word; // Add word to current line
      }
    });

    lines.push(currentLine); // Push the last line
    while (lines.length > maxLinesPerCard) {
      // Create chunks of text that fit in one card
      parts.push(lines.slice(0, maxLinesPerCard).join('<br>'));
      lines = lines.slice(maxLinesPerCard); // Continue with the remaining lines
    }
    if (lines.length > 0) {
      parts.push(lines.join('<br>')); // Push remaining lines as the last chunk
    }
  });

  return parts;
};

// Modified createTaskCard function to handle multiple cards for long descriptions
const createTaskCard = ({ id, title, description, priority, mode, status }) => {
  let descriptionChunks = splitDescriptionByLines(description, maxCharactersPerLine, maxLinesPerCard);

  descriptionChunks.forEach((chunk, index) => {
    // Append (1), (2), (3)... to the title for multi-part cards
    let numberedTitle = descriptionChunks.length > 1 ? `${title} (${index + 1})` : title;

    let indexColor = Math.floor(Math.random() * stickyNoteColors.length);
    let color = stickyNoteColors[indexColor];

    let taskHtml = `<li data-id="${id}">
        <div class="sticky-note" style="background-color:${color}">
          <div class="sticky-note-header">${numberedTitle}</div>
          <div class="description">
            ${chunk}
          </div>
          <div class="action-btns">
            <img src="./images/tick.png" alt="tick" srcset="" class="done">
            <img src="./images/delete.png" alt="delete" srcset="" class="delete">
            <img src="./images/draw.png" alt="edit" srcset="" class="edit">
          </div>
        </div>
      </li>`;

    document.querySelector("#taskLists").innerHTML += taskHtml;
  });
};

// The rest of your script to render tasks, handle modal interactions, etc.
document.addEventListener("DOMContentLoaded", () => {
  const getAllTodoAndRender = (status = "pending") => {
    ipcRenderer.send("get-todos");
    ipcRenderer.on("todos", (event, todos) => {
      document.querySelector("#taskLists").innerHTML = "";
      todos.forEach((todo) => {
        if (!(status == "all") && todo.status == status) {
          createTaskCard(todo);
        }
      });
    });
  };

  getAllTodoAndRender();

  const closeModal = () => {
    const modal = document.getElementById("todoModal");
    document.getElementById("taskHeader").value = "";
    document.getElementById("taskDescription").value = "";
    modal.style.display = "none";
  };

  const openModal = (e, id = "", title = "", description = "", priority = "yellow", mode = "public") => {
    const modal = document.getElementById("todoModal");
    modal.style.display = "flex";
    document.getElementById("taskHeader").value = title;
    document.getElementById("taskDescription").value = description;
    document.getElementById("priority").value = priority;
    document.querySelectorAll('input[name="privacy"]').forEach((radio) => {
      if (radio.value == mode) radio.checked = true;
    });
    document.getElementById("submitTask").dataset.todoId = id;

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  };

  document.querySelector(".stacked-button").addEventListener("click", openModal);

  document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("keydown", (e) => {
      const modal = document.getElementById("todoModal");
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && modal.style.display === "flex") {
        e.preventDefault();
        addTask();
      }
      if (e.key === "Escape" && modal.style.display === "flex") {
        closeModal();
      }
    });
  });

  document.getElementById("todoModal").addEventListener("click", (e) => {
    if (e.target.id == "submitTask") {
      addTask();
    } else if (e.target.id == "closeModalBtn") {
      closeModal();
    }
  });

  function addTask() {
    let id = document.getElementById("submitTask").dataset.todoId;
    const title = document.getElementById("taskHeader").value;
    let description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("priority").value;
    const mode = document.querySelector('input[name="privacy"]:checked').value;
    const status = "pending";
    let newTask = false;
    if (!id) {
      newTask = true;
      id = Date.now().toString();
    }

    if (!title) {
      alert("Please fill out the task header");
      return;
    }

    const todo = { id, title, description, priority, mode, status };
    if (newTask) {
      ipcRenderer.send("add-todo", todo);
      closeModal();
      createTaskCard(todo);
    } else {
      ipcRenderer.send("update-todo", todo);
      closeModal();
      getAllTodoAndRender();
    }
  }

 // Delete and mark as done the todo
 document.querySelector("#taskLists").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete")) {
      console.log(e);
      const id =
        e.target.parentElement.parentElement.parentElement.dataset["id"];
      console.log(id);
      ipcRenderer.send("delete-todo", id);
      getAllTodoAndRender();
    }
    if (e.target.classList.contains("done")) {
      console.log(e);
      const id =
        e.target.parentElement.parentElement.parentElement.dataset["id"];
      console.log(id);
      ipcRenderer.send("update-todo", { id: id, status: "done" });
      getAllTodoAndRender();
    }
    if (e.target.classList.contains("edit")) {
      // get the id of the element
      const id =
        e.target.parentElement.parentElement.parentElement.dataset["id"];
      console.log("edit called for", id);
      // Open the modal
      ipcRenderer.send("get-todo-by-id", id); // Fixed event name
      ipcRenderer.on("todo-by-id", (event, todo) => {
        console.log(todo);
        if (todo) {
          // Check if the todo object exists
          openModal(
            event,
            id,
            todo.title,
            todo.description,
            todo.priority,
            todo.mode
          );
        } else {
          console.log("Error: Todo not found");
        }
      });

      // get the data for corresponding id to modal
    }
  });
});