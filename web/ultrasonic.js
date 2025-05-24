//////////////// RADAR ///////////////////////////

const canvas = document.getElementById("radar");
const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height;
const maxDistance = 40;
const radius = 280;

let currentAngle = 0;
let currentDistance = 0;
let detections = []; // stocke les points rouges

function drawRadar(angle, distance) {
  // effet de fondu 
  ctx.fillStyle = "rgba(0, 0, 0,.15)"; // BACKGROUND COLOR
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = .15;

  // Arcs
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, (radius / 4) * i, Math.PI, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText(`${i *10}cm`, centerX + ((radius / 4) * i) * Math.cos(Math.PI + 0.1), centerY - ((radius / 4) * i) * Math.sin(0.1));
    ctx.fillStyle = "rgb(255,255,255)";
  }

  // Lignes d’angle de 0 a 90 
  const angles = [0, 30, 60, 90];
  angles.forEach((a) => {
    let rad = (a * Math.PI) / 180;
    let x = centerX + radius * Math.cos(Math.PI + rad);
    let y = centerY - radius * Math.sin(rad);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillText(`${a}`, x - 10, y - 10);
  });

  // Lignes d’angle de 90 a 180 
  const angles1 = [120, 150, 180];
  angles1.forEach((a) => {
    let rad = (a * Math.PI) / 180;
    let x = centerX + radius * Math.cos(Math.PI + rad);
    let y = centerY - radius * Math.sin(rad);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillText(`${a}`, x + 2, y - 10);
  });


  // Ligne de balayage
  const sweepRad = (angle * Math.PI) / 180;
  const sweepX = centerX + radius * Math.cos(Math.PI + sweepRad);
  const sweepY = centerY - radius * Math.sin(sweepRad);
  ctx.strokeStyle = "green";
  ctx.lineWidth = .9;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(sweepX, sweepY);
  ctx.stroke();

  // Enregistrer les détections si distance valide
  if (distance <= maxDistance) {
    detections.push({ angle: angle, distance: distance, alpha: 1.0 });
  }

  // Afficher les détections en rouge
  detections.forEach((d) => {
    const totalLength = radius;
    const detectedLength = d.distance / maxDistance * radius;
  
    const angleRad = d.angle * Math.PI / 180;
    const xDetected = centerX + detectedLength * Math.cos(Math.PI + angleRad);
    const yDetected = centerY - detectedLength * Math.sin(angleRad);
  
    const xMax = centerX + totalLength * Math.cos(Math.PI + angleRad);
    const yMax = centerY - totalLength * Math.sin(angleRad);
  
    // Ligne vert point neutre jusqu'au obstacle
    ctx.strokeStyle = `rgba(0, 255, 0, ${d.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(xDetected, yDetected);
    ctx.stroke();
  
    // Ligne rouge de l’obstacle jusqu’au max
    ctx.strokeStyle = `rgba(255, 0, 0, ${d.alpha})`;
    ctx.beginPath();
    ctx.moveTo(xDetected, yDetected);
    ctx.lineTo(xMax, yMax);
    ctx.stroke();
  
    d.alpha -= .9;
  });
  
  
  // Mettre à jour l'affichage texte
  document.getElementById("angle").innerText = `${angle}°`;
  document.getElementById("distance").innerText = `${distance} cm`;
}









////////////////// DEMO //////////////////

currentAngle = 0;
let direction;
let radarInterval = null; // pour pouvoir l’arrêter

function demo_radar(active) {
  if (active) {
    radarInterval = setInterval(() => {
      if (currentAngle >= 180) {
        direction = "gauche";
      } else if (currentAngle <= 0) {
        direction = "droite";
      }

      if (direction === "droite") {
        currentAngle += 2;
      } else {
        currentAngle -= 2;
      }

      const currentDistance = Math.floor(Math.random() * (100 -0));
      drawRadar(currentAngle, (currentDistance));
    }, 80);
  } else  {
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = .1;

    detections = [];
    clearInterval(radarInterval);
    radarInterval = null;
    
  }

}



