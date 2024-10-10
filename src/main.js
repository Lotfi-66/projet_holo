import * as THREE from 'three';
import { animate } from './animate.js';
import vertexShaderSource from './shaders/vertexShader.glsl?raw';
import fragmentShaderSource from './shaders/fragmentShader.glsl?raw';
import underlogoVertexShaderSource from './shaders/underlogoVertexShader.glsl?raw';
import underlogoFragmentShaderSource from './shaders/underlogoFragmentShader.glsl?raw';
import './style.css';

// Déclaration des variables globales
let scene, camera, renderer, logo, raycaster, underlogoShape;

function init() {
    // Création de la scène
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Configuration de la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Configuration du renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Création du raycaster pour la détection de la souris
    raycaster = new THREE.Raycaster();

    // Chargement des textures
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('/BENOW.png');
    const holoTexture = textureLoader.load('/Holo.jpg');

    // Création du matériau ShaderMaterial pour le logo
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShaderSource,
        fragmentShader: fragmentShaderSource,
        uniforms: {
            logoTexture: { value: logoTexture },
            holoTexture: { value: holoTexture },
            time: { value: 0 },
            rotationX: { value: 0 },
            rotationY: { value: 0 },
            mousePosition: { value: new THREE.Vector2(0, 0) },
            unrollProgress: { value: 0 },
            borderColor: { value: new THREE.Color(0xffffff) },
            borderThickness: { value: 0.01 },
            underlogoColor: { value: new THREE.Color(0x000000) }
        },
        transparent: true,
        side: THREE.DoubleSide
    });

    // Création de la géométrie et du mesh du logo
    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    logo = new THREE.Mesh(geometry, material);
    logo.isMouseOver = false;
    logo.targetRotationX = 0;
    logo.targetRotationY = 0;
    scene.add(logo);

    // Création de la forme sous le logo
    const underlogoGeometry = new THREE.PlaneGeometry(2.1, 2.1, 32, 32);
    const underlogoMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0x000000) },
            borderColor: { value: new THREE.Color(0xffffff) },
            borderThickness: { value: 0.05 },
            depth: { value: 0.3 }
        },
        vertexShader: underlogoVertexShaderSource,
        fragmentShader: underlogoFragmentShaderSource,
        transparent: true
    });
    underlogoShape = new THREE.Mesh(underlogoGeometry, underlogoMaterial);
    underlogoShape.position.z = -0.01;
    scene.add(underlogoShape);

    // Ajout des écouteurs d'événements
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onMouseMove(event) {
    event.preventDefault();

    // Calcul de la position de la souris en coordonnées normalisées
    const rect = renderer.domElement.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Vérification si la souris est sur le logo
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    const intersects = raycaster.intersectObject(logo);
    logo.isMouseOver = intersects.length > 0;

    if (logo.isMouseOver) {
        // Mise à jour de la rotation cible et de la position de la souris
        logo.targetRotationY = mouseX * 1.5;
        logo.targetRotationX = mouseY * 1.5;
        logo.material.uniforms.mousePosition.value.set(mouseX, mouseY);
    }
}

function onWindowResize() {
    // Mise à jour de la caméra et du renderer lors du redimensionnement de la fenêtre
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialisation de la scène
init();

// Démarrage de la boucle d'animation
animate(logo, renderer, scene, camera, underlogoShape);