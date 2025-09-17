const socket = io();

// Lấy username từ query string (sau khi login)
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username") || "Người lạ";

// DOM
const form = document.getElementById("chat-form");
const msgInput = document.getElementById("msg");
const messages = document.getElementById("messages");

// Xác định admin
const ADMIN_NAME = "đứa trẻ ngầu nhất xóm OwO";

// Gửi tin nhắn
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (msgInput.value.trim()) {
    socket.emit("chatMessage", { user: username, text: msgInput.value });
    msgInput.value = "";
  }
});

// Nhận tin nhắn
socket.on("chatMessage", (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");

  if (msg.user === ADMIN_NAME) {
    div.classList.add("admin");
  } else {
    div.classList.add("user");
  }

  div.textContent = `${msg.user}: ${msg.text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
