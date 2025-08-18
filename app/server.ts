// server.ts o api/socket.ts
import { Server } from "socket.io";
import prisma from "./prisma";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3001", // tu frontend
    methods: ["GET", "POST"]
  }
});


// Middleware de Prisma para emitir cambios
prisma.$use(async (params, next) => {
  const result = await next(params);

  if (["create", "update", "delete"].includes(params.action)) {
    io.emit("dbChange", {
      model: params.model,
      action: params.action,
      data: result,
    });
  }

  return result;
});

io.on("connection", (socket) => {
  console.log("Cliente conectado ✅");
});

