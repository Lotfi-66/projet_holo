document.addEventListener('DOMContentLoaded', function() {
    const card = document.querySelector('.card');
    const container = document.getElementById('logo-container');
    const shineEffect = document.querySelector('.shine-effect');

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = (centerX - x) / 9.5;
        const rotateX = (y - centerY) / 9.75;

        card.style.transform = `
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;

        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;
        shineEffect.style.backgroundPosition = `${shineX}% ${shineY}%`;
    });

    container.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
});