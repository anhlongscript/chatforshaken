const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// phục vụ file tĩnh (ví dụ index.html)
app.use(express.static("public"));

// xử lý socket.io
io.on("connection", (socket) => {
  console.log("Người dùng đã kết nối");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Ngắt kết nối");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server chạy ở cổng ${PORT}`);
});
