const { ipcRenderer } = require("electron");
const { stat } = require("original-fs");
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
  // "#76ff03", // Neon Green
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

let allData = [];
let displayData = [];
const priorityColors = {
  low: "white", // yellow
  medium: "#00b0ff", // blue
  high: "#ef1447ff", // red
};

const createTaskCard = ({ id, title, description, priority, mode, status }) => {
  // description = description.replaceAll("/done", "");
  let index = Math.floor(Math.random() * (stickyNoteColors.length - 1 + 1));
  let color = stickyNoteColors[index];
  description = description.replace(/\/done/gi, "<i> done </i>");
  description = description.replace(/\n/g, "<br>");
  let taskHtml = `<li data-id = ${id}>
          <div class="sticky-note ${priority}" style = "background-color:${color}">
            <div class="sticky-note-header">${title}</div>
            <div class="description">
        
              ${description}
       
            </div>
            <div class="action-btns">
              <img src="./images/tick.png" alt="tick" srcset="" class ="done">
              <img src="./images/delete.png" alt="delete" srcset="" class = "delete">
              <img src="./images/draw.png" alt="edit" srcset="" class = "edit">
            </div>
          </div>
        </li>`;

  document.querySelector("#taskLists").innerHTML += taskHtml;
};
const filterData = () => {
  const mapPriority = {
    yellow: "low",
    blue: "medium",
    red: "high",
  };
  document.querySelector("#taskLists").innerHTML = "";
  const status = document.getElementById("status-select").value;
  let priority = document.getElementById("priority-select").value;
  const mode = document.getElementById("mode-select").value;
  priority = mapPriority[priority] || priority;

  const filteredData = allData.filter((todo) => {
    return (
      (status === "all" || todo.status === status) &&
      (priority === "all" || todo.priority === priority) &&
      (mode === "all" || todo.mode === mode)
    );
  });

  filteredData.forEach((todo) => {
    createTaskCard(todo);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const getAllTodoAndRender = (status = "pending") => {
    ipcRenderer.send("get-todos");
    ipcRenderer.on("todos", (event, todos) => {
      document.querySelector("#taskLists").innerHTML = "";
      allData = todos;
      filterData();
    });
  };

  getAllTodoAndRender();

  const closeModal = () => {
    const modal = document.getElementById("todoModal");
    document.getElementById("taskHeader").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("priority-color").style.backgroundColor = priorityColors["low"];
    modal.style.display = "none";
  };
  const openModal = (
    e,
    id = "",
    title = "",
    description = "",
    priority = "low",
    mode = "public"
  ) => {
    const modal = document.getElementById("todoModal");
    modal.style.display = "flex";
    document.getElementById("taskHeader").value = title;
    document.getElementById("taskDescription").value = description;
    document.getElementById("priority").value = priority;
    document.getElementById("priority-color").style.backgroundColor = priorityColors[priority];
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
  /**Open modal on add button click */
  document
    .querySelector(".stacked-button")
    .addEventListener("click", openModal);

  const addHTMLTagInTextArea = (tag,className = null) => {
    const textarea = document.getElementById("taskDescription");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Nothing selected
    console.log({ start, end });
    if (start === end) return;

    const selected = text.substring(start, end);

    // Check if selected text is already wrapped in <s> tags
    const before = text.substring(0, start);
    const after = text.substring(end);

    const OpenTag = `<${tag} ${className ? `class="${className}"` : ""}>`;
    const CloseTag = `</${tag}>`;

    // Detect if selection is already surrounded by <s>...</s>
    const isWrapped = before.endsWith(OpenTag) && after.startsWith(CloseTag);
    let newText;

    if (isWrapped) {
      // Unwrap the <s> tags
      newText =
        before.slice(0, -OpenTag.length) +
        selected +
        after.slice(CloseTag.length);
    } else {
      // Check if selection is *inside* existing <s> ... </s>
      const openBefore = before.lastIndexOf(OpenTag);
      const closeBefore = before.lastIndexOf(CloseTag);

      const insideExisting = openBefore > closeBefore;

      if (insideExisting) {
        // Already inside <s> block, do nothing
        return;
      }

      // Wrap with <s> tags
      newText = before + OpenTag + selected + CloseTag + after;
    }

    textarea.value = newText;

    // Reselect the same text region (optional)
    // added tag
    console.log({ isWrapped, start, end, selected, text: text.length });
    if (!isWrapped) {
      textarea.selectionStart = start + OpenTag.length;
      textarea.selectionEnd = start + OpenTag.length + selected.length;
    } else {
      // removed tag
      textarea.selectionStart = start - OpenTag.length;
      textarea.selectionEnd = start - OpenTag.length + selected.length;
    }
    // textarea.selectionStart = start;
    // textarea.selectionEnd = start + selected.length + (isWrapped ? 0 : OpenTag.length + CloseTag.length);
    textarea.focus();
  };

  // design buttons functionality
  document
    .getElementById("boldBtn")
    .addEventListener("click", () => addHTMLTagInTextArea("b"));
  document
    .getElementById("italicBtn")
    .addEventListener("click", () => addHTMLTagInTextArea("i"));
  document
    .getElementById("underlineBtn")
    .addEventListener("click", () => addHTMLTagInTextArea("u"));
  document
    .getElementById("strikeBtnDone")
    .addEventListener("click", () => addHTMLTagInTextArea("s","done"));
  document
    .getElementById("strikeBtnCancel")
    .addEventListener("click", () => addHTMLTagInTextArea("s","cancel"));

  document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("keydown", (e) => {
      const modal = document.getElementById("todoModal");
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        modal.style.display === "flex"
      ) {
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
  // Add a new task to the list
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

    // Example of what happens when task is submitted (you can replace this with actual functionality)
    if (!title) {
      alert("Please fill out the task header");
      return;
    }
    /***********TO DO : PUT A CHECK IN THE DESCRIPTION TEXT LENGTH ******************/
    const allowedLine = 5;
    const maxCharacter = 300;
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
      const id =
        e.target.parentElement.parentElement.parentElement.dataset["id"];
      ipcRenderer.send("delete-todo", id);
      getAllTodoAndRender();
    }
    if (e.target.classList.contains("done")) {
      const id =
        e.target.parentElement.parentElement.parentElement.dataset["id"];
      ipcRenderer.send("update-todo", { id: id, status: "done" });
      getAllTodoAndRender();
    }
    if (e.target.classList.contains("edit")) {
      // get the id of the element
      const id =
        e.target.parentElement.parentElement.parentElement.dataset["id"];
      // Open the modal
      ipcRenderer.send("get-todo-by-id", id);
      ipcRenderer.on("todo-by-id", (event, todo) => {
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

  // Filter tasks based on status
  document.querySelectorAll(".filter select").forEach((select) => {
    select.addEventListener("change", filterData);
  });

  // Change priority-color div background on select change
  const prioritySelect = document.getElementById("priority");
  const priorityColorDiv = document.getElementById("priority-color");

  if (prioritySelect && priorityColorDiv) {
    prioritySelect.addEventListener("change", (e) => {
      const value = e.target.value;
      priorityColorDiv.style.backgroundColor =
        priorityColors[value] || "#fef68a";
    });

    // Set initial color
    priorityColorDiv.style.backgroundColor =
      priorityColors[prioritySelect.value] || "#fef68a";
  }
  //
});
