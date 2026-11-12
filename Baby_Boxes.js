/*
 * CS 360/560 - Introduction to Computer Graphics, Fall 2026
 * Project 5 - Babylon.js Boxes
 * Author: Shyam Patel
 */

var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
        
var camera;

var createScene = async function () {
   /* ———————————————————
      1.  BASIC SCENE SETUP
   ———————————————————— */
   const scene = new BABYLON.Scene(engine);

   // Even, realistic PBR lighting for any GLB (⚠️ NEW)
   scene.createDefaultEnvironment({
        createGround: false,     // we already make our own ground
        createSkybox: false,
        environmentIntensity: 1.0
   });

   // Lights (keep if you like—you now have the HDRI + these)
   const light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 100, 100), scene);
   const fill = new BABYLON.HemisphericLight("fill", new BABYLON.Vector3(0, 1, 0), scene);   // soft light so glb models are never black
   fill.intensity = 0.8;

   // Camera
   camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 50, BABYLON.Vector3.Zero(), scene);
   camera.attachControl(canvas, true);

   // Ground
   //const ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 10, scene);
   //ground.position.y = -10;

   var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
   ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.8, restitution: 0.5, disableBidirectionalTransformation: true }, scene);
   ground.checkCollisions = true;
   ground.material = new BABYLON.GridMaterial("mat", scene);

   /* ———————————————————
   2.  DEMO BOXES (unchanged)
   ———————————————————— */
   const box  = BABYLON.Mesh.CreateBox("box", 4.0, scene);
   box.position.y = 2;
   box.isPickable = true;
   const matBox = new BABYLON.StandardMaterial("matBox", scene);
   matBox.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
   box.material = matBox;

   const box2 = BABYLON.Mesh.CreateBox("box2", 8.0, scene);
   box2.position.set(-20, 4, 0);
   const matBox2 = new BABYLON.StandardMaterial("matBox2", scene);
   matBox2.diffuseColor = new BABYLON.Color3(0.1, 0.1, 1);
   box2.material = matBox2;

   // NEW: green sphere
   const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 6, segments: 32 }, scene);
   sphere.position.set(0, 3, -15);
   sphere.isPickable = true;
   const matSphere = new BABYLON.StandardMaterial("matSphere", scene);
   matSphere.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.3);
   sphere.material = matSphere;

   /* ———————————————————
   3.  IMPORT HEART MODEL
   ———————————————————— */
   BABYLON.SceneLoader.ImportMesh("", "./", "HeartFinalized.glb", scene,
   function (meshes) {
        const heart = meshes[0];

        // Position & scale
        heart.position.set(15, 2, 30);
        heart.scaling.setAll(5);        // make it bigger
        heart.isPickable = true;        // allow grabbing

        /* DEBUG COLOR (uncomment if model still shows black)
        const mat = new BABYLON.StandardMaterial("heartMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        heart.material = mat;
         */

        console.log("Heart loaded!");
    }
   );

   /* ———————————————————
   3b. IMPORT DUCK MODEL (NEW)
   ———————————————————— */
   BABYLON.SceneLoader.ImportMesh("", "./", "Duck.glb", scene,
   function (meshes) {
        const duck = meshes[0];
        duck.position.set(-15, 0, 25);
        duck.scaling.setAll(5);
        meshes.forEach(m => m.isPickable = true);   // allow grabbing
        console.log("Duck loaded!");
    }
   );

   /* ———————————————————
   4.  WEB‑XR SETUP (unchanged)
    ———————————————————— */
    
    const xrHelper = await scene.createDefaultXRExperienceAsync({
       floorMeshes: [ground]
    });

    let grabbedMesh = null;
    xrHelper.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((mc) => {
    if (mc.handness === "left") {
        const trigger = mc.getComponent(mc.getComponentIds()[0]); // xr-standard-trigger
        trigger.onButtonStateChangedObservable.add(() => {
        if (trigger.changes.pressed) {
            if (trigger.pressed) {
              grabbedMesh = xrHelper.pointerSelection.getMeshUnderPointer(controller.uniqueId);
              if (grabbedMesh && grabbedMesh !== ground) {
                grabbedMesh.setParent(mc.rootMesh); // grab
              }
              } else {
                 grabbedMesh && grabbedMesh.setParent(null); // release
              }
        }
        });
                                }
    });
    });

    return scene;
    };


    window.initFunction = async function() {
                                
    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
                        }
        }

        window.engine = await asyncEngineCreation();
                    
        const engineOptions = window.engine.getCreationOptions?.();
        if (!engineOptions || engineOptions.audioEngine !== false) {
                        
        }
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        window.scene = createScene();};
        initFunction().then(() => {scene.then(returnedScene => { sceneToRender = returnedScene; });
        
        });

        // Resize
        window.addEventListener("resize", function () {
           engine.resize();
        });
  