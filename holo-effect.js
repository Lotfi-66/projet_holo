document.addEventListener('DOMContentLoaded', () => {
    const logoWrapper = document.getElementById('logo-wrapper');
    const logo = document.getElementById('logo');
    const sparkle = document.getElementById('sparkle');
    const holoLines = document.getElementById('holo-lines');

    function createHoloLines() {
        for (let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'holo-line';
            line.style.top = `${Math.random() * 100}%`;
            line.style.animationDelay = `${Math.random() * 5}s`;
            holoLines.appendChild(line);
        }
    }

    function updateHoloEffect(event) {
        const rect = logo.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const angleX = ((y - centerY) / rect.height) * 20;
        const angleY = ((x - centerX) / rect.width) * -20;

        logo.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;

        const intensity = Math.min(1, Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / Math.sqrt(centerX ** 2 + centerY ** 2));
        
        const hue = (Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 180) % 360;

        logo.style.filter = `
            hue-rotate(${hue}deg)
            saturate(${100 + intensity * 150}%)
            brightness(${100 + intensity * 50}%)
            contrast(${100 + intensity * 30}%)
        `;

        sparkle.style.opacity = Math.max(0, 1 - intensity);
        holoLines.style.opacity = intensity;
    }

    logoWrapper.addEventListener('mouseenter', () => {
        sparkle.style.opacity = '1';
        holoLines.style.opacity = '1';
    });

    logoWrapper.addEventListener('mouseleave', () => {
        logo.style.filter = 'none';
        logo.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        sparkle.style.opacity = '0';
        holoLines.style.opacity = '0';
    });

    logoWrapper.addEventListener('mousemove', updateHoloEffect);

    createHoloLines();
});