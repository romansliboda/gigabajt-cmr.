(function(){
  'use strict';
  function mountRobot(root){
    if(!root || root.dataset.gbMounted) return root && root.__gbApi;
    root.dataset.gbMounted='1';
    const initialWeather = (root.dataset.weather || 'sun').toLowerCase();
    const initialTemp = root.dataset.temp || (initialWeather === 'rain' ? '10' : '25');
    const initialMessage = root.dataset.message || ('Co słychać? Dziś ' + (initialWeather === 'rain' ? 'deszcz i zimno' : 'jest ciepło i słonecznie') + ' — ' + initialTemp + '°C.');

    root.innerHTML = `
      <div class="gb-floor"></div>
      <div class="gb-weather"><span class="gb-icon">${initialWeather === 'rain' ? '🌧️' : '🌤️'}</span><span class="gb-temp">${initialTemp}°C</span></div>
      <div class="gb-bubble" aria-live="polite"></div>
      <div class="gb-scene">
        <div class="gb-ambient-sun"><div class="sun"></div><div class="temp">${initialTemp}°C</div></div>
        <div class="gb-ambient-rain"><div class="cloud"></div><div class="drops"><i></i></div><div class="temp">${initialTemp}°C</div></div>
        <div class="gb-small-chair"></div>
        <div class="gb-umbrella"></div>
        <div class="gb-shadow"></div>
        <div class="gb-tv on">
          <div class="antenna"></div>
          <div class="leg l1"></div>
          <div class="leg l2"></div>
        </div>
        <div class="gb-robot is-side is-tv">
          <div class="antenna"></div>
          <div class="head">
            <div class="face">
              <div class="eye left"></div>
              <div class="eye right"></div>
              <div class="mouth"></div>
            </div>
          </div>
          <div class="ear left"></div><div class="ear right"></div>
          <div class="body"></div>
          <div class="arm left"></div><div class="arm right"></div>
          <div class="leg left"></div><div class="leg right"></div>
          <div class="wheel left"></div><div class="wheel right"></div>
          <div class="cmr-paper"></div>
          <div class="pencil"></div>
        </div>
      </div>
      <div class="gb-status">Dwuklik / 2 stuknięcia = przywitanie</div>
    `;

    const bubble = root.querySelector('.gb-bubble');
    const robot = root.querySelector('.gb-robot');
    const shadow = root.querySelector('.gb-shadow');
    const tv = root.querySelector('.gb-tv');
    const weatherNode = root.querySelector('.gb-weather');
    const status = root.querySelector('.gb-status');

    const state = {
      mode: 'tv',
      weather: initialWeather === 'rain' ? 'rain' : 'sun',
      temp: String(initialTemp),
      greetTimer: null,
      cycleTimer: null,
      tapAt: 0,
      message: initialMessage
    };

    function positionTV(){
      robot.style.left = 'calc(100% - 220px)';
      robot.style.bottom = '40px';
      shadow.style.left = 'calc(100% - 230px)';
      shadow.style.bottom = '30px';
    }
    function positionWork(){
      robot.style.left = 'calc(16% + 12px)';
      robot.style.bottom = '40px';
      shadow.style.left = 'calc(16% + 2px)';
      shadow.style.bottom = '30px';
    }
    function positionCenter(){
      robot.style.left = 'calc(50% - 44px)';
      robot.style.bottom = '38px';
      shadow.style.left = 'calc(50% - 48px)';
      shadow.style.bottom = '28px';
    }

    function setWeather(weather,temp){
      state.weather = weather === 'rain' ? 'rain' : 'sun';
      state.temp = String(temp ?? state.temp ?? (state.weather === 'rain' ? '10' : '25'));
      root.classList.toggle('weather-rain', state.weather === 'rain');
      root.classList.toggle('weather-sun', state.weather === 'sun');
      weatherNode.querySelector('.gb-icon').textContent = state.weather === 'rain' ? '🌧️' : '🌤️';
      weatherNode.querySelector('.gb-temp').textContent = `${state.temp}°C`;
      root.querySelectorAll('.gb-ambient-sun .temp, .gb-ambient-rain .temp').forEach(n=>n.textContent=`${state.temp}°C`);
      if(state.weather === 'rain'){
        state.message = `Co słychać? Dziś deszcz i zimno — ${state.temp}°C.`;
      } else {
        state.message = `Co słychać? Dziś słonecznie i ciepło — ${state.temp}°C.`;
      }
    }

    function clearModes(){
      robot.className = 'gb-robot';
      bubble.textContent = '';
      root.classList.remove('is-greet');
    }

    function showTV(){
      clearTimeout(state.greetTimer);
      clearModes();
      state.mode = 'tv';
      positionTV();
      robot.classList.add('is-side','is-tv');
      tv.classList.add('on');
      bubble.textContent = '';
      status.textContent = 'Robocik odpoczywa i ogląda telewizor';
    }

    function showWork(){
      clearTimeout(state.greetTimer);
      clearModes();
      state.mode = 'work';
      positionWork();
      robot.classList.add('is-side','is-work');
      tv.classList.remove('on');
      status.textContent = 'Robocik czyta CMR i coś notuje';
    }

    function greet(message){
      clearTimeout(state.greetTimer);
      clearModes();
      state.mode = 'greet';
      positionCenter();
      robot.classList.add('is-front','is-greet');
      tv.classList.add('on');
      bubble.textContent = message || state.message;
      root.classList.add('is-greet');
      status.textContent = 'Robocik się wita';
      state.greetTimer = setTimeout(()=>{
        root.classList.remove('is-greet');
        bubble.textContent = '';
        showTV();
      }, 6500);
    }

    function cycle(){
      clearInterval(state.cycleTimer);
      state.cycleTimer = setInterval(()=>{
        if(document.hidden || state.mode === 'greet') return;
        if(state.mode === 'tv') showWork();
        else showTV();
      }, 12000);
    }

    function onPointerUp(){
      const now = Date.now();
      if(now - state.tapAt < 420){
        state.tapAt = 0;
        greet();
      } else {
        state.tapAt = now;
      }
    }

    root.addEventListener('pointerup', onPointerUp);
    // Touch double tap is handled by pointerup; keyboard uses Enter.
    root.setAttribute('role','button');
    root.setAttribute('aria-label','Robocik Gigabajt, dwuklik lub dwa stuknięcia aby się przywitał');
    root.tabIndex = 0;
    root.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' '){e.preventDefault(); greet();}
    });

    setWeather(initialWeather, initialTemp);
    showTV();
    cycle();

    const api = {
      showTV,
      showWork,
      greet,
      setWeather
    };
    root.__gbApi = api;
    window.GBRobotWidget = api;
    return api;
  }

  function init(){
    document.querySelectorAll('.gb-robot-widget').forEach(mountRobot);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.mountGigabajtRobot = mountRobot;
})();
