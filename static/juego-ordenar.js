export const iniciarJuegoPalabra = (anchor, font, camera) => {
  anchor.group.clear();
  const THREE = window.MINDAR.IMAGE.THREE;
  const word = "ESCUELA";
  const targetSequence = word.split("");
  const clickedLetters = [],
    letters = [];
  const resultMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  let resultMesh = null;

  const updateResult = () => {
    if (resultMesh) anchor.group.remove(resultMesh);
    const resultGeometry = new THREE.TextGeometry(clickedLetters.join(""), {
      font,
      size: 0.15,
      height: 0.02,
    });
    resultMesh = new THREE.Mesh(resultGeometry, resultMaterial);
    resultMesh.position.set(-0.5, -0.5, 0);
    anchor.group.add(resultMesh);
  };

  const shuffled = [...targetSequence].sort(() => Math.random() - 0.5);
  shuffled.forEach((letter, i) => {
    const geometry = new THREE.TextGeometry(letter, {
      font,
      size: 0.2,
      height: 0.05,
    });
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const mesh = new THREE.Mesh(geometry, material);
    const angle = (i / shuffled.length) * Math.PI * 2;
    const radius = 0.5;
    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * 0.4 + 0.2, 0);
    mesh.name = letter;
    anchor.group.add(mesh);
    letters.push(mesh);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const onTouch = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    pointer.set(x, y);
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(letters);
    if (intersects.length > 0) {
      const selected = intersects[0].object;
      const letter = selected.name;
      const expected = targetSequence[clickedLetters.length];
      if (letter === expected) {
        selected.visible = false;
        selected.material.color.set(0x00ff00);
        clickedLetters.push(letter);
        updateResult();
      } else {
        selected.material.color.set(0xff0000);
      }
      if (clickedLetters.length === targetSequence.length) {
        const geometry = new THREE.TextGeometry("¡Muy bien!", {
          font,
          size: 0.25,
          height: 0.05,
        });
        const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const finalText = new THREE.Mesh(geometry, material);
        finalText.position.set(-0.5, -0.3, 0);
        anchor.group.add(finalText);
      }
    }
  };

  window.addEventListener("click", onTouch);
  window.addEventListener("touchstart", (e) => {
    if (e.touches.length > 0) onTouch(e.touches[0]);
  });
};
