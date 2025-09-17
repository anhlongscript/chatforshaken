const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Lưu file upload (ảnh, video)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ------------------ DATA ------------------
const users = {
  "đứa trẻ ngầu nhất xóm OwO": "adminvipdeptrainhatthegioi",
  "anh ki ki ma ma uWu": "phukikimama"
};
const messages = []; // lưu tất cả tin nhắn
const mutedUsers = {}; // { username: timestamp hết hạn }

// ------------------ ROUTES ------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public/chat.html"));
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ url: "/uploads/" + req.file.filename });
});

app.post("/mute-user", (req, res) => {
  const { admin, target, duration } = req.body;
  if (admin !== "đứa trẻ ngầu nhất xóm OwO") {
    return res.json({ success: false, message: "Không có quyền!" });
  }
  const endTime = Date.now() + duration * 1000;
  mutedUsers[target] = endTime;
  return res.json({ success: true, message: `${target} bị mute trong ${duration} giây` });
});

app.post("/unmute-user", (req, res) => {
  const { admin, target } = req.body;
  if (admin !== "đứa trẻ ngầu nhất xóm OwO") {
    return res.json({ success: false, message: "Không có quyền!" });
  }
  delete mutedUsers[target];
  return res.json({ success: true, message: `${target} đã được unmute` });
});

// ------------------ SOCKET ------------------
io.on("connection", (socket) => {
  console.log("User đã kết nối");

  // Gửi tin nhắn cũ khi mới vào
  socket.emit("chatHistory", messages);

  socket.on("chatMessage", (msg) => {
    const { user, text, type, url } = msg;

    // Check mute
    if (mutedUsers[user] && mutedUsers[user] > Date.now()) {
      socket.emit("muted", { until: mutedUsers[user] });
      return;
    }

    messages.push(msg);
    io.emit("chatMessage", msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server chạy tại cổng " + PORT));
