const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/task");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Task 3 Backend is Running Successfully");
});

// CREATE: Add a task
app.post("/add", async (req, res) => {
  try {
    const { task } = req.body;

    if (typeof task !== "string" || !task.trim()) {
      return res.status(400).json({
        message: "Please enter a task"
      });
    }

    const newTask = await Task.create({
      task: task.trim()
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({
      message: "Error adding task",
      error: error.message
    });
  }
});

// READ: Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({
      createdAt: -1
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching tasks",
      error: error.message
    });
  }
});

// UPDATE: Edit task text or completion status
app.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { task, completed } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const updates = {};

    if (task !== undefined) {
      if (typeof task !== "string" || !task.trim()) {
        return res.status(400).json({
          message: "Task cannot be empty"
        });
      }

      updates.task = task.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Invalid completion status"
        });
      }

      updates.completed = completed;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No updates provided"
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: "Error updating task",
      error: error.message
    });
  }
});

// DELETE: Remove a task
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.status(200).json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting task",
      error: error.message
    });
  }
});

// Connect to MongoDB, then start the server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
  }
}

startServer();