const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const multer = require("multer");
const path = require("path");

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: "/uploads/" + req.file.filename });
});

// Dữ liệu server
let users = {};         // { socketId: { name, key, mutedUntil } }
let chatHistory = [];   // [{ user, message, time }]

// Route mặc định -> login.html
app.get("/", (req, res) => res.sendFile(__dirname + "/public/login.html"));

// Socket
io.on("connection", (socket) => {
  console.log("Một user đã kết nối");

  socket.on("login", ({ name, key }) => {
    users[socket.id] = { name, key, mutedUntil: 0 };
    socket.emit("chatHistory", chatHistory);
    io.emit("userList", Object.values(users).map(u => u.name));
  });

  socket.on("message", (msg) => {
    const user = users[socket.id];
    if (!user) return;
    if (Date.now() < user.mutedUntil) {
      socket.emit("systemMessage", "Bạn đang bị mute!");
      return;
    }
    const newMsg = { user: user.name, message: msg, time: Date.now() };
    chatHistory.push(newMsg);
    io.emit("message", newMsg);
  });

  socket.on("file", (fileUrl) => {
    const user = users[socket.id];
    if (!user) return;
    const newMsg = { user: user.name, message: `<a href="${fileUrl}" target="_blank">${fileUrl}</a>`, time: Date.now() };
    chatHistory.push(newMsg);
    io.emit("message", newMsg);
  });

  socket.on("changeName", (newName) => {
    if (users[socket.id]) {
      users[socket.id].name = newName;
      io.emit("systemMessage", `User đổi tên thành ${newName}`);
      io.emit("userList", Object.values(users).map(u => u.name));
    }
  });

  socket.on("changeKey", ({ oldKey, newKey }) => {
    if (users[socket.id] && users[socket.id].key === oldKey) {
      users[socket.id].key = newKey;
      socket.emit("systemMessage", "Đổi key thành công!");
    } else {
      socket.emit("systemMessage", "Key cũ không đúng!");
    }
  });

  socket.on("muteUser", ({ target, duration }) => {
    for (let id in users) {
      if (users[id].name === target) {
        users[id].mutedUntil = Date.now() + duration * 1000;
        io.to(id).emit("systemMessage", `Bạn đã bị mute ${duration} giây`);
      }
    }
  });

  socket.on("unmuteUser", (target) => {
    for (let id in users) {
      if (users[id].name === target) {
        users[id].mutedUntil = 0;
        io.to(id).emit("systemMessage", "Bạn đã được unmute!");
      }
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", Object.values(users).map(u => u.name));
    console.log("User đã thoát");
  });
});

http.listen(PORT, () => console.log(`Server chạy tại cổng ${PORT}`));
