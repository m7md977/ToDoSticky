document.addEventListener("DOMContentLoaded", function () {
  const addStickyBtn = document.getElementById("addSticky");
  const stickyWall = document.getElementById("stickyWall");
  let zIndexCounter = 1;
  const defaultTitle = " Sticky"; // Default sticky content
  const defaultText = "Double click to edit"; // Default sticky content
  const deleteAllBtn = document.getElementById("deleteAllBtn");
  deleteAllBtn.addEventListener("click", function () {
    // Confirm if the user really wants to delete all
    if (window.confirm("Are you sure you want to delete all stickies?")) {
      // Remove all stickies from the page
      document.querySelectorAll(".sticky").forEach((sticky) => {
        sticky.remove();
      });
      // Clear stickies from local storage
      localStorage.removeItem("tasks");
    }
  });
  addStickyBtn.addEventListener("click", function () {
    createSticky(defaultTitle, defaultText);
  });

  document.addEventListener("dblclick", function (event) {
    if (
      !event.target.closest("#addSticky") &&
      event.target !== document.getElementById("newStickyText") &&
      !event.target.closest(".sticky")
    ) {
      const stickyElem = createSticky(defaultTitle, defaultText);
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      stickyElem.style.left = mouseX + "px";
      stickyElem.style.top = mouseY + "px";
    }
  });

  function createSticky(title, text) {
    const sticky = document.createElement("div");
    sticky.className = "sticky";
    sticky.innerHTML = `
              <div class="sticky-inner-content">
                  <div class="stickyTitle">${title}</div>
                  <div class="stickyText">${text}</div>
              </div>
              <input type="checkbox" class="markDone">
              <button class="deleteBtn"><span class="fas fa-trash"></span></button>
              <button class="saveBtn hidden"><span class="fas fa-save"></span></button>
              `;

    const randomColor = getRandomColor();
    const markDoneCheckbox = sticky.querySelector(".markDone");
    const deleteBtn = sticky.querySelector(".deleteBtn");
    const stickyTitle = sticky.querySelector(".stickyTitle");
    const stickyText = sticky.querySelector(".stickyText");
    const saveBtn = sticky.querySelector(".saveBtn");

    function toggleEditableState(element) {
      if (!element.isContentEditable) {
        element.setAttribute("contenteditable", "true");
        element.classList.add("editing");
        saveBtn.style.display = "block";
        element.focus();
      } else {
        element.setAttribute("contenteditable", "false");
        element.classList.remove("editing");
        saveBtn.style.display = "none";
        saveTasks();
      }
    }

    [stickyTitle, stickyText].forEach((elem) => {
      elem.addEventListener("dblclick", function () {
        toggleEditableState(elem);
      });

      elem.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          if (!e.shiftKey) {
            e.preventDefault();
            toggleEditableState(elem);
          }
        }
      });

      elem.addEventListener("blur", function () {
        if (elem.isContentEditable) {
          toggleEditableState(elem);
        }
      });
    });

    saveBtn.addEventListener("click", function () {
      toggleEditableState(stickyText);
      toggleEditableState(stickyTitle);
    });

    markDoneCheckbox.addEventListener("change", function () {
      stickyText.style.textDecoration = this.checked ? "line-through" : "none";
      saveTasks();
    });

    deleteBtn.addEventListener("click", function () {
      sticky.remove();
      saveTasks();
    });

    sticky.style.backgroundColor = randomColor;
    sticky.style.left = stickyWall.offsetWidth - 1200 + "px";
    sticky.style.top = stickyWall.offsetHeight - 300 + "px";

    stickyWall.appendChild(sticky);

    sticky.addEventListener("mousedown", function (e) {
      let offsetX = e.clientX - sticky.getBoundingClientRect().left;
      let offsetY = e.clientY - sticky.getBoundingClientRect().top;

      sticky.style.zIndex = zIndexCounter++;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      function onMouseMove(e) {
        sticky.style.left = e.clientX - offsetX + "px";
        sticky.style.top = e.clientY - offsetY + "px";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        saveTasks();
      }
    });

    return sticky; // Return the sticky element for any post-processing
  }

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function saveTasks() {
    const tasks = Array.from(document.querySelectorAll(".sticky")).map(
      (sticky) => {
        return {
          title: sticky.querySelector(".stickyTitle").innerHTML,
          text: sticky.querySelector(".stickyText").innerHTML,
          isDone: sticky.querySelector(".markDone").checked,
          color: sticky.style.backgroundColor,
          left: sticky.style.left,
          top: sticky.style.top,
        };
      }
    );
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach((task) => {
      const stickyElem = createSticky(task.title, task.text);
      stickyElem.querySelector(".markDone").checked = task.isDone;
      if (task.isDone) {
        stickyElem.querySelector(".stickyText").style.textDecoration =
          "line-through";
      }
      stickyElem.style.backgroundColor = task.color;
      stickyElem.style.left = task.left;
      stickyElem.style.top = task.top;
    });
  }

  loadTasks();
});
