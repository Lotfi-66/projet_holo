uniform vec3 color;
uniform sampler2D logoTexture;

varying vec2 vUv;

void main() {
    vec4 logoTexel = texture2D(logoTexture, vUv);
    float alpha = logoTexel.a;

    // Utiliser directement la couleur noire sans bordure
    vec3 finalColor = color;

    // Appliquer l'alpha du logo
    gl_FragColor = vec4(finalColor, alpha);
}