//////////// ESP ///////////////////

// Met à jour l'affichage de l'état de l'ESP32 (connecté ou non)
function ESPStatus(connected) {
  const status = document.getElementById("status");
  if (connected) {
    status.textContent = "CONNECTED"; 
    status.classList.remove("text-red-500");
    status.classList.add("text-green-500");
  } else {
    status.textContent = "OFFLINE"; 
    status.classList.remove("text-green-500");
    status.classList.add("text-red-500");
  }
}



////////////// CAM ///////////////////
// Met à jour l'affichage de l'état de la caméra (ESP32-CAM)
function Device(connected) {
  const status = document.getElementById("device");
  if (connected) {
    status.textContent = "ESP32-CAM";
    status.classList.remove("text-red-500");
    status.classList.add("text-green-500");
  } else {
    status.textContent = "OFFLINE";
    status.classList.remove("text-green-500");
    status.classList.add("text-red-500");
  }
}

Device(0); // Par défaut, la caméra est déconnectée


/////////// DEMO ET ESP32 ACTIF /////////////

const esp32 = document.getElementById("checkbox");      // Mode ESP32 
const onesp32 = document.getElementById("onesp32")       // Bloc d'affichage  controle
const demo_btn = document.getElementById("checkbox5")       // demo radar
let status_controle = false; // bouton actif


// Gestion du comportement lors du clic sur un bouton
function toggle() {
  if (esp32.checked) {
    startESP32();  // si coché → on démarre le  ESP32 Bloc d'affichage controle
    status_controle = true;
  } else {
    stopESP32();   // sinon on arrête le  ESP32 Bloc d'affichage controle
    status_controle = false;
  }
}



let active = null;
let Alert = false;

function toggle(btn) {
  if (active === btn) {
    btn.classList.remove("active");
    active = null;

    if (btn === esp32) {
      stopESP32();
      demo_radar(false);
      alert_esp();
      Alert = true;
      // Réactiver DEMO
      demo_btn.disabled = false;
      demo_btn.nextElementSibling.classList.remove("opacity-50", "pointer-events-none");
    }

    if (btn === demo_btn) {
      demo_radar(false);
      // Réactiver ESP32
      esp32.disabled = false;
      esp32.nextElementSibling.classList.remove("opacity-50", "pointer-events-none");
    }

  } else {
    if (active) active.classList.remove("active");
    btn.classList.add("active");
    active = btn;

    if (btn === esp32) {
      startESP32();
      demo_radar(false);

      // Désactiver DEMO
      demo_btn.checked = false;
      demo_btn.disabled = true;
      demo_btn.nextElementSibling.classList.add("opacity-50", "pointer-events-none");
    }

    if (btn === demo_btn) {
      demo_radar(true);
      stopESP32();

      // Désactiver ESP32
      esp32.checked = false;
      esp32.disabled = true;
      esp32.nextElementSibling.classList.add("opacity-50", "pointer-events-none");
    }
  }
}

esp32.addEventListener("click", () => toggle(esp32));
demo_btn.addEventListener("click", () => toggle(demo_btn));

// Démarrage de l'ESP32 avec affichage du bloc uniquement si WebSocket actif
function startESP32() {
 
  onesp32.classList.remove("hidden");
}

// Arrêt de l'ESP32 avec masquage du bloc
function stopESP32() {
  
  onesp32.classList.add("hidden");
}


function alert_esp(){
  if (!Alert) {
    window.alert("Attente de connexion à l'ESP32 (WEBSOCKET)");
  }
}



/////////////// CLAVIER ///////////////////

// Active le contrôle clavier (ZQSD + espace)
function test() {
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    const btnMap = {
      "z": "btnF", // avant
      "s": "btnB", // arrière
      "q": "btnL", // gauche
      "d": "btnR", // droite
      " ": "btnS"  // stop
    };

    if (btnMap[key]) {
      const btn = document.getElementById(btnMap[key]);
      btn.classList.add("bg-green-700");
      btn.click(); // envoie la commande
    }
  });

  document.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    const btnMap = {
      "z": "btnF",
      "s": "btnB",
      "q": "btnL",
      "d": "btnR",
      " ": "btnS"
    };

    if (btnMap[key]) {
      const btn = document.getElementById(btnMap[key]);
      btn.classList.remove("bg-green-700"); // retire l'effet
    }
  });
}

test(); // active le contrôle clavier

