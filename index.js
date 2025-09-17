const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Người dùng kết nối:", socket.id);

  socket.on("join-room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);

    if (room && room.size >= 5) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);

    socket.on("signal", (data) => {
      io.to(data.to).emit("signal", { from: socket.id, signal: data.signal });
    });

    socket.on("chat message", (msg) => {
      io.to(roomId).emit("chat message", { user: socket.id, text: msg });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-left", socket.id);
      console.log("Ngắt kết nối:", socket.id);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server chạy ở cổng ${PORT}`));
