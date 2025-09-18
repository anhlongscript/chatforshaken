const socket = io();
const username = localStorage.getItem("username") || "Khách";

// Gửi tin nhắn
function sendMessage() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;
  socket.emit("chat message", { user: username, msg: input.value, type: "text" });
  input.value = "";
}

// Upload file
document.getElementById("fileUpload").addEventListener("change", function() {
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

// Render tin nhắn
function renderMessage(msgData) {
  const item = document.createElement("div");
  item.classList.add("message");

  let nameHtml = "";
  if (msgData.user === "đứa trẻ ngầu nhất xóm OwO") {
    nameHtml = `<span class="rainbow">${msgData.user}</span>`;
  } else if (msgData.user === "anh ki ki ma ma uWu") {
    nameHtml = `<span style="color:red">${msgData.user}</span>`;
  } else {
    nameHtml = `<b>${msgData.user}</b>`;
  }

  let content = "";
  if (msgData.type === "image") {
    content = `<br><img src="${msgData.msg}" style="max-width:200px; border-radius:8px;" onclick="openModal(this)">`;
  } else if (msgData.type === "video") {
    content = `<br><video src="${msgData.msg}" controls style="max-width:250px; border-radius:8px;"></video>`;
  } else {
    content = `: ${msgData.msg}`;
  }

  item.innerHTML = `${nameHtml} ${content}`;
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
socket.on("chat message", renderMessage);

// Modal xem ảnh
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
document.querySelector(".close").onclick = () => { modal.style.display = "none"; };
function openModal(img) {
  modal.style.display = "block";
  modalImg.src = img.src;
}

// Toggle âm thanh video nền
let isMuted = true;
function toggleSound() {
  const iframe = document.getElementById("bg-video");
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: "command", func: isMuted ? "unMute" : "mute", args: [] }),
    "*"
  );
  document.querySelector(".sound-btn").innerText = isMuted ? "🔇 Tắt tiếng" : "🔊 Bật tiếng";
  isMuted = !isMuted;
}
