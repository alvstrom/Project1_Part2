const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

//jwt auth middleware

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};
// GET all postits
app.get("/api/postits", authenticateToken, async (req, res) => {
  try {
    const postits = await prisma.postit.findMany({
      where: { createdBy: req.user.id },
    });
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
app.post("/api/postits", authenticateToken, async (req, res) => {
  try {
    const { content, xPosition, yPosition, color, boardId } = req.body;
    const postit = await prisma.postit.create({
      data: {
        content,
        xPosition,
        yPosition,
        color,
        boardId,
        createdBy: req.user.id,
      },
    });
    res.status(201).json(postit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//PATCH - Update note
app.patch("/api/postits/:id", authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    const postit = await prisma.postit.update({
      where: { id: req.params.id, createdBy: req.user.id },
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
app.delete("/api/postits/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.postit.delete({
      where: { id: req.params.id, createdBy: req.user.id },
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
app.get("/api/boards", authenticateToken, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: { postits: true },
      where: { createdBy: req.user.id },
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//POST - Create new board
app.post("/api/boards", authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const board = await prisma.board.create({
      data: { name, description, isPublic, createdBy: req.user.id },
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update board

app.patch("/api/boards/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const board = await prisma.board.update({
      where: { id, createdBy: req.user.id },
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
app.delete("/api/boards/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id, createdBy: req.user.id },
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
