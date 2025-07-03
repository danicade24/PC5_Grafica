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
  let tiempoRestante = 10;
  let intervalo = null;

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

  const mostrarOperacion = () => {
    if (currentGroup) anchor.group.remove(currentGroup);
    if (resultText) anchor.group.remove(resultText);
    if (barraProgreso) anchor.group.remove(barraProgreso);
    tiempoRestante = 10;
    actualizarBarra();

    const grupo = new THREE.Group();
    const data = generarOperacion();

    // Texto de operación
    const opGeo = new THREE.TextGeometry(data.texto, {
      font: font,
      size: 0.25,
      height: 0.05,
    });
    const opMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const opMesh = new THREE.Mesh(opGeo, opMat);
    opMesh.position.set(-0.3, 0.4, 0);
    grupo.add(opMesh);

    // Alternativas
    const alternativasMesh = [];
    data.alternativas.forEach((num, i) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.3, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x007700 })
      );
      cube.position.set(i - 1, -0.2, 0);
      grupo.add(cube);

      const numGeo = new THREE.TextGeometry(num.toString(), {
        font: font,
        size: 0.15,
        height: 0.02,
      });
      const numMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const numMesh = new THREE.Mesh(numGeo, numMat);
      numMesh.position.set(i - 1 - 0.1, -0.23, 0.03);
      numMesh.name = num.toString();
      grupo.add(numMesh);

      alternativasMesh.push(numMesh);
    });

    // Texto de resultado seleccionado
    const resultadoGeo = new THREE.TextGeometry("", {
      font: font,
      size: 0.2,
      height: 0.05,
    });
    const resultadoMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    resultText = new THREE.Mesh(resultadoGeo, resultadoMat);
    resultText.position.set(-0.4, -0.5, 0);
    grupo.add(resultText);

    // Botón OK
    const okGroup = new THREE.Group();
    const okBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0000ff })
    );
    okBox.position.set(0, 0, -0.03);
    okGroup.add(okBox);

    const okText = new THREE.Mesh(
      new THREE.TextGeometry("OK", {
        font: font,
        size: 0.15,
        height: 0.02,
      }),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    okText.position.set(-0.15, -0.07, 0);
    okGroup.add(okText);
    okGroup.position.set(0, -0.7, 0);
    okGroup.name = "ok";
    grupo.add(okGroup);

    // Botón salir
    const salirGroup = new THREE.Group();
    const salirBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.3, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xcc0000 })
    );
    salirBox.position.set(0, 0, -0.03);
    salirGroup.add(salirBox);

    const salirText = new THREE.Mesh(
      new THREE.TextGeometry("✖", {
        font: font,
        size: 0.15,
        height: 0.02,
      }),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    salirText.position.set(-0.07, -0.07, 0);
    salirGroup.add(salirText);
    salirGroup.position.set(0.9, -0.7, 0);
    salirGroup.name = "salir";
    grupo.add(salirGroup);

    anchor.group.add(grupo);
    currentGroup = grupo;

    let seleccionado = null;

    const actualizarTiempo = () => {
      tiempoRestante--;
      actualizarBarra();
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
        seleccionado = parseInt(selected.name);

        grupo.remove(resultText);
        const newGeo = new THREE.TextGeometry(`Elegiste: ${seleccionado}`, {
          font: font,
          size: 0.2,
          height: 0.05,
        });
        resultText = new THREE.Mesh(newGeo, resultadoMat);
        resultText.position.set(-0.4, -0.5, 0);
        grupo.add(resultText);
      }

      const boton = raycaster.intersectObjects([okGroup, salirGroup], true);
      if (boton.length > 0) {
        const nombre = boton[0].object.parent.name;
        if (nombre === "ok" && seleccionado !== null) {
          clearInterval(intervalo);
          if (seleccionado === data.correcta) {
            mostrarOperacion();
          } else {
            resultText.material.color.set(0xff0000);
          }
        } else if (nombre === "salir") {
          clearInterval(intervalo);
          window.removeEventListener("click", onTouch);
          window.removeEventListener("touchstart", () => {});
          volverAlMenu();
        }
      }
    };

    window.addEventListener("click", onTouch);
    window.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) onTouch(e.touches[0]);
    });
  };

  mostrarOperacion();
};
