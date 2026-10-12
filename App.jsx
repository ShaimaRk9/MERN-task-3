import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from MongoDB through Express
  async function fetchTasks() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/tasks`);

      if (!response.ok) {
        throw new Error("Unable to load tasks");
      }

      const data = await response.json();

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Load tasks when the application opens
  useEffect(() => {
    fetchTasks();
  }, []);

  // CREATE: Add task
  async function handleAdd(event) {
    event.preventDefault();

    if (!newTask.trim()) {
      setError("Please enter a task");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task: newTask
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add task");
      }

      setTasks((previousTasks) => [data, ...previousTasks]);
      setNewTask("");
    } catch (error) {
      setError(error.message);
    }
  }

  // Start editing
  function handleEditStart(task) {
    setEditId(task._id);
    setEditText(task.task);
    setError("");
  }

  // UPDATE: Save edited text
  async function handleEditSave(id) {
    if (!editText.trim()) {
      setError("Task cannot be empty");
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task: editText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update task");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task._id === id ? data : task
        )
      );

      setEditId(null);
      setEditText("");
    } catch (error) {
      setError(error.message);
    }
  }

  // Cancel editing
  function handleEditCancel() {
    setEditId(null);
    setEditText("");
    setError("");
  }

  // DELETE: Remove task
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete task");
      }

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  }

  // UPDATE: Mark completed or incomplete
  async function handleToggle(task) {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/update/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            completed: !task.completed
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update task");
      }

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id ? data : item
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  return (
    <main className="app-container">
      <section className="todo-card">
        <header className="app-header">
          <h1>My To-Do List</h1>
          <p>Plan your work. Complete your goals.</p>
        </header>

        <form className="add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Enter a new task..."
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />

          <button type="submit" className="add-btn">
            Add Task
          </button>
        </form>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {loading ? (
          <p className="status-message">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="status-message">
            No tasks yet. Add your first task!
          </p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article
                className={`task-item ${
                  task.completed ? "completed" : ""
                }`}
                key={task._id}
              >
                {editId === task._id ? (
                  <form
                    className="edit-area"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleEditSave(task._id);
                    }}
                  >
                    <input
                      type="text"
                      value={editText}
                      onChange={(event) =>
                        setEditText(event.target.value)
                      }
                      autoFocus
                    />

                    <button type="submit" className="save-btn">
                      Save
                    </button>

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <label className="task-content">
                      <input
                        type="checkbox"
                        checked={Boolean(task.completed)}
                        onChange={() => handleToggle(task)}
                      />

                      <span>{task.task}</span>
                    </label>

                    <div className="task-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEditStart(task)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}

        <footer className="app-footer">
          <span>Total Tasks: {tasks.length}</span>
          <span>Completed: {completedCount}</span>
          <span>Pending: {tasks.length - completedCount}</span>
        </footer>
      </section>
    </main>
  );
}

export default App;