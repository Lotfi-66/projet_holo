import * as THREE from 'three';
import './style.css';

let scene, camera, renderer, logo, raycaster;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let isMouseOverLogo = false;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111); // Fond sombre

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();

    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('/BENOW.png');
    const holoTexture = textureLoader.load('/Holo.jpg');

    const material = new THREE.ShaderMaterial({
        uniforms: {
            logoTexture: { value: logoTexture },
            holoTexture: { value: holoTexture },
            time: { value: 0 },
            rotationX: { value: 0 },
            rotationY: { value: 0 },
            mousePosition: { value: new THREE.Vector2(0, 0) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D logoTexture;
            uniform sampler2D holoTexture;
            uniform float time;
            uniform float rotationX;
            uniform float rotationY;
            uniform vec2 mousePosition;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vec4 logoColor = texture2D(logoTexture, vUv);
                
                vec2 holoUv = vUv * 0.8 + 0.1; // Zoom de 20%
                holoUv.y -= rotationX * 0.2;
                holoUv.x += rotationY * 0.2;
                
                vec4 holoColor = texture2D(holoTexture, fract(holoUv));
                
                // Lumière directionnelle venant du haut
                vec3 lightDir = normalize(vec3(0.0, 1.0, 0.5));
                float diffuse = max(dot(vNormal, lightDir), 0.0);
                
                vec3 viewDir = normalize(vViewPosition);
                vec3 halfDir = normalize(lightDir + viewDir);
                float specular = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
                
                vec3 finalColor = mix(logoColor.rgb, holoColor.rgb, 0.5);
                finalColor *= (diffuse * 0.8 + 0.5); // Ajout de l'éclairage diffus
                finalColor += holoColor.rgb * sin(time * 2.0) * 0.1;
                finalColor += vec3(1.0) * specular * 0.8;
                
                gl_FragColor = vec4(finalColor, logoColor.a);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    logo = new THREE.Mesh(geometry, material);
    scene.add(logo);

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onMouseMove(event) {
    event.preventDefault();

    const rect = renderer.domElement.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    const intersects = raycaster.intersectObject(logo);
    isMouseOverLogo = intersects.length > 0;

    if (isMouseOverLogo) {
        targetRotationY = mouseX * 1.5;
        targetRotationX = mouseY * 1.5;
        logo.material.uniforms.mousePosition.value.set(mouseX, mouseY);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (isMouseOverLogo) {
        logo.rotation.x += (targetRotationX - logo.rotation.x) * 0.1;
        logo.rotation.y += (targetRotationY - logo.rotation.y) * 0.1;
    } else {
        logo.rotation.x += (0 - logo.rotation.x) * 0.05;
        logo.rotation.y += (0 - logo.rotation.y) * 0.05;
    }

    logo.material.uniforms.time.value += 0.016;
    logo.material.uniforms.rotationX.value = logo.rotation.x;
    logo.material.uniforms.rotationY.value = logo.rotation.y;

    renderer.render(scene, camera);
}

init();
animate();