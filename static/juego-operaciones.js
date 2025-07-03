export const iniciarJuegoOperaciones = (anchor, font, camera, volverAlMenu) => {
  anchor.group.clear();

  const THREE = window.MINDAR.IMAGE.THREE;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const operaciones = ["+", "-"];
  const max = 10;
  let currentGroup = null;
  let resultText = null;
  let barraProgreso = null;
  let contadorText = null;
  let tiempoRestante = 10;
  let intervalo = null;

  const textureLoader = new THREE.TextureLoader();
  const iconoSalir = textureLoader.load("/static/assets/img/exit.png");

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

  const mostrarOperacion = () => {
    if (currentGroup) anchor.group.remove(currentGroup);
    if (resultText) anchor.group.remove(resultText);
    if (barraProgreso) anchor.group.remove(barraProgreso);
    if (contadorText) anchor.group.remove(contadorText);
    tiempoRestante = 10;
    actualizarBarra();
    actualizarContador();

    const grupo = new THREE.Group();
    const data = generarOperacion();

    const opGeo = new THREE.TextGeometry(data.texto, {
      font: font,
      size: 0.2,
      height: 0.05,
    });
    const opMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const opMesh = new THREE.Mesh(opGeo, opMat);
    opMesh.position.set(-0.3, 0.4, 0);
    grupo.add(opMesh);

    const alternativasMesh = [];
    data.alternativas.forEach((num, i) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.2, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x007700 })
      );
      cube.position.set(-0.7 + i * 0.7, -0.1, 0);
      grupo.add(cube);

      const numGeo = new THREE.TextGeometry(num.toString(), {
        font: font,
        size: 0.12,
        height: 0.02,
      });
      const numMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const numMesh = new THREE.Mesh(numGeo, numMat);
      numMesh.position.set(
        cube.position.x - 0.08,
        cube.position.y - 0.05,
        0.03
      );
      numMesh.name = num.toString();
      grupo.add(numMesh);

      alternativasMesh.push(numMesh);
    });

    // Botón salir (con imagen) más abajo
    const textureMat = new THREE.MeshBasicMaterial({
      map: iconoSalir,
      transparent: true,
    });
    const exitButton = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      textureMat
    );
    exitButton.position.set(0, -1.2, 0); // centrado abajo
    exitButton.name = "salir";
    grupo.add(exitButton);

    anchor.group.add(grupo);
    currentGroup = grupo;

    const actualizarTiempo = () => {
      tiempoRestante--;
      actualizarBarra();
      actualizarContador();
      if (tiempoRestante <= 0) {
        clearInterval(intervalo);
        mostrarOperacion();
      }
    };
    intervalo = setInterval(actualizarTiempo, 1000);

    const onTouch = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.set(x, y);
      raycaster.setFromCamera(pointer, camera);

      const intersected = raycaster.intersectObjects(alternativasMesh, true);
      if (intersected.length > 0) {
        const selected = intersected[0].object;
        const seleccionado = parseInt(selected.name);

        clearInterval(intervalo);

        const correcto = seleccionado === data.correcta;
        const msg = correcto ? "✅ Bien" : "❌ Mal";
        const newGeo = new THREE.TextGeometry(msg, {
          font: font,
          size: 0.2,
          height: 0.05,
        });
        const newMat = new THREE.MeshStandardMaterial({
          color: correcto ? 0x00ff00 : 0xff0000,
        });
        resultText = new THREE.Mesh(newGeo, newMat);
        resultText.position.set(-0.3, -0.5, 0);
        grupo.add(resultText);

        setTimeout(() => {
          mostrarOperacion();
        }, 1500);
      }

      const boton = raycaster.intersectObject(exitButton, true);
      if (boton.length > 0 && boton[0].object.name === "salir") {
        clearInterval(intervalo);
        window.removeEventListener("click", onTouch);
        window.removeEventListener("touchstart", () => {});
        volverAlMenu();
      }
    };

    window.addEventListener("click", onTouch);
    window.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) onTouch(e.touches[0]);
    });
  };

  mostrarOperacion();
};
