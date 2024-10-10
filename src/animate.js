import * as THREE from 'three';

export function animate(logo, renderer, scene, camera) {
    let unrollProgress = 0;
    let hoverActive = false;
    let unrollSpeed = 0.005;

    function animateFrame() {
        requestAnimationFrame(animateFrame);

        // Appliquer une rotation fluide lorsqu'on survole le logo
        if (logo.isMouseOver) {
            hoverActive = true;
            logo.rotation.x += (logo.targetRotationX - logo.rotation.x) * 0.1;
            logo.rotation.y += (logo.targetRotationY - logo.rotation.y) * 0.1;
        } else {
            hoverActive = false;
            logo.rotation.x += (0 - logo.rotation.x) * 0.05;
            logo.rotation.y += (0 - logo.rotation.y) * 0.05;
        }

        // Gestion de l'animation de déroulement
        if (hoverActive && unrollProgress < 1) {
            unrollProgress += unrollSpeed;
            if (unrollProgress >= 1) unrollProgress = 1;
        } else if (!hoverActive && unrollProgress > 0) {
            unrollProgress -= unrollSpeed;
            if (unrollProgress <= 0) unrollProgress = 0;
        }

        // Mettre à jour les uniformes des shaders
        logo.material.uniforms.unrollProgress.value = unrollProgress;
        logo.material.uniforms.time.value += 0.016;
        logo.material.uniforms.rotationX.value = logo.rotation.x;
        logo.material.uniforms.rotationY.value = logo.rotation.y;

        renderer.render(scene, camera);
    }

    document.addEventListener('mousemove', (event) => {
        if (logo.isMouseOver) {
            const rect = renderer.domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            logo.targetRotationY = x * 0.5;
            logo.targetRotationX = y * 0.5;
        }
    });

    document.addEventListener('mouseover', (event) => {
        if (event.target === renderer.domElement) {
            logo.isMouseOver = true;
        }
    });

    document.addEventListener('mouseout', (event) => {
        if (event.target === renderer.domElement) {
            logo.isMouseOver = false;
        }
    });

    animateFrame();
}