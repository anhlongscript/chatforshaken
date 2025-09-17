const socket = io();
let currentName = localStorage.getItem("username") || "Khách";

// Gửi tin nhắn
const form = document.getElementById("form");
const input = document.getElementById("input");

form.addEventListener("submit", function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", { username: currentName, message: input.value });
    input.value = "";
  }
});

// Nhận tin nhắn
socket.on("chat message", (msgData) => {
  const item = document.createElement("li");
  const nameSpan = document.createElement("span");
  nameSpan.textContent = msgData.username + ": ";

  // Màu đặc biệt cho tên
  if (msgData.username === "đứa trẻ ngầu nhất xóm OwO") {
    nameSpan.classList.add("rainbow-name");
  } else if (msgData.username === "anh ki ki ma ma uWu") {
    nameSpan.classList.add("red-name");
  }

  item.appendChild(nameSpan);
  item.appendChild(document.createTextNode(msgData.message));
  document.getElementById("messages").appendChild(item);
});

// Nút Voice
const voiceBtn = document.getElementById("voiceBtn");
const voicePanel = document.getElementById("voicePanel");
voiceBtn.addEventListener("click", () => {
  voicePanel.classList.toggle("hidden");
});

// Nút Settings
const settingsBtn = document.getElementById("settingsBtn");
const settingsPopup = document.getElementById("settingsPopup");
const saveSettings = document.getElementById("saveSettings");

settingsBtn.addEventListener("click", () => {
  settingsPopup.classList.toggle("hidden");
});

// Lưu tên hiển thị
saveSettings.addEventListener("click", () => {
  const newName = document.getElementById("displayName").value.trim();
  if (newName) {
    currentName = newName;
    alert("Tên hiển thị đã đổi thành: " + currentName);
    settingsPopup.classList.add("hidden");
  }
});
