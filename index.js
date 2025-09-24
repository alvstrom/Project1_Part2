const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET all postits
app.get("/api/postits", async (req, res) => {
  try {
    const postits = await prisma.postit.findMany();
    res.json({
      message: "Database connected!",
      count: postits.length,
      postits,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new postit
app.post("/api/postits", async (req, res) => {
  try {
    const { content, xPosition, yPosition, color, boardId, createdBy } =
      req.body;
    const postit = await prisma.postit.create({
      data: { content, xPosition, yPosition, color, boardId, createdBy },
    });
    res.status(201).json(postit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//PATCH - Update note
app.patch("/api/postits/:id", async (req, res) => {
  try {
    const updateData = req.body;
    const postit = await prisma.postit.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(postit);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Post-it not found" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

//DELETE - Delete post-it
app.delete("/api/postits/:id", async (req, res) => {
  try {
    await prisma.postit.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Post-it not found" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// GET all boards
app.get("/api/boards", async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: { postits: true },
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//POST - Create new board
app.post("/api/boards", async (req, res) => {
  try {
    const { name, description, createdBy, isPublic } = req.body;
    const board = await prisma.board.create({
      data: { name, description, createdBy, isPublic },
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update board

app.patch("/api/boards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const board = await prisma.board.update({
      where: { id },
      data: updateData,
    });
    res.json(board);
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Board not found" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

//DELETE - Delete board
app.delete("/api/boards/:id", async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Board not found" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.listen(3002, () => console.log("Server started on port 3002"));
