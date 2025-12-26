import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { prisma } from "@repo/db";
import { JWT_SECRET } from "@repo/common-backend";
import { middleware } from "./middleware";
import {
  SigninSchema,
  CreateRoomSchema,
  CreateUserSchema,
} from "@repo/common";

dotenv.config();

const app = express();
const saltRounds = 10;

app.use(express.json());

/* -------------------- SIGN UP -------------------- */
app.post("/signup", async (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Incorrect input",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(
      parsed.data.password,
      saltRounds
    );

    const user = await prisma.user.create({
      data: {
        email: parsed.data.username,
        password: hashedPassword,
        name: parsed.data.name,
      },
    });

    res.json({
      userId: user.id,
    });
  } catch (error) {
    return res.status(409).json({
      message: "User already exists",
    });
  }
});

/* -------------------- SIGN IN -------------------- */
app.post("/signin", async (req, res) => {
  const parsed = SigninSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Incorrect input",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.username,
    },
  });

  if (!user) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    parsed.data.password,
    user.password
  );

  if (!isPasswordValid) {
    return res.status(403).json({
      message: "Not authorized",
    });
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

/* -------------------- CREATE ROOM -------------------- */
app.post("/room", middleware, async (req, res) => {
  const parsed = CreateRoomSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Incorrect input",
    });
  }

  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const room = await prisma.room.create({
      data: {
        slug: parsed.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (error) {
    return res.status(409).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chats/:roomId",async(req,res)=>{
  const roomId=Number(req.params.roomId);
  const message=await prisma.chat.findMany({
    where:{
      roomId:roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
  });
  res.json({
    message
  });
})

app.get("/room/:slug",async(req,res)=>{
  const slug=req.params.slug;
  const room=await prisma.room.findFirst({
    where:{
      slug
    }
  })
  res.json({
    room
  })
})

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.json({
    message: "server is up",
  });
});

/* -------------------- START SERVER -------------------- */
app.listen(3000, () => {
  console.log("HTTP server is up at port 3000");
});
