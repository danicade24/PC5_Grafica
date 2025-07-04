export const iniciarJuegoOrdenarCubo = (anchor, font, camera, volverAlMenu) => {
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
  let scoreOrdenar = 0;

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

  const actualizarScore = () => {
    if (anchor.scoreMesh) anchor.group.remove(anchor.scoreMesh);
    const scoreGeo = new THREE.TextGeometry(`Puntos: ${scoreOrdenar}`, {
      font: font,
      size: 0.12,
      height: 0.02,
    });
    const scoreMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    anchor.scoreMesh = new THREE.Mesh(scoreGeo, scoreMat);
    anchor.scoreMesh.position.set(-1.2, 0.9, 0);
    anchor.group.add(anchor.scoreMesh);
  };

  const mostrarFlotante = (texto, color = 0x00ff00) => {
    const geo = new THREE.TextGeometry(texto, {
      font: font,
      size: 0.12,
      height: 0.02,
    });
    const mat = new THREE.MeshStandardMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.5, 0);

    anchor.group.add(mesh);

    let tiempo = 0;
    const duracion = 60;
    const animar = () => {
      tiempo++;
      mesh.position.y += 0.005;
      mesh.material.opacity = 1 - tiempo / duracion;
      mesh.material.transparent = true;

      if (tiempo < duracion) {
        requestAnimationFrame(animar);
      } else {
        anchor.group.remove(mesh);
      }
    };
    animar();
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
    const startX = -((shuffled.length - 1) * 0.6) / 2;

    shuffled.forEach((letter, i) => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x0077ff })
      );

      const geometry = new THREE.TextGeometry(letter, {
        font: font,
        size: 0.18,
        height: 0.04,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.005,
        bevelSegments: 2,
      });
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.set(-0.1, -0.1, 0.11);

      const grupoLetra = new THREE.Group();
      grupoLetra.add(cube);
      grupoLetra.add(textMesh);
      grupoLetra.name = letter;

      grupoLetra.position.set(startX + i * 0.6, 0, 0);

      anchor.group.add(grupoLetra);
      letters.push(grupoLetra);
    });

    actualizarScore();
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

    const intersects = raycaster.intersectObjects(letters, true);
    if (intersects.length > 0) {
      const selected = intersects[0].object.parent;
      const letter = selected.name;
      const cube = selected.children[0];

      if (checkOrder(letter)) {
        cube.material.color.set(0x00ff00);
        setTimeout(() => {
          selected.visible = false;
        }, 300);
        clickedLetters.push(letter);
        scoreOrdenar += 10;
        updateResult();
        actualizarScore();
        mostrarFlotante("+10", 0x00ff00);
      } else {
        cube.material.color.set(0xff0000);
        scoreOrdenar = Math.max(0, scoreOrdenar - 5);
        actualizarScore();
        mostrarFlotante("-5", 0xff0000);
        setTimeout(() => {
          cube.material.color.set(0x0077ff);
        }, 500);
      }

      if (clickedLetters.join("") === targetSequence.join("")) {
        const geometry = new THREE.TextGeometry("Muy bien", {
          font: font,
          size: 0.2,
          height: 0.05,
        });
        const material = new THREE.MeshStandardMaterial({ color: 0xffff66 });
        finalText = new THREE.Mesh(geometry, material);
        finalText.position.set(-0.3, -0.4, 0);
        anchor.group.add(finalText);

        scoreOrdenar += 20;
        actualizarScore();
        mostrarFlotante("+20", 0xffff00);

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
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geo = new THREE.PlaneGeometry(0.3, 0.3);
    const btn = new THREE.Mesh(geo, mat);
    btn.position.set(-0.7, -0.9, 0);
    btn.name = "eliminar";
    anchor.group.add(btn);
    botones.push(btn);
  });

  textureLoader.load("./static/assets/icons/exit.png", (texture) => {
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geo = new THREE.PlaneGeometry(0.3, 0.3);
    const btn = new THREE.Mesh(geo, mat);
    btn.position.set(0.7, -0.9, 0);
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
            hidden.children[0].material.color.set(0x00ff00);
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