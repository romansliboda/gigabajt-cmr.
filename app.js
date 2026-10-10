const robot = document.getElementById('robot');
const scene = document.getElementById('scene');
const bubble = document.getElementById('bubble');
const weatherPill = document.getElementById('weatherPill');
const tv = document.getElementById('tv');

const btnRoam = document.getElementById('btnRoam');
const btnTv = document.getElementById('btnTv');
const btnGreet = document.getElementById('btnGreet');

let mode = 'tv';
let roamTimer = null;
let blinkTimer = null;
let greetTimer = null;
let currentStep = 0;

const roamSteps = [
  { left: 90,  top: 210, cls: 'move-right', text: '↔️ Jedzie w prawo' },
  { left: 340, top: 210, cls: 'move-right', text: '↔️ Jedzie w prawo' },
  { left: 470, top: 165, cls: 'move-back',  text: '↕️ Jedzie w głąb pokoju' },
  { left: 210, top: 145, cls: 'move-left',  text: '↔️ Jedzie w lewo' },
  { left: 80,  top: 245, cls: 'move-front', text: '↕️ Jedzie do przodu' }
];

function setRobotPose(cls) {
  robot.classList.remove('move-right', 'move-left', 'move-back', 'move-front', 'face-front', 'face-tv', 'flip-tv', 'happy');
  robot.classList.add(cls);
}

function placeRobot(left, top) {
  robot.style.left = left + 'px';
  robot.style.top = top + 'px';
}

function startBlinking() {
  clearInterval(blinkTimer);
  blinkTimer = setInterval(() => {
    robot.classList.add('blink');
    setTimeout(() => robot.classList.remove('blink'), 240);
  }, 2400);
}

function stopRoam() {
  clearInterval(roamTimer);
  roamTimer = null;
}

function setTv(on) {
  tv.classList.toggle('on', on);
  tv.classList.toggle('stand-by', !on);
}

function startTVMode() {
  mode = 'tv';
  stopRoam();
  clearTimeout(greetTimer);
  bubble.classList.add('hidden');
  weatherPill.textContent = '📺 Ogląda telewizor';
  setTv(true);
  setRobotPose('move-right');
  robot.classList.remove('happy');
  placeRobot(window.innerWidth < 700 ? 180 : 470, window.innerWidth < 700 ? 214 : 205);
}

function startRoamMode() {
  mode = 'roam';
  setTv(false);
  bubble.classList.add('hidden');
  robot.classList.remove('happy');
  currentStep = 0;
  doRoamStep();
  stopRoam();
  roamTimer = setInterval(doRoamStep, 2300);
}

function doRoamStep() {
  const step = roamSteps[currentStep % roamSteps.length];
  setRobotPose(step.cls);
  weatherPill.textContent = step.text;
  placeRobot(step.left, step.top);
  currentStep++;
}

function greet() {
  mode = 'greet';
  stopRoam();
  setTv(false);
  placeRobot(window.innerWidth < 700 ? 120 : 300, window.innerWidth < 700 ? 188 : 185);
  setRobotPose('face-front');
  robot.classList.add('happy');
  weatherPill.textContent = '👋 Przywitanie';
  bubble.classList.remove('hidden');
  bubble.textContent = 'Cześć, co słychać?';
  clearTimeout(greetTimer);
  greetTimer = setTimeout(() => {
    robot.classList.remove('happy');
    startTVMode();
  }, 3200);
}

btnRoam.addEventListener('click', startRoamMode);
btnTv.addEventListener('click', startTVMode);
btnGreet.addEventListener('click', greet);

scene.addEventListener('dblclick', greet);
let lastTap = 0;
scene.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < 350) {
    e.preventDefault();
    greet();
  }
  lastTap = now;
}, { passive: false });

window.addEventListener('resize', () => {
  if (mode === 'tv') startTVMode();
});

startBlinking();
startTVMode();
