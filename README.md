# 🤖 Robot 2WD ESP32 – Contrôle WiFi

Projet de robot connecté réalisé dans le cadre de la SAE à l'IUT de Villetaneuse – BUT GEII.


Ce robot est contrôlé à distance via un site web hébergé en local sur le pc, permettant le pilotage des moteurs et la visualisation de l'environnement grâce à un capteur ultrason.

---


--- INFO 
Le projet SAE reposait initialement sur un contrôle infrarouge déjà fonctionnel avec l’ensemble des codes. Mon avance sur le développement m’a permis de modifier et d’améliorer ce projet en intégrant un ESP32, permettant un contrôle à distance via WiFi et une interface web.


## 🖼️ Aperçu du robot
![image](https://github.com/user-attachments/assets/e9dd20d9-d72d-47b8-8b69-963dcef16dba)

---

## ⚙️ Fonctionnalités principales

- 🔌 Connexion en WiFi mode point d’accès
- 🌐 Interface web intégrée : aucun logiciel externe requis
- 🎮 Contrôle en temps réel des moteurs via clavier depuis  le site
- 📡 Capteur ultrason monté sur un servo : détection des obstacles
- 📈 Visualisation type radar sur le site (WebSocket)
- 💡 Contrôle du servomoteur, caméra et autres périphériques depuis le site
- 📶 Prévu pour communication radio **NRF24L01** avec un Arduino

---

## 🧰 Matériel utilisé

- 1x ESP32 DevKit
- 1x Servo moteur SG90
- 1x Capteur ultrason HC-SR04
- 1x L298N ou module moteur double
- 2x Moteurs DC avec roues
- 1x Châssis 2 roues + support batterie
- (Optionnel) 1x ESP32-CAM

---

## 🧑‍💻 Technologies

- C++ avec Arduino / PlatformIO
- HTML / CSS / JavaScript pour l’interface Web
- WebSocket pour la communication temps réel


---

