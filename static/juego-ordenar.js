export const iniciarJuegoPalabra = (anchor, font, camera, volverAlMenu) => {
  anchor.group.clear();

  const THREE = window.MINDAR.IMAGE.THREE;
  const textureLoader = new THREE.TextureLoader();

  const palabras = ["ESCUELA", "CASA", "ARBOL", "GATO", "SOL"];
  let indicePalabra = 0;
  let targetSequence = palabras[indicePalabra].split("");
  const clickedLetters = [];
  const letters = [];

  const resultMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  let resultMesh = null;
  let finalText = null;
  let lastRemoved = null;

  const updateResult = () => {
    if (resultMesh) anchor.group.remove(resultMesh);

    const resultGeometry = new THREE.TextGeometry(clickedLetters.join(""), {
      font: font,
      size: 0.1,
      height: 0.02,
    });
    resultMesh = new THREE.Mesh(resultGeometry, resultMaterial);
    resultMesh.position.set(-0.4, -0.6, 0);
    anchor.group.add(resultMesh);
  };

  const mostrarLetras = () => {
    letters.forEach((l) => anchor.group.remove(l));
    letters.length = 0;
    clickedLetters.length = 0;
    lastRemoved = null;
    updateResult();
    if (finalText) {
      anchor.group.remove(finalText);
      finalText = null;
    }

    targetSequence = palabras[indicePalabra].split("");
    const shuffled = [...targetSequence].sort(() => Math.random() - 0.5);

    shuffled.forEach((letter, i) => {
      const geometry = new THREE.TextGeometry(letter, {
        font: font,
        size: 0.15,
        height: 0.05,
      });
      const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
      const mesh = new THREE.Mesh(geometry, material);

      const angle = (i / shuffled.length) * Math.PI * 2;
      const radius = 0.4;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.25 + 0.2,
        0
      );
      mesh.name = letter;
      anchor.group.add(mesh);
      letters.push(mesh);
    });
  };

  mostrarLetras();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const checkOrder = (letter) => {
    const expected = targetSequence[clickedLetters.length];
    return letter === expected;
  };

  const onTouch = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(letters);
    if (intersects.length > 0) {
      const selected = intersects[0].object;
      const letter = selected.name;

      if (checkOrder(letter)) {
        selected.material.color.set(0x00ff00); // 💚 Verde si es correcta
        setTimeout(() => {
          selected.visible = false;
        }, 300);
        clickedLetters.push(letter);
        updateResult();
      } else {
        const originalColor = 0x0077ff; // Azul original (puedes cambiarlo)
        selected.material.color.set(0xff0000); // Rojo temporal

        setTimeout(() => {
          selected.material.color.set(originalColor);
        }, 500); // vuelve al color original después de 0.5 segundos
      }

      // ¿Completó la palabra?
      if (clickedLetters.join("") === targetSequence.join("")) {
        const geometry = new THREE.TextGeometry("Muy bien!", {
          font: font,
          size: 0.2,
          height: 0.05,
        });
        const material = new THREE.MeshStandardMaterial({ color: 0xffff66 });
        finalText = new THREE.Mesh(geometry, material);
        finalText.position.set(-0.3, -0.4, 0);
        anchor.group.add(finalText);

        setTimeout(() => {
          indicePalabra = (indicePalabra + 1) % palabras.length;
          mostrarLetras();
        }, 1000);
      }
    }
  };


  window.addEventListener("click", onTouch);
  window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) onTouch(e.touches[0]);
  });

  const botones = [];

  textureLoader.load("./static/assets/icons/back.png", (texture) => {
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const geo = new THREE.PlaneGeometry(0.3, 0.3);
    const btn = new THREE.Mesh(geo, mat);
    btn.position.set(-0.7, -0.1, 0);
    btn.name = "eliminar";
    anchor.group.add(btn);
    botones.push(btn);
  });

  textureLoader.load("./static/assets/icons/exit.png", (texture) => {
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const geo = new THREE.PlaneGeometry(0.3, 0.3);
    const btn = new THREE.Mesh(geo, mat);
    btn.position.set(0.7, -0.1, 0);
    btn.name = "salir";
    anchor.group.add(btn);
    botones.push(btn);
  });

  const onButtonTouch = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(botones, true);
    if (intersects.length > 0) {
      const btn = intersects[0].object.name;
      if (btn === "eliminar") {
        if (clickedLetters.length > 0) {
          const last = clickedLetters.pop();
          updateResult();
          const hidden = letters.find((m) => m.name === last && !m.visible);
          if (hidden) {
            hidden.visible = true;
            hidden.material.color.set(0x00ff00); // Verde al volver
            lastRemoved = hidden;
          }
        }
      } else if (btn === "salir") {
        window.removeEventListener("click", onTouch);
        window.removeEventListener("touchstart", () => {});
        window.removeEventListener("click", onButtonTouch);
        window.removeEventListener("touchstart", () => {});
        volverAlMenu();
      }
    }
  };

  window.addEventListener("click", onButtonTouch);
  window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) onButtonTouch(e.touches[0]);
  });
};