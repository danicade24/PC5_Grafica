export const iniciarJuegoOperaciones = (anchor, font, camera, volverAlMenu) => {
  anchor.group.clear();

  const THREE = window.MINDAR.IMAGE.THREE;
  const textureLoader = new THREE.TextureLoader();

  const operaciones = ["+", "-"];
  const max = 10;
  let intervalo = null;
  let tiempoRestante = 10;
  let botones = [];
  let currentGroup = null;
  let data = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let barraProgreso = null;
  let contadorText = null;

  const generarOperacion = () => {
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    const op = operaciones[Math.floor(Math.random() * operaciones.length)];
    const correct = op === "+" ? a + b : a - b;
    const alternativas = [correct];

    while (alternativas.length < 3) {
      const falsa = correct + Math.floor(Math.random() * 5 - 2);
      if (!alternativas.includes(falsa)) alternativas.push(falsa);
    }

    return {
      texto: `${a} ${op} ${b}`,
      correcta: correct,
      alternativas: alternativas.sort(() => Math.random() - 0.5),
    };
  };

  const actualizarBarra = () => {
    if (barraProgreso) anchor.group.remove(barraProgreso);
    const barraGeo = new THREE.BoxGeometry(tiempoRestante * 0.05, 0.05, 0.01);
    const barraMat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    barraProgreso = new THREE.Mesh(barraGeo, barraMat);
    barraProgreso.position.set(0, 0.8, 0);
    anchor.group.add(barraProgreso);
  };

  const actualizarContador = () => {
    if (contadorText) anchor.group.remove(contadorText);
    const contadorGeo = new THREE.TextGeometry(`${tiempoRestante}`, {
      font: font,
      size: 0.15,
      height: 0.02,
    });
    const contadorMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    contadorText = new THREE.Mesh(contadorGeo, contadorMat);
    contadorText.position.set(1, 0.8, 0);
    anchor.group.add(contadorText);
  };

  const mostrarResultado = (seleccionado) => {
    const correcto = seleccionado === data.correcta;
    const msg = correcto ? "Bien" : "Mal";

    const newGeo = new THREE.TextGeometry(msg, {
      font: font,
      size: 0.2,
      height: 0.05,
    });
    const newMat = new THREE.MeshStandardMaterial({
      color: correcto ? 0x00ff00 : 0xff0000,
    });
    const resultText = new THREE.Mesh(newGeo, newMat);
    resultText.position.set(-0.3, -0.5, 0);
    currentGroup.add(resultText);

    setTimeout(() => {
      mostrarOperacion();
    }, 1500);
  };

  const mostrarOperacion = () => {
    if (intervalo) clearInterval(intervalo);
    anchor.group.clear();
    botones = [];
    tiempoRestante = 10;
    data = generarOperacion();
    currentGroup = new THREE.Group();

    // Pregunta
    const opGeo = new THREE.TextGeometry(data.texto, {
      font: font,
      size: 0.2,
      height: 0.05,
    });
    const opMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const opMesh = new THREE.Mesh(opGeo, opMat);
    opMesh.position.set(-0.3, 0.4, 0);
    currentGroup.add(opMesh);

    // Opciones
    data.alternativas.forEach((num, i) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.2, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x007700 })
      );

      const numGeo = new THREE.TextGeometry(num.toString(), {
        font: font,
        size: 0.12,
        height: 0.02,
      });
      const numMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const numMesh = new THREE.Mesh(numGeo, numMat);
      numMesh.position.set(-0.07, -0.05, 0.08);

      const grupoRespuesta = new THREE.Group();
      grupoRespuesta.add(cube);
      grupoRespuesta.add(numMesh);
      grupoRespuesta.position.set(-0.7 + i * 0.7, -0.1, 0);
      grupoRespuesta.name = num.toString();

      currentGroup.add(grupoRespuesta);
    });

    // Botón VOLVER
    textureLoader.load("./static/assets/icons/back.png", (texture) => {
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const geo = new THREE.PlaneGeometry(0.3, 0.3);
      const btn = new THREE.Mesh(geo, mat);
      btn.position.set(-0.7, -0.9, 0);
      btn.name = "volver";
      currentGroup.add(btn);
      botones.push(btn);
    });

    // Botón SALIR
    textureLoader.load("./static/assets/icons/exit.png", (texture) => {
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const geo = new THREE.PlaneGeometry(0.3, 0.3);
      const btn = new THREE.Mesh(geo, mat);
      btn.position.set(0.7, -0.9, 0);
      btn.name = "salir";
      currentGroup.add(btn);
      botones.push(btn);
    });

    anchor.group.add(currentGroup);
    actualizarBarra();
    actualizarContador();

    intervalo = setInterval(() => {
      tiempoRestante--;
      actualizarBarra();
      actualizarContador();
      if (tiempoRestante <= 0) {
        clearInterval(intervalo);
        mostrarOperacion();
      }
    }, 1000);
  };

  const handleClick = (event) => {
    const e = event.touches ? event.touches[0] : event;
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, camera);

    const intersectedBtns = raycaster.intersectObjects(botones, true);
    if (intersectedBtns.length > 0) {
      const nombre = intersectedBtns[0].object.name;
      if (nombre === "salir" || nombre === "volver") {
        clearInterval(intervalo);
        window.removeEventListener("click", handleClick);
        window.removeEventListener("touchstart", handleClick);
        anchor.group.clear();
        volverAlMenu();
        return;
      }
    }

    const intersected = raycaster.intersectObjects(currentGroup.children, true);
    if (intersected.length > 0) {
      const seleccionado = parseInt(intersected[0].object.parent.name);
      if (!isNaN(seleccionado)) {
        clearInterval(intervalo);
        mostrarResultado(seleccionado);
      }
    }
  };

  window.addEventListener("click", handleClick);
  window.addEventListener("touchstart", handleClick);

  mostrarOperacion();
};
