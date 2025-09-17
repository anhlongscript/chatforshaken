const socket = io();
const username = localStorage.getItem("username") || "Khách";

// Gửi tin nhắn text
function sendMessage() {
  const input = document.getElementById("msg");
  if (input.value.trim() !== "") {
    socket.emit("chat message", { user: username, msg: input.value, type: "text" });
    input.value = "";
  }
}

// Upload file (ảnh / video)
document.getElementById("fileUpload")?.addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    let type = "file";
    if (file.type.startsWith("image/")) type = "image";
    else if (file.type.startsWith("video/")) type = "video";

    socket.emit("chat message", { user: username, msg: base64, type });
  };
  reader.readAsDataURL(file);
});

// Hàm render tin nhắn
function renderMessage(msgData) {
  const item = document.createElement("div");
  item.classList.add("message");

  // Chỉ đổi màu tên
  let nameHtml = "";
  if (msgData.user === "đứa trẻ ngầu nhất xóm OwO") {
    nameHtml = `<span class="rainbow">${msgData.user}</span>`;
  } else if (msgData.user === "anh ki ki ma ma uWu") {
    nameHtml = `<span class="red-name">${msgData.user}</span>`;
  } else {
    nameHtml = `<b>${msgData.user}</b>`;
  }

  // Nội dung tin nhắn giữ nguyên màu (mặc định trắng)
  let content = "";
  if (msgData.type === "image") {
    content = `<br><img src="${msgData.msg}" style="max-width:200px; border-radius:8px;">`;
  } else if (msgData.type === "video") {
    content = `<br><video src="${msgData.msg}" controls style="max-width:250px; border-radius:8px;"></video>`;
  } else {
    content = `: <span style="color:white">${msgData.msg}</span>`;
  }

  item.innerHTML = `${nameHtml}${content}`;
  document.getElementById("messages").appendChild(item);
  item.scrollIntoView();
}

// Nhận lịch sử
socket.on("chat history", (history) => {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";
  history.forEach(renderMessage);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Nhận tin nhắn mới
socket.on("chat message", (msgData) => {
  renderMessage(msgData);
});
