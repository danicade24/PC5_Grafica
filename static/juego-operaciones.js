export const iniciarJuegoOperaciones = (anchor, font, camera) => {
  anchor.group.clear();
  const THREE = window.MINDAR.IMAGE.THREE;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const operaciones = ["+", "-"];
  const max = 10;
  let currentGroup = null;
  let resultText = null;

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

  const mostrarOperacion = () => {
    if (currentGroup) anchor.group.remove(currentGroup);
    const grupo = new THREE.Group();
    const data = generarOperacion();

    const opGeo = new THREE.TextGeometry(data.texto, {
      font,
      size: 0.3,
      height: 0.05,
    });
    const opMat = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const opMesh = new THREE.Mesh(opGeo, opMat);
    opMesh.position.set(-0.4, 0.4, 0);
    grupo.add(opMesh);

    const alternativasMesh = [];
    data.alternativas.forEach((num, i) => {
      const altGeo = new THREE.TextGeometry(num.toString(), {
        font,
        size: 0.2,
        height: 0.05,
      });
      const altMat = new THREE.MeshStandardMaterial({ color: 0x007700 });
      const altMesh = new THREE.Mesh(altGeo, altMat);
      altMesh.position.set(0.4, 0.3 - i * 0.3, 0);
      altMesh.name = num.toString();
      grupo.add(altMesh);
      alternativasMesh.push(altMesh);
    });

    if (resultText) anchor.group.remove(resultText);
    const resultadoGeo = new THREE.TextGeometry("", {
      font,
      size: 0.2,
      height: 0.05,
    });
    const resultadoMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    resultText = new THREE.Mesh(resultadoGeo, resultadoMat);
    resultText.position.set(-0.4, -0.2, 0);
    grupo.add(resultText);

    currentGroup = grupo;
    anchor.group.add(grupo);

    const onTouch = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.set(x, y);
      raycaster.setFromCamera(pointer, camera);
      const intersected = raycaster.intersectObjects(alternativasMesh);
      if (intersected.length > 0) {
        const selected = intersected[0].object;
        const elegido = parseInt(selected.name);

        grupo.remove(resultText);
        const newGeo = new THREE.TextGeometry(`Elegiste: ${elegido}`, {
          font,
          size: 0.2,
          height: 0.05,
        });
        resultText = new THREE.Mesh(newGeo, resultadoMat);
        resultText.position.set(-0.4, -0.2, 0);
        grupo.add(resultText);

        if (elegido === data.correcta) {
          console.log("✅ Correcto");
          setTimeout(() => mostrarOperacion(), 1000);
        } else {
          console.log("❌ Incorrecto");
          selected.material.color.set(0xff0000);
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
