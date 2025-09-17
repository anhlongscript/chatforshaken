const socket = io();

// Lấy tên user từ localStorage
const username = localStorage.getItem("username") || "Ẩn danh";

// Đăng nhập khi vào chat
socket.emit("login", username);

socket.on("loginSuccess", (name) => {
  console.log("Đăng nhập thành công:", name);
});

// Danh sách user
socket.on("userList", (list) => {
  const ul = document.getElementById("userList");
  ul.innerHTML = "";
  list.forEach(user => {
    const li = document.createElement("li");

    if (user === username) {
      // Bảy sắc cầu vồng cho bạn
      li.innerHTML = `<span class="rainbow">${user}</span>`;
    } else {
      // Đỏ cho bạn của bạn
      li.style.color = "red";
      li.textContent = user;
    }

    ul.appendChild(li);
  });
});

// Nhận tin nhắn
socket.on("chatMessage", (data) => {
  const div = document.createElement("div");
  div.innerHTML = `<b>${data.user}:</b> ${data.msg}`;
  document.getElementById("messages").appendChild(div);
});

// Gửi tin nhắn
function sendMessage() {
  const input = document.getElementById("messageInput");
  const msg = input.value.trim();
  if (msg) {
    socket.emit("chatMessage", msg);
    input.value = "";
  }
}

// Nút setting
document.getElementById("settingsBtn").addEventListener("click", () => {
  alert("⚙️ Mở cài đặt (demo)");
});

// Nút voice
document.getElementById("voiceBtn").addEventListener("click", () => {
  alert("🎤 Voice chat chưa hỗ trợ (demo)");
});
