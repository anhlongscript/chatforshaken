const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

let messages = [];

// Điều hướng về login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

io.on("connection", (socket) => {
  console.log("Một user đã kết nối");

  // Gửi lịch sử chat cho client mới
  socket.emit("chat history", messages);

  // Nhận tin nhắn mới
  socket.on("chat message", (msgData) => {
    messages.push(msgData);
    if (messages.length > 100) messages.shift(); // chỉ giữ 100 tin nhắn gần nhất
    io.emit("chat message", msgData);
  });

  socket.on("disconnect", () => {
    console.log("User đã thoát");
  });
});

http.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
