const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Danh sách user
let users = {};

// Socket
io.on("connection", (socket) => {
  console.log("Một user đã kết nối");

  socket.on("login", (username) => {
    users[socket.id] = username;
    socket.emit("loginSuccess", username);
    io.emit("userList", Object.values(users));
    console.log(`${username} đã đăng nhập`);
  });

  socket.on("chatMessage", (msg) => {
    const user = users[socket.id] || "Ẩn danh";
    io.emit("chatMessage", { user, msg });
  });

  socket.on("disconnect", () => {
    console.log("User đã thoát");
    delete users[socket.id];
    io.emit("userList", Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
