const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 3000;

// Users hợp lệ
const validUsers = {
  "đứa trẻ ngầu nhất xóm OwO": "adminvipdeptrainhatthegioi",
  "anh ki ki ma ma uWu": "phukikimama"
};

app.use(express.static(path.join(__dirname, "public")));

// Route mặc định → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// API login
app.get("/login", (req, res) => {
  const { username, key } = req.query;
  if (validUsers[username] && validUsers[username] === key) {
    res.send({ success: true });
  } else {
    res.send({ success: false, message: "Sai tài khoản hoặc key" });
  }
});

// Socket.io
io.on("connection", (socket) => {
  console.log("Một user đã kết nối");

  socket.on("chat message", (msgData) => {
    io.emit("chat message", msgData);
  });

  socket.on("disconnect", () => {
    console.log("User đã thoát");
  });
});

http.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
