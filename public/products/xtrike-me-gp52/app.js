(() => {
  "use strict";

  const canvas = document.getElementById("scene");
  const loading = document.getElementById("loading");
  const loadingText = document.getElementById("loading-text");
  const powerStatus = document.getElementById("power-status");
  const powerStatusText = document.getElementById("power-status-text");
  const controlTitle = document.getElementById("control-title");
  const controlDescription = document.getElementById("control-description");
  const activityPill = document.getElementById("activity-pill");
  const lightModeLabel = document.getElementById("light-mode-label");
  const hotspotsContainer = document.getElementById("hotspots");

  const state = {
    ready: false,
    powerOn: false,
    lightsOn: false,
    guideOn: false,
    lightMode: 0,
    packageOpened: false,
    unboxing: null,
    selected: "None",
    lastAction: "SEALED",
    activeAnimations: [],
    elapsed: 0,
  };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050609);
  scene.fog = new THREE.FogExp2(0x050609, 0.009);

  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 200);
  const isNarrowScreen = () => innerWidth / innerHeight < 0.75;
  const viewerTarget = new THREE.Vector3(0, 2.7, 0);
  const frontViewPosition = () => isNarrowScreen() ? new THREE.Vector3(0, 7.5, 42) : new THREE.Vector3(0, 7, 28);
  const backViewPosition = () => isNarrowScreen() ? new THREE.Vector3(0, 7.5, -42) : new THREE.Vector3(0, 7, -28);
  const defaultCamera = frontViewPosition();
  camera.position.copy(defaultCamera);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.minDistance = 13;
  controls.maxDistance = 90;
  controls.target.copy(viewerTarget);

  scene.add(new THREE.HemisphereLight(0xb7c9ff, 0x050609, 0.72));

  const keyLight = new THREE.DirectionalLight(0xf4f6ff, 2.35);
  keyLight.position.set(-8, 14, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x73b7ff, 1.15);
  fillLight.position.set(12, 6, -8);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff4f92, 1.4);
  rimLight.position.set(-10, 2, -12);
  scene.add(rimLight);

  const rearLight = new THREE.DirectionalLight(0x8faeff, 1.85);
  rearLight.position.set(0, -16, 2);
  scene.add(rearLight);

  const rgbGlow = new THREE.PointLight(0x58ddff, 0, 16, 2);
  rgbGlow.position.set(0, 3.4, 1.2);
  scene.add(rgbGlow);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(22, 96),
    new THREE.MeshStandardMaterial({ color: 0x080a0e, roughness: 0.36, metalness: 0.42 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.35;
  floor.receiveShadow = true;
  scene.add(floor);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(8.5, 9.2, 96),
    new THREE.MeshBasicMaterial({ color: 0x163846, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -1.32;
  scene.add(halo);

  const particlesGeometry = new THREE.BufferGeometry();
  const particlePositions = [];
  for (let i = 0; i < 180; i++) {
    particlePositions.push((Math.random() - .5) * 42, Math.random() * 22 - 3, (Math.random() - .5) * 42);
  }
  particlesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({ color: 0x75839c, size: 0.045, transparent: true, opacity: 0.52 })
  );
  scene.add(particles);

  let controllerRoot = null;
  let packageRoot = null;
  const packageObjects = [];
  const controllerTargetPosition = new THREE.Vector3(0, 2.9, 0);
  const controllerTargetScale = new THREE.Vector3(.72, .72, .72);
  const controllerStartPosition = new THREE.Vector3(0, -1.1, -1.8);
  const controllerStartScale = new THREE.Vector3(.08, .08, .08);
  const packageStartPosition = new THREE.Vector3(0, 2.55, 0);
  const packageStartScale = new THREE.Vector3(.46, .55, .54);
  const packageRestPosition = new THREE.Vector3(6.4, 1.1, -7.2);
  const packageRestScale = new THREE.Vector3(.30, .38, .34);
  const rgbObjects = [];
  const interactiveObjects = [];
  const hotspotEntries = [];
  const originalRgbColors = new Map();
  const rearGuideLabels = new Set(["M1 trigger", "M2 trigger", "Light button", "L1 / L2", "R1 / R2"]);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();
  let pointerDown = null;
  let lastPackageTap = 0;

  const fallbackControls = {
    "Home Button": ["Power / HOME", "Turn the controller on or off."],
    "Light Button": ["Share", "Share or capture button."],
    "Menu Button": ["Options", "Open the options menu."],
    "Touch Panel": ["Touchpad", "Clickable central touch surface."],
    "DPad Horizontal": ["D-pad", "Directional control pad."],
    "DPad Vertical": ["D-pad", "Directional control pad."],
    "Left Analog_Cap": ["Left joystick / L3", "Movement stick; press for L3."],
    "Right Analog_Cap": ["Right joystick / R3", "Camera stick; press for R3."],
    "Triangle Button": ["Triangle button", "Primary face action button."],
    "Square Button": ["Square button", "Primary face action button."],
    "Circle Button": ["Circle button", "Primary face action button."],
    "X Button": ["X button", "Primary face action button."],
    "Turbo Button": ["Turbo", "Toggle rapid input mode."],
    "Left Shoulder Trigger": ["L1 / L2", "Left shoulder control and trigger."],
    "Right Shoulder Trigger": ["R1 / R2", "Right shoulder control and trigger."],
    "M1 Back Paddle": ["M1 trigger", "Programmable rear paddle."],
    "M2 Back Paddle": ["M2 trigger", "Programmable rear paddle."],
    "Back Light Switch": ["Light button", "Cycle the RGB lighting mode."],
  };

  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  function normalizeName(name) {
    return (name || "").replace(/\.\d+$/, "");
  }

  function getControlData(object) {
    let current = object;
    while (current && current !== controllerRoot) {
      const clean = normalizeName(current.name);
      if (current.userData && current.userData.interactive) {
        return {
          object: current,
          label: current.userData.control_label || clean,
          description: current.userData.control_description || "Interactive controller input.",
        };
      }
      if (fallbackControls[clean]) {
        return { object: current, label: fallbackControls[clean][0], description: fallbackControls[clean][1] };
      }
      current = current.parent;
    }
    return null;
  }

  function setupModel(root) {
    controllerRoot = root;
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.position.add(controllerTargetPosition);
    root.scale.copy(controllerTargetScale);
    root.rotation.x = Math.PI / 2;
    root.visible = false;
    scene.add(root);

    root.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        if (object.material) {
          object.material.envMapIntensity = 1.25;
          object.material.needsUpdate = true;
        }
      }
      if (object.name.startsWith("RGB_")) {
        rgbObjects.push(object);
        object.traverse((child) => {
          if (child.material && child.material.color) originalRgbColors.set(child.material, child.material.color.clone());
        });
      }
      if (getControlData(object)) interactiveObjects.push(object);
    });

    createHotspots();
    applyPowerState(false, true);
    loadPackage();
  }

  function loadPackage() {
    const packageLoader = new THREE.GLTFLoader();
    packageLoader.load(
      "assets/xtrike_gp52_package.glb",
      (gltf) => setupPackage(gltf.scene),
      undefined,
      (error) => {
        console.error(error);
        loadingText.textContent = "Could not load the retail package.";
      }
    );
  }

  function setupPackage(root) {
    packageRoot = root;
    const box = new THREE.Box3().setFromObject(root);
    root.position.sub(box.getCenter(new THREE.Vector3()));
    root.position.add(packageStartPosition);
    root.scale.copy(packageStartScale);
    root.rotation.x = Math.PI / 2;
    root.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        packageObjects.push(object);
      }
    });
    scene.add(root);
    state.ready = true;
    loading.classList.add("done");
    loadingText.textContent = "Ready";
    selectControl(
      { label: "Double-click the package", description: "Open the retail box to reveal the GP-52 controller." },
      "SEALED"
    );
  }

  function createHotspots() {
    const unique = new Map();
    interactiveObjects.forEach((object) => {
      const data = getControlData(object);
      if (!data || unique.has(data.label)) return;
      unique.set(data.label, data);
      const element = document.createElement("button");
      element.className = "hotspot";
      element.dataset.label = data.label;
      element.title = data.label;
      element.hidden = true;
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        activateControl(data);
      });
      hotspotsContainer.appendChild(element);
      hotspotEntries.push({ data, element });
    });
  }

  function selectControl(data, action = "PRESSED") {
    state.selected = data.label;
    state.lastAction = action;
    controlTitle.textContent = data.label;
    controlDescription.textContent = data.description;
    activityPill.textContent = action;
    activityPill.classList.add("active");
    clearTimeout(selectControl.timer);
    selectControl.timer = setTimeout(() => activityPill.classList.remove("active"), 520);
  }

  function animatePress(object) {
    const start = object.scale.clone();
    state.activeAnimations.push({ object, start, time: 0, duration: .34 });
  }

  function activateControl(data) {
    if (!state.packageOpened) return;
    animatePress(data.object);
    selectControl(data);
    const clean = normalizeName(data.object.name);
    if (clean === "Home Button") togglePower();
    if (data.label === "Light button" || clean.replaceAll("_", " ") === "Back Light Switch") cycleLights();
    if (clean === "Turbo Button") selectControl(data, "TURBO TOGGLED");
  }

  function applyPowerState(on, silent = false) {
    state.powerOn = on;
    if (!on) state.lightsOn = false;
    powerStatus.classList.toggle("on", on);
    document.getElementById("power-button").classList.toggle("active", on);
    powerStatusText.textContent = on ? "POWER ON" : "POWER OFF";
    rgbGlow.intensity = on && state.lightsOn ? 2.4 : 0;
    rgbObjects.forEach((object) => {
      object.visible = on && state.lightsOn;
    });
    updateLightLabel();
    if (!silent) {
      selectControl(
        { label: on ? "Controller powered on" : "Controller powered off", description: on ? "Use the rear LIGHT switch to activate the RGB lighting." : "Press Power or click the HOME button to wake the controller." },
        on ? "POWER ON" : "POWER OFF"
      );
    }
  }

  function togglePower() {
    if (!ensureUnboxed()) return;
    applyPowerState(!state.powerOn);
  }

  function cycleLights() {
    if (!ensureUnboxed()) return;
    if (!state.powerOn) {
      selectControl({ label: "Power is off", description: "Turn on the controller before using its LIGHT switch." }, "POWER REQUIRED");
      return;
    }
    if (!state.lightsOn) {
      state.lightsOn = true;
      state.lightMode = 0;
    } else if (state.lightMode < 2) {
      state.lightMode += 1;
    } else {
      state.lightsOn = false;
      state.lightMode = 0;
    }
    const colors = [null, new THREE.Color(0x39e7ff), new THREE.Color(0xff367e)];
    rgbObjects.forEach((object) => {
      object.visible = state.lightsOn;
      object.traverse((child) => {
        if (!child.material || !child.material.color) return;
        if (state.lightMode === 0 && originalRgbColors.has(child.material)) child.material.color.copy(originalRgbColors.get(child.material));
        if (state.lightMode === 1 || state.lightMode === 2) child.material.color.copy(colors[state.lightMode]);
      });
    });
    rgbGlow.color.set(state.lightMode === 2 ? 0xff367e : 0x39e7ff);
    rgbGlow.intensity = state.lightsOn ? 2.4 : 0;
    updateLightLabel();
    selectControl({ label: "RGB lighting", description: "Lighting mode changed using the rear LIGHT button." }, "MODE CHANGED");
  }

  function updateLightLabel() {
    const names = ["RAINBOW", "CYAN", "MAGENTA"];
    lightModeLabel.textContent = `RGB: ${state.powerOn && state.lightsOn ? names[state.lightMode] : "OFF"}`;
  }

  function setGuide(on) {
    if (!ensureUnboxed()) return;
    state.guideOn = on;
    document.getElementById("guide-button").classList.toggle("active", on);
    hotspotEntries.forEach(({ element }) => { element.hidden = !on; });
  }

  function moveCamera(position) {
    if (!ensureUnboxed()) return;
    const from = camera.position.clone();
    const to = position.clone();
    state.activeAnimations.push({ camera: true, from, to, time: 0, duration: .7 });
  }

  function raycastAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveObjects, true);
    for (const hit of hits) {
      const data = getControlData(hit.object);
      if (data) return data;
    }
    return null;
  }

  function raycastPackage(clientX, clientY) {
    if (!packageRoot || state.packageOpened) return false;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(packageObjects, true).length > 0;
  }

  function ensureUnboxed() {
    if (state.packageOpened) return true;
    selectControl(
      { label: "Package is still sealed", description: "Double-click the retail package before using the controller." },
      "DOUBLE-CLICK"
    );
    return false;
  }

  function unboxPackage() {
    if (!state.ready || state.packageOpened || state.unboxing) return;
    state.packageOpened = true;
    controllerRoot.visible = true;
    controllerRoot.scale.copy(controllerStartScale);
    controllerRoot.position.copy(controllerStartPosition);
    state.unboxing = { time: 0, duration: 1.65 };
    window.setTimeout(() => {
      if (state.unboxing) updateUnboxing(state.unboxing.duration);
    }, 1900);
    selectControl(
      { label: "GP-52 revealed", description: "The package is now passive in the background. Explore the controller in 360 degrees." },
      "UNBOXING"
    );
  }

  function updateUnboxing(delta) {
    if (!state.unboxing) return;
    state.unboxing.time += delta;
    const t = Math.min(state.unboxing.time / state.unboxing.duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    packageRoot.position.lerpVectors(packageStartPosition, packageRestPosition, eased);
    packageRoot.scale.lerpVectors(packageStartScale, packageRestScale, eased);
    packageRoot.rotation.y = -.42 * eased;
    packageRoot.rotation.x = Math.PI / 2 - .12 * eased;
    controllerRoot.position.lerpVectors(controllerStartPosition, controllerTargetPosition, eased);
    controllerRoot.scale.lerpVectors(controllerStartScale, controllerTargetScale, eased);
    if (t >= 1) {
      state.unboxing = null;
      selectControl(
        { label: "Explore the GP-52", description: "Drag to rotate 360 degrees. Click controls to test them. Use the rear LIGHT switch for RGB." },
        "READY"
      );
    }
  }

  function locateLightSwitch() {
    if (!ensureUnboxed()) return;
    if (!state.powerOn) {
      selectControl({ label: "Power is off", description: "Turn on the controller, then press the rear LIGHT switch." }, "POWER REQUIRED");
      return;
    }
    setGuide(true);
    moveCamera(backViewPosition());
    selectControl({ label: "Rear LIGHT switch", description: "Click the highlighted rear LIGHT switch to turn RGB lighting on or change its mode." }, "FIND SWITCH");
  }

  function updateAnimations(delta) {
    for (let i = state.activeAnimations.length - 1; i >= 0; i--) {
      const animation = state.activeAnimations[i];
      animation.time += delta;
      const t = Math.min(animation.time / animation.duration, 1);
      const eased = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      if (animation.camera) {
        camera.position.lerpVectors(animation.from, animation.to, eased);
        controls.target.lerp(viewerTarget, .14);
      } else {
        const press = 1 - Math.sin(t * Math.PI) * .11;
        animation.object.scale.copy(animation.start).multiplyScalar(press);
      }
      if (t >= 1) {
        if (!animation.camera) animation.object.scale.copy(animation.start);
        state.activeAnimations.splice(i, 1);
      }
    }
  }

  function updateHotspots() {
    if (!state.guideOn) return;
    const viewingFront = camera.position.z >= 0;
    hotspotEntries.forEach(({ data, element }) => {
      const position = new THREE.Vector3();
      new THREE.Box3().setFromObject(data.object).getCenter(position);
      position.project(camera);
      const correctSide = viewingFront ? !rearGuideLabels.has(data.label) : rearGuideLabels.has(data.label);
      const visible = correctSide && position.z > -1 && position.z < 1;
      element.hidden = !visible;
      if (visible) {
        element.style.left = `${(position.x * .5 + .5) * innerWidth}px`;
        element.style.top = `${(-position.y * .5 + .5) * innerHeight}px`;
      }
    });
  }

  function update(delta) {
    state.elapsed += delta;
    controls.update();
    updateAnimations(delta);
    updateUnboxing(delta);
    particles.rotation.y += delta * .008;
    halo.material.opacity = .22 + Math.sin(state.elapsed * 1.8) * .06;
    updateHotspots();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), .05);
    update(delta);
    render();
  }

  canvas.addEventListener("pointerdown", (event) => {
    pointerDown = { x: event.clientX, y: event.clientY };
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!pointerDown) return;
    const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    pointerDown = null;
    if (distance > 7 || !state.ready) return;
    if (!state.packageOpened) {
      const now = performance.now();
      if (now - lastPackageTap < 460) unboxPackage();
      else selectControl({ label: "Retail package", description: "Double-click to open the box and reveal the controller." }, "DOUBLE-CLICK");
      lastPackageTap = now;
      return;
    }
    const data = raycastAt(event.clientX, event.clientY);
    if (data) activateControl(data);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.ready || pointerDown) return;
    canvas.style.cursor = raycastPackage(event.clientX, event.clientY) || raycastAt(event.clientX, event.clientY) ? "pointer" : "grab";
  });

  canvas.addEventListener("dblclick", (event) => {
    if (!state.packageOpened || raycastPackage(event.clientX, event.clientY)) unboxPackage();
  });

  document.getElementById("power-button").addEventListener("click", togglePower);
  document.getElementById("lights-button").addEventListener("click", locateLightSwitch);
  document.getElementById("guide-button").addEventListener("click", () => setGuide(!state.guideOn));
  document.getElementById("front-button").addEventListener("click", () => moveCamera(frontViewPosition()));
  document.getElementById("back-button").addEventListener("click", () => moveCamera(backViewPosition()));
  document.getElementById("reset-button").addEventListener("click", () => moveCamera(frontViewPosition()));
  document.getElementById("fullscreen-button").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "f") {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  window.render_game_to_text = () => JSON.stringify({
    coordinateSystem: "3D product viewer; camera orbits around controller center",
    ready: state.ready,
    packageOpened: state.packageOpened,
    powerOn: state.powerOn,
    lightsOn: state.lightsOn,
    rgbMode: state.lightsOn ? ["rainbow", "cyan", "magenta"][state.lightMode] : "off",
    guideOn: state.guideOn,
    selectedControl: state.selected,
    lastAction: state.lastAction,
    interactiveControlCount: hotspotEntries.length,
  });

  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i++) update(1 / 60);
    render();
  };

  try {
    const loader = new THREE.GLTFLoader();
    loader.parse(
      base64ToArrayBuffer(window.XTRIKE_MODEL_BASE64),
      "",
      (gltf) => setupModel(gltf.scene),
      (error) => {
        console.error(error);
        loadingText.textContent = "Could not load the controller model.";
      }
    );
  } catch (error) {
    console.error(error);
    loadingText.textContent = "Could not initialize the 3D viewer.";
  }

  loop();
})();
