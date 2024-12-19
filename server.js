const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Task Schema
const Task = require('./models/Task');

// API Routes
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Create a new task
app.post('/tasks', async (req, res) => {
    const { title, description } = req.body;
    const task = new Task({ title, description });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Status

app.patch('/tasks/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update the task

app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { title, description },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTask); // Return the updated task
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
