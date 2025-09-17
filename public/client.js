const socket = io();

// --- Chat ---
const form = document.getElementById("chat-form");
const input = document.getElementById("msg");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", (msg) => {
  const item = document.createElement("div");
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

// --- Voice ---
const peers = {};
let localStream;

document.querySelectorAll("#voice-rooms li").forEach(li => {
  li.addEventListener("click", async () => {
    const roomId = li.getAttribute("data-room");
    await joinVoice(roomId);
  });
});

async function joinVoice(roomId) {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  socket.emit("join-voice", roomId);

  socket.on("user-joined", async (id) => {
    const pc = createPeerConnection(id);
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { target: id, sdp: offer });
  });

  socket.on("offer", async (data) => {
    const pc = createPeerConnection(data.from);
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", { target: data.from, sdp: answer });
  });

  socket.on("answer", async (data) => {
    await peers[data.from].setRemoteDescription(new RTCSessionDescription(data.sdp));
  });

  socket.on("candidate", (data) => {
    peers[data.from].addIceCandidate(new RTCIceCandidate(data.candidate));
  });

  socket.on("user-left", (id) => {
    if (peers[id]) {
      peers[id].close();
      delete peers[id];
      const audio = document.getElementById(id);
      if (audio) audio.remove();
    }
  });
}

function createPeerConnection(id) {
  const pc = new RTCPeerConnection();
  peers[id] = pc;

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", { target: id, candidate: event.candidate });
    }
  };

  pc.ontrack = (event) => {
    let audio = document.getElementById(id);
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = id;
      audio.autoplay = true;
      document.getElementById("voice-container").appendChild(audio);
    }
    audio.srcObject = event.streams[0];
  };

  return pc;
}

// --- Settings ---
document.getElementById("settings-btn").addEventListener("click", () => {
  alert("Tùy chỉnh tên (sẽ thêm sau).");
});
