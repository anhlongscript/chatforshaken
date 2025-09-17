const socket = io();
let username = localStorage.getItem("username");
let key = localStorage.getItem("key");

if (!username || !key) {
  window.location.href = "/";
}

// Nhận lịch sử tin nhắn
socket.on("chatHistory", (msgs) => {
  msgs.forEach(addMessage);
});

// Nhận tin nhắn mới
socket.on("chatMessage", (msg) => {
  addMessage(msg);
});

// Nếu bị mute
socket.on("muted", (data) => {
  const until = new Date(data.until).toLocaleString();
  alert(`Bạn đang bị mute đến: ${until}`);
});

function sendMessage() {
  const text = document.getElementById("msgInput").value.trim();
  if (!text) return;
  socket.emit("chatMessage", { user: username, text, type: "text" });
  document.getElementById("msgInput").value = "";
}

function addMessage(msg) {
  const div = document.createElement("div");

  // Đổi màu tên
  let color = "black";
  if (msg.user === "đứa trẻ ngầu nhất xóm OwO") color = "rainbow";
  if (msg.user === "anh ki ki ma ma uWu") color = "red";

  div.innerHTML = `<b style="color:${color};">${msg.user}:</b> `;

  if (msg.type === "file") {
    if (msg.url.match(/\.(mp4|webm|ogg)$/)) {
      div.innerHTML += `<video src="${msg.url}" controls width="200"></video>`;
    } else {
      div.innerHTML += `<img src="${msg.url}" width="200">`;
    }
  } else {
    div.innerHTML += msg.text;
  }

  document.getElementById("chatBox").appendChild(div);
}

// Upload file
document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/upload", { method: "POST", body: formData });
  const data = await res.json();
  socket.emit("chatMessage", { user: username, type: "file", url: data.url });
});

// ---------------- Cài đặt ----------------
document.getElementById("settingsBtn").onclick = () => {
  document.getElementById("settingsPopup").classList.remove("hidden");
};
function closeSettings() {
  document.getElementById("settingsPopup").classList.add("hidden");
}

function saveSettings() {
  const newName = document.getElementById("newName").value.trim();
  const oldKey = document.getElementById("oldKey").value.trim();
  const newKey = document.getElementById("newKey").value.trim();

  if (newName) username = newName;
  if (oldKey === key && newKey) key = newKey;

  localStorage.setItem("username", username);
  localStorage.setItem("key", key);
  alert("Đã lưu cài đặt! Đăng nhập lần sau nhớ dùng tên/key mới.");
  closeSettings();
}

// ---------------- Admin ----------------
if (username === "đứa trẻ ngầu nhất xóm OwO") {
  const btn = document.createElement("button");
  btn.textContent = "Admin Panel";
  btn.onclick = () => document.getElementById("adminPanel").classList.remove("hidden");
  document.body.appendChild(btn);
}

document.getElementById("muteDuration").addEventListener("change", (e) => {
  document.getElementById("customMute").style.display = e.target.value === "custom" ? "inline-block" : "none";
});

async function muteUser() {
  const target = document.getElementById("targetUser").value.trim();
  let duration = document.getElementById("muteDuration").value;
  if (duration === "custom") duration = parseInt(document.getElementById("customMute").value || "0");

  const res = await fetch("/mute-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin: username, target, duration })
  });
  const data = await res.json();
  alert(data.message);
}

async function unmuteUser() {
  const target = document.getElementById("targetUser").value.trim();
  const res = await fetch("/unmute-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin: username, target })
  });
  const data = await res.json();
  alert(data.message);
}

function closeAdmin() {
  document.getElementById("adminPanel").classList.add("hidden");
}
