const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '/static/assets/targets/targets (3).mind',
    });

    const { renderer, scene, camera } = mindarThree;

    const anchor = mindarThree.addAnchor(0);

    // Confirmar detección del marcador
    anchor.onTargetFound = () => {
      console.log("🎯 MARCADOR DETECTADO");
    };

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Fuente y letras
    const fontLoader = new THREE.FontLoader();
    fontLoader.load('/static/assets/fonts/helvetiker_regular.typeface.json', (font) => {
      console.log("✅ Fuente cargada correctamente");

      const word = "ESCUELA";
      const targetSequence = word.split('');
      const clickedLetters = [];
      const letters = [];

      // Mezclar las letras
      const shuffled = [...targetSequence].sort(() => Math.random() - 0.5);

      shuffled.forEach((letter, i) => {
        const geometry = new THREE.TextGeometry(letter, {
          font: font,
          size: 0.2,
          height: 0.05,
        });
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
        const mesh = new THREE.Mesh(geometry, material);

        // Posición circular flotante
        const angle = (i / shuffled.length) * Math.PI * 2;
        const radius = 0.5;
        mesh.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * 0.4 + 0.2,
          0
        );
        mesh.name = letter;
        anchor.group.add(mesh);
        letters.push(mesh);
      });

      // Raycaster
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
            selected.material.color.set(0x00ff00); // Verde
            clickedLetters.push(letter);
          } else {
            selected.material.color.set(0xff0000); // Rojo
          }

          // ¿Completó la palabra?
          if (clickedLetters.length === targetSequence.length) {
            const geometry = new THREE.TextGeometry("¡Muy bien!", {
              font: font,
              size: 0.25,
              height: 0.05,
            });
            const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
            const finalText = new THREE.Mesh(geometry, material);
            finalText.position.set(-0.5, -0.3, 0);
            anchor.group.add(finalText);
            console.log("✅ Juego completado: ESCUELA");
          }
        }
      };

      window.addEventListener('click', onTouch);
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          onTouch(e.touches[0]);
        }
      });
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  start();
});
