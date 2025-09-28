const fs = require("fs/promises");
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  authenticateToken,
  validatePostit,
  validateBoard,
} = require("./middleware");

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
app.use(cors());
app.use(express.json());

app.get("/api/wake-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    res.json({
      message: "Database is awake!",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to wake database: " + error.message,
    });
  }
});

app.get("/api/postits", authenticateToken, async (req, res) => {
  try {
    const postits = await prisma.postit.findMany({
      where: { createdBy: req.user.userId },
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

app.post(
  "/api/postits",
  authenticateToken,
  validatePostit,
  async (req, res) => {
    try {
      const { content, xPosition, yPosition, color, boardId } = req.body;
      if (!content || !boardId) {
        return res.status(400).json({
          error: "Content and boardId are required for creating post-its",
        });
      }
      const postit = await prisma.postit.create({
        data: {
          content,
          xPosition,
          yPosition,
          color,
          boardId,
          createdBy: req.user.userId,
        },
      });
      res.status(201).json(postit);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

app.patch(
  "/api/postits/:id",
  authenticateToken,
  validatePostit,
  async (req, res) => {
    try {
      const updateData = req.body;
      const postit = await prisma.postit.update({
        where: { id: req.params.id, createdBy: req.user.userId },
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
  }
);

app.delete("/api/postits/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.postit.delete({
      where: { id: req.params.id, createdBy: req.user.userId },
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

app.get("/api/boards", authenticateToken, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: { postits: true },
      where: { createdBy: req.user.userId },
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/boards", authenticateToken, validateBoard, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Board name is required for creating boards",
      });
    }

    const board = await prisma.board.create({
      data: { name, description, isPublic, createdBy: req.user.userId },
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch(
  "/api/boards/:id",
  authenticateToken,
  validateBoard,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const board = await prisma.board.update({
        where: { id, createdBy: req.user.userId },
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
  }
);

app.delete("/api/boards/:id", authenticateToken, async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id, createdBy: req.user.userId },
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

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(3002, () => console.log("Server started on port 3002"));
