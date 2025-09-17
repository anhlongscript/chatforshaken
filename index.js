const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Fake database users
const users = {
  "đứa trẻ ngầu nhất xóm OwO": "adminvipdeptrainhatthegioi", // admin
  "anh ki ki ma ma uWu": "phukikimama" // bạn
};

// Route xử lý login
app.post("/login", (req, res) => {
  const { username, key } = req.body;
  if (users[username] && users[username] === key) {
    return res.redirect(`/chat.html?username=${encodeURIComponent(username)}`);
  }
  res.send("<h2>Sai tài khoản hoặc key! <a href='/login.html'>Thử lại</a></h2>");
});

// Route mặc định → login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// Socket.io
io.on("connection", (socket) => {
  console.log("Người dùng mới kết nối");

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("Người dùng ngắt kết nối");
  });
});

http.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
