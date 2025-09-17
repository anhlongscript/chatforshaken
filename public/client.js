const socket = io();
const peers = {};
const roomId = "room1"; // có thể cho user nhập roomId riêng

// --- Chat text ---
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", input.value);
    input.value = "";
  }
});

socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  item.textContent = `${msg.user}: ${msg.text}`;
  messages.appendChild(item);
});

// --- Voice ---
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  socket.emit("join-room", roomId);

  socket.on("room-full", () => {
    alert("Phòng đã đầy (tối đa 5 người)!");
  });

  socket.on("user-joined", (id) => {
    createPeerConnection(id, stream, true);
  });

  socket.on("signal", async (data) => {
    let pc = peers[data.from];
    if (!pc) {
      pc = createPeerConnection(data.from, stream, false);
    }

    if (data.signal.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
      if (pc.remoteDescription.type === "offer") {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal", { to: data.from, signal: { sdp: pc.localDescription } });
      }
    }

    if (data.signal.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
      } catch (e) {
        console.error("Lỗi addIceCandidate", e);
      }
    }
  });

  socket.on("user-left", (id) => {
    if (peers[id]) {
      peers[id].close();
      delete peers[id];
    }
    const audioEl = document.getElementById("audio-" + id);
    if (audioEl) audioEl.remove();
  });

  function createPeerConnection(id, stream, isOfferer) {
    const pc = new RTCPeerConnection();
    peers[id] = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      let audio = document.getElementById("audio-" + id);
      if (!audio) {
        audio = document.createElement("audio");
        audio.id = "audio-" + id;
        audio.autoplay = true;
        audio.srcObject = e.streams[0];
        document.getElementById("audios").appendChild(audio);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", { to: id, signal: { candidate: e.candidate } });
      }
    };

    if (isOfferer) {
      pc.createOffer().then(o => pc.setLocalDescription(o)).then(() => {
        socket.emit("signal", { to: id, signal: { sdp: pc.localDescription } });
      });
    }
    return pc;
  }
});
