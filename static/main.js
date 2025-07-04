import { iniciarJuegoOrdenarCubo } from "./juego-ordenar-cubos.js";
import { iniciarJuegoOperaciones } from "./juego-operaciones.js";

const THREE = window.MINDAR.IMAGE.THREE;


document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "/static/assets/targets/targets (3).mind",
    });

    const { renderer, scene, camera } = mindarThree;
    renderer.domElement.style.cursor = 'url("/static/assets/icons/cursor.png") 0 0, auto';

    const anchor = mindarThree.addAnchor(0);

    anchor.onTargetFound = () => {
      console.log("MARCADOR DETECTADO");
    };

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    let buttons = [];
    let currentTouchHandler = null;

    const createMenu = (font, anchor) => {
      buttons = [];

      // --------- BOTÓN 1: Letrappuzzle ---------
      const texto1 = "Letrappuzzle";
      const geo1 = new THREE.TextGeometry(texto1, {
        font: font,
        size: 0.10,
        height: 0.02,
      });
      geo1.computeBoundingBox();
      const width1 = geo1.boundingBox.max.x - geo1.boundingBox.min.x;
      const padding1 = 0.3;

      const box1 = new THREE.Mesh(
        new THREE.BoxGeometry(width1 + padding1, 0.4, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x0077ff })
      );
      box1.position.set(0, 0, -0.03);

      const text1 = new THREE.Mesh(
        geo1,
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      text1.position.set(-width1 / 2, -0.07, 0);

      const button1Group = new THREE.Group();
      button1Group.add(box1);
      button1Group.add(text1);
      button1Group.position.set(0, 0.4, 0);
      button1Group.name = "ordenar";
      anchor.group.add(button1Group);
      buttons.push(button1Group);

      // --------- BOTÓN 2: Matekids ---------
      const texto2 = "Matekids";
      const geo2 = new THREE.TextGeometry(texto2, {
        font: font,
        size: 0.10,
        height: 0.02,
      });
      geo2.computeBoundingBox();
      const width2 = geo2.boundingBox.max.x - geo2.boundingBox.min.x;
      const padding2 = 0.3;

      const box2 = new THREE.Mesh(
        new THREE.BoxGeometry(width2 + padding2, 0.4, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xff5500 })
      );
      box2.position.set(0, 0, -0.03);

      const text2 = new THREE.Mesh(
        geo2,
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      text2.position.set(-width2 / 2, -0.07, 0);

      const button2Group = new THREE.Group();
      button2Group.add(box2);
      button2Group.add(text2);
      button2Group.position.set(0, -0.1, 0);
      button2Group.name = "operaciones";
      anchor.group.add(button2Group);
      buttons.push(button2Group);
    };

    const setupTouchHandler = (anchor, font, camera) => {
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const handler = (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        pointer.set(x, y);
        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(buttons, true);
        if (intersects.length > 0) {
          const selectedGroup = intersects[0].object.parent;

          window.removeEventListener("click", currentTouchHandler);
          window.removeEventListener("touchstart", currentTouchHandler);

          anchor.group.clear();

          if (selectedGroup.name === "ordenar") {
            console.log("Iniciando juego de palabra...");
            iniciarJuegoOrdenarCubo(anchor, font, camera, () => {
              window.removeEventListener("click", currentTouchHandler);
              window.removeEventListener("touchstart", currentTouchHandler);
              window.onclick = null;
              window.ontouchstart = null;
              anchor.group.clear();
              createMenu(font, anchor);
              setupTouchHandler(anchor, font, camera);
            });
          } else if (selectedGroup.name === "operaciones") {
            console.log("Iniciando juego de operaciones...");
            iniciarJuegoOperaciones(anchor, font, camera, () => {
              window.removeEventListener("click", currentTouchHandler);
              window.removeEventListener("touchstart", currentTouchHandler);
              window.onclick = null;
              window.ontouchstart = null;
              anchor.group.clear();
              createMenu(font, anchor);
              setupTouchHandler(anchor, font, camera);
            });
          }
        }
      };

      currentTouchHandler = handler;
      window.addEventListener("click", handler);
      window.addEventListener("touchstart", (e) => {
        if (e.touches.length > 0) handler(e.touches[0]);
      });
    };

    const fontLoader = new THREE.FontLoader();
    fontLoader.load(
      "/static/assets/fonts/helvetiker_regular.typeface.json",
      (font) => {
        console.log("✅ Fuente cargada correctamente");
        createMenu(font, anchor);
        setupTouchHandler(anchor, font, camera);
      }
    );

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);

      if (scene.userData.finalText) {
        scene.userData.finalText.rotation.y += 0.01;
      }
    });
  };

  start();
});
