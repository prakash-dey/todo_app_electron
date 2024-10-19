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

const createTaskCard = ({ id, title, description, priority, mode, status }) => {
  let index = Math.floor(Math.random() * (stickyNoteColors.length - 1 + 1));
  let color = stickyNoteColors[index];
  let taskHtml = `<li data-id = ${id}>
          <div class="sticky-note" style = "background-color:${color}">
            <div class="sticky-note-header">${title}</div>
            <div class="description">
              ${description}
            </div>
            <div class="action-btns">
              <img src="./images/tick.png" alt="tick" srcset="" class ="done">
              <img src="./images/delete.png" alt="delete" srcset="" class = "delete">
            </div>
          </div>
        </li>`;

  document.querySelector("#taskLists").innerHTML += taskHtml;
};

document.addEventListener("DOMContentLoaded", () => {
  const getAllTodoAndRender = (status = "pending") => {
    ipcRenderer.send("get-todos");
    ipcRenderer.on("todos", (event, todos) => {
      document.querySelector("#taskLists").innerHTML = "";
      console.log(todos);
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
  const openModal = () => {
    const modal = document.getElementById("todoModal");
    modal.style.display = "flex";
    // Close modal when clicking outside of modal content
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  };
  document
    .querySelector(".stacked-button")
    .addEventListener("click", openModal);

  document.getElementById("todoModal").addEventListener("click", (e) => {
    if (e.target.id == "submitTask") {
      addTask();
    } else if (e.target.id == "closeModalBtn") {
      closeModal();
    }
  });
  // Add a new task to the list
  function addTask() {
    const title = document.getElementById("taskHeader").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("priority").value;
    const mode = document.querySelector('input[name="privacy"]:checked').value;
    const status = "pending";
    const id = Date.now().toString();

    const todo = { id, title, description, priority, mode, status };

    // Example of what happens when task is submitted (you can replace this with actual functionality)
    if (!title) {
      alert("Please fill out the task header");
      return;
    }

    // Save the data into db
    ipcRenderer.send("add-todo", todo);

    closeModal();
    createTaskCard(todo);
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
      ipcRenderer.send("update-todo", {"id":id,"status":"done"});
      getAllTodoAndRender();
    }
  });
});
