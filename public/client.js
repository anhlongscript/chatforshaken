let socket;
let username = localStorage.getItem("username");

function login() {
  const user = document.getElementById("username").value;
  const key = document.getElementById("key").value;

  fetch(`/login?username=${encodeURIComponent(user)}&key=${encodeURIComponent(key)}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("username", user);
        window.location.href = "chat.html";
      } else {
        document.getElementById("error").innerText = data.message;
      }
    });
}

if (window.location.pathname.endsWith("chat.html")) {
  if (!username) window.location.href = "login.html";

  socket = io();

  socket.on("chat message", (msgData) => {
    const item = document.createElement("div");
    item.classList.add("message");

    // màu tên
    if (msgData.user === "đứa trẻ ngầu nhất xóm OwO") {
      item.innerHTML = `<span class="rainbow">${msgData.user}</span>: ${msgData.msg}`;
    } else if (msgData.user === "anh ki ki ma ma uWu") {
      item.innerHTML = `<span style="color:red">${msgData.user}</span>: ${msgData.msg}`;
    } else {
      item.innerHTML = `<b>${msgData.user}</b>: ${msgData.msg}`;
    }

    document.getElementById("messages").appendChild(item);
    item.scrollIntoView();
  });

  document.getElementById("voice-btn").addEventListener("click", () => {
    alert("🎤 Voice chat tạm demo, sẽ nâng cấp sau!");
  });

  document.getElementById("settings-btn").addEventListener("click", () => {
    const newName = prompt("Nhập tên mới:");
    if (newName) {
      localStorage.setItem("username", newName);
      username = newName;
      alert("✅ Đã đổi tên!");
    }
  });
}

function sendMessage() {
  const input = document.getElementById("msg");
  if (input.value.trim() !== "") {
    socket.emit("chat message", { user: username, msg: input.value });
    input.value = "";
  }
}
