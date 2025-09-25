const jwt = require("jsonwebtoken");
const { z } = require("zod");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("JWT Error:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    user.id = user.id || user.sub;
    req.user = user;
    next();
  });
};

// Zod for creation and update validation
const postitSchema = z.object({
  content: z.string().trim().min(1).max(500).optional(),
  boardId: z.string().min(1).optional(),
  xPosition: z.number().int().min(0).max(10000).optional(),
  yPosition: z.number().int().min(0).max(10000).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

const boardSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
});

// Generic validator
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.issues && Array.isArray(error.issues)) {
      // Returns first validation error message
      return res.status(400).json({
        error: error.issues[0].message,
      });
    }

    return res.status(400).json({
      error: "Validation failed",
    });
  }
};

const validatePostit = validate(postitSchema);
const validateBoard = validate(boardSchema);

module.exports = { authenticateToken, validatePostit, validateBoard };
