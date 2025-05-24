
////////////// WEBSOCKET ///////////////////
// Connexion WebSocket vers l’ESP32
let socket = new WebSocket("ws://192.168.4.1:81"); // IP de l'ESP32

// Lorsque la connexion WebSocket est établie
socket.onopen = function () {
  document.getElementById("socket").innerText = "ONLINE";
  document.getElementById("socket").style.color = "lime";
  console.log("WebSocket connecté.");
  ESPStatus(1); // met l'état ESP en connecté
};

// Lorsque la connexion WebSocket est fermée
socket.onclose = function () {
  console.log("WebSocket déconnecté.");
  document.getElementById("socket").innerText = "OFFLINE";
  document.getElementById("socket").style.color = "red";
  ESPStatus(0); // met l'état ESP en déconnecté

};






/////////////// VITESSE ///////////////////

const speedSlider = document.getElementById("speedRange"); // input range
const speedValue = document.getElementById("speedValue");  // valeur affichée






/////////////// ENVOYER COMMANDE ///////////////////
// Quand on change la vitesse avec le slider
speedSlider.addEventListener("input", () => {
  speedValue.textContent = speedSlider.value; // affiche la valeur

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(`V${speedSlider.value}`); // envoie ex: V120
  }
});

// Envoie d'une commande à l'ESP32
function sendCommand(cmd) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(cmd);
  }
}

// Associe chaque bouton à une commande (avant, arrière, gauche, droite, stop)
document.getElementById("btnF").addEventListener("click", () => sendCommand("F"));
document.getElementById("btnB").addEventListener("click", () => sendCommand("B"));
document.getElementById("btnL").addEventListener("click", () => sendCommand("L"));
document.getElementById("btnR").addEventListener("click", () => sendCommand("R"));
document.getElementById("btnS").addEventListener("click", function(){
     sendCommand("S") 
     speedSlider.value = 0;
     speedValue.textContent = 0;
})


let servo_manuel = false;
const modeCheckbox = document.getElementById("checkbox1");
const modeLabel = document.getElementById("modeLabel");
const angleInput = document.getElementById("angleInput");

modeCheckbox.addEventListener("change", () => {
  if (modeCheckbox.checked) {
    socket.send("AUTO");
    modeLabel.textContent = "Auto";
    modeLabel.classList.replace("text-green-500", "text-red-500");
    angleInput.disabled = true;
    servo_manuel = false;
  } else {
    socket.send("AUTO_OFF");
    servo_manuel = true;
    modeLabel.textContent = "Manuel";
    modeLabel.classList.replace("text-red-500", "text-green-500");
    angleInput.disabled = false;
  }
});

angleInput.addEventListener("change", () => {
  if (!modeCheckbox.checked && socket.readyState === WebSocket.OPEN && servo_manuel === true) {
    socket.send("M" + angleInput.value);  // ex: A90
  }
});


/////////////// RECEVOIR DONNÉES ///////////////////

// Lorsqu'on reçoit un message depuis l'ESP32
socket.onmessage = function (event) {
  const msg = event.data;

  // Format attendu : ANGLE:xx DIST:yy
  if (msg.startsWith("ANGLE:")) {
    const parts = msg.split(" ");
    const angle = parts[0].split(":")[1];
    const distance = parts[1].split(":")[1];

    // Met à jour l'affichage
    document.getElementById("angle").textContent = `${angle}°`;
    document.getElementById("distance").textContent = `${distance} cm`;

    // Met à jour le radar si fonction dispo
    //drawRadar(angle, distance);
  }
};
