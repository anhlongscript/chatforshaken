const socket = io();
const user = JSON.parse(localStorage.getItem("chatUser"));
if (!user) window.location.href = "login.html";

socket.emit("login", user);

// Hiển thị tin nhắn
socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.innerHTML = `<b>${msg.user}:</b> ${msg.message}`;
  document.getElementById("messages").appendChild(div);
});

// Hiển thị lịch sử chat
socket.on("chatHistory", (history) => {
  const messages = document.getElementById("messages");
  messages.innerHTML = "";
  history.forEach(msg => {
    const div = document.createElement("div");
    div.innerHTML = `<b>${msg.user}:</b> ${msg.message}`;
    messages.appendChild(div);
  });
});

// Tin nhắn hệ thống
socket.on("systemMessage", (text) => {
  const div = document.createElement("div");
  div.innerHTML = `<i style="color:orange;">${text}</i>`;
  document.getElementById("messages").appendChild(div);
});

// Gửi tin nhắn
document.getElementById("sendBtn").onclick = () => {
  const msg = document.getElementById("messageInput").value;
  if (msg.trim()) {
    socket.emit("message", msg);
    document.getElementById("messageInput").value = "";
  }
};

// Upload file
document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload", { method: "POST", body: formData })
    .then(res => res.json())
    .then(data => socket.emit("file", data.file));
});

// Cài đặt
document.getElementById("settingsBtn").onclick = () => {
  document.getElementById("settingsPanel").style.display = "block";
};

document.getElementById("saveSettingsBtn").onclick = () => {
  const newName = document.getElementById("newName").value;
  const oldKey = document.getElementById("oldKey").value;
  const newKey = document.getElementById("newKey").value;

  if (newName) {
    socket.emit("changeName", newName);
    user.name = newName;
  }
  if (oldKey && newKey) {
    socket.emit("changeKey", { oldKey, newKey });
    user.key = newKey;
  }
  localStorage.setItem("chatUser", JSON.stringify(user));
  alert("Đã lưu thay đổi!");
};

// Admin
document.getElementById("adminBtn").onclick = () => {
  document.getElementById("adminPanel").style.display = "block";
};

document.getElementById("muteBtn").onclick = () => {
  const target = document.getElementById("muteUser").value;
  const duration = document.getElementById("muteTime").value;
  socket.emit("muteUser", { target, duration });
};

document.getElementById("unmuteBtn").onclick = () => {
  const target = document.getElementById("muteUser").value;
  socket.emit("unmuteUser", target);
};
