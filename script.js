
/* =========================================
   TASKFLOW - SMART TASK MANAGER
========================================= */


/* =========================================
   SELECT ELEMENTS
========================================= */

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const priorityInput = document.getElementById("priority");

const dueDateInput = document.getElementById("dueDate");

const taskList = document.getElementById("taskList");

const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const themeBtn =
    document.getElementById("themeBtn");

const todayDate =
    document.getElementById("todayDate");


/* =========================================
   STATISTICS
========================================= */

const totalTasks =
    document.getElementById("totalTasks");

const activeTasks =
    document.getElementById("activeTasks");

const completedTasks =
    document.getElementById("completedTasks");

const progressPercent =
    document.getElementById("progressPercent");

const visibleCount =
    document.getElementById("visibleCount");


/* =========================================
   TASK DATA
========================================= */

let tasks =
    JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";


/* =========================================
   SHOW TODAY DATE
========================================= */

const now = new Date();

todayDate.textContent =
    now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


/* =========================================
   ADD TASK
========================================= */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title =
        taskInput.value.trim();

    const priority =
        priorityInput.value;

    const dueDate =
        dueDateInput.value;


    if (title === "") {
        alert("Please enter a task.");
        return;
    }


    const newTask = {

        id: Date.now(),

        title: title,

        priority: priority,

        dueDate: dueDate,

        completed: false

    };


    tasks.push(newTask);


    saveTasks();

    renderTasks();

    updateStats();


    // Reset form

    taskForm.reset();

    priorityInput.value = "medium";

});


/* =========================================
   SAVE TASKS
========================================= */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks() {

    taskList.innerHTML = "";


    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    let filteredTasks =
        tasks.filter(function (task) {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(searchTerm);


            let matchesFilter = true;


            if (currentFilter === "active") {

                matchesFilter =
                    !task.completed;

            }


            if (currentFilter === "completed") {

                matchesFilter =
                    task.completed;

            }


            return matchesSearch && matchesFilter;

        });


    /* Show newest tasks first */

    filteredTasks.reverse();


    visibleCount.textContent =
        filteredTasks.length;


    /* Empty state */

    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    /* Create task elements */

    filteredTasks.forEach(function (task) {

        const taskElement =
            document.createElement("div");


        taskElement.className =
            "task-item";


        if (task.completed) {

            taskElement.classList.add("completed");

        }


        /* Format due date */

        let dateText = "No due date";


        if (task.dueDate) {

            const date =
                new Date(task.dueDate + "T00:00:00");


            dateText =
                "Due: " +
                date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });

        }


        /* Priority text */

        const priorityText =
            task.priority.charAt(0).toUpperCase() +
            task.priority.slice(1);


        taskElement.innerHTML = `

            <div class="task-left">

                <button
                    class="check-btn"
                    onclick="toggleTask(${task.id})"
                    title="Complete task">

                    ${task.completed ? "✓" : ""}

                </button>


                <div class="task-info">

                    <h4>${escapeHTML(task.title)}</h4>

                    <div class="task-meta">

                        <span class="priority ${task.priority}">
                            ${priorityText}
                        </span>

                        <span class="due-date">
                            📅 ${dateText}
                        </span>

                    </div>

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="action-btn edit-btn"
                    onclick="editTask(${task.id})"
                    title="Edit task">

                    ✏️

                </button>


                <button
                    class="action-btn delete-btn"
                    onclick="deleteTask(${task.id})"
                    title="Delete task">

                    🗑️

                </button>

            </div>

        `;


        taskList.appendChild(taskElement);

    });

}


/* =========================================
   TOGGLE TASK
========================================= */

function toggleTask(id) {

    tasks =
        tasks.map(function (task) {

            if (task.id === id) {

                return {
                    ...task,
                    completed: !task.completed
                };

            }

            return task;

        });


    saveTasks();

    renderTasks();

    updateStats();

}


/* =========================================
   DELETE TASK
========================================= */

function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");


    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(function (task) {

            return task.id !== id;

        });


    saveTasks();

    renderTasks();

    updateStats();

}


/* =========================================
   EDIT TASK
========================================= */

function editTask(id) {

    const task =
        tasks.find(function (task) {

            return task.id === id;

        });


    if (!task) {
        return;
    }


    const newTitle =
        prompt("Edit your task:", task.title);


    if (newTitle === null) {
        return;
    }


    const cleanTitle =
        newTitle.trim();


    if (cleanTitle === "") {

        alert("Task title cannot be empty.");

        return;

    }


    task.title =
        cleanTitle;


    saveTasks();

    renderTasks();

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    function () {

        renderTasks();

    }
);


/* =========================================
   FILTERS
========================================= */

filterButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            filterButtons.forEach(function (btn) {

                btn.classList.remove("active");

            });


            button.classList.add("active");


            currentFilter =
                button.dataset.filter;


            renderTasks();

        }
    );

});


/* =========================================
   UPDATE STATISTICS
========================================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(function (task) {

            return task.completed;

        }).length;


    const active =
        total - completed;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );

    }


    totalTasks.textContent =
        total;


    activeTasks.textContent =
        active;


    completedTasks.textContent =
        completed;


    progressPercent.textContent =
        progress + "%";

}


/* =========================================
   DARK / LIGHT MODE
========================================= */

themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        themeBtn.textContent =
            isDark ? "☀️" : "🌙";


        localStorage.setItem(
            "taskflowTheme",
            isDark ? "dark" : "light"
        );

    }
);


/* =========================================
   LOAD SAVED THEME
========================================= */

const savedTheme =
    localStorage.getItem("taskflowTheme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}


/* =========================================
   SECURITY HELPER
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================
   INITIAL LOAD
========================================= */

renderTasks();

updateStats();