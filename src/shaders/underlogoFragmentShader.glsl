uniform vec3 color;
uniform vec3 borderColor;
uniform float borderThickness;
uniform sampler2D logoTexture;

varying vec2 vUv;

void main() {
    vec4 logoTexel = texture2D(logoTexture, vUv);
    float alpha = logoTexel.a;

    // Créer un effet de bordure
    vec2 border = smoothstep(vec2(0.0), vec2(borderThickness), vUv) * 
                smoothstep(vec2(0.0), vec2(borderThickness), 1.0 - vUv);
    float borderAlpha = min(border.x, border.y);

    // Mélanger la couleur de fond avec la bordure
    vec3 finalColor = mix(borderColor, color, borderAlpha);

    // Appliquer l'alpha du logo
    gl_FragColor = vec4(finalColor, alpha > 0.01 ? 1.0 : 0.0);
}