uniform sampler2D logoTexture;
uniform sampler2D holoTexture;
uniform float time;
uniform float rotationX;
uniform float rotationY;
uniform vec2 mousePosition;

varying vec2 vUv;
varying vec3 vNormal;
varying float vPeel;
varying float vFacing;

// Fonction pour créer un flou gaussien simple
vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.3333333333333333) * direction;
    color += texture2D(image, uv) * 0.29411764705882354;
    color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
    color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
    return color;
}

// Fonction pour ajuster le contraste
vec3 adjustContrast(vec3 color, float contrast) {
    return (color - 0.5) * contrast + 0.5;
}

void main() {
    vec4 logoColor = texture2D(logoTexture, vUv);
    
    vec2 holoUv = vUv * 0.8 + 0.1;
    holoUv.y -= rotationX * 0.2;
    holoUv.x += rotationY * 0.2;
    
    vec4 holoColor = texture2D(holoTexture, fract(holoUv));
    
    // Lumière venant d'en haut avec intensité réduite
    vec3 lightDir = normalize(vec3(0.0, 1.0, 0.1));
    float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.01; // Réduire l'intensité à 50%
    
    // Rendre l'effet holographique plus transparent
    float holoAlpha = 0.2; // Ajustez cette valeur entre 0.0 et 1.0 pour contrôler la transparence
    vec3 mixedColor = mix(logoColor.rgb, holoColor.rgb, holoAlpha);
    
    // Appliquer les effets holographiques
    mixedColor += holoColor.rgb * sin(time * 2.0) * 0.5; // Réduire l'intensité de l'effet
    
    // Effet de brillance sur le bord décollé (symétrique)
    float peelHighlight = pow(abs(vPeel - 0.5) * 2.0, 4.0) * 0.5;
    mixedColor += vec3(peelHighlight);
    
    // Effet de flou d'éclairage créé par la souris
    float mouseDistance = distance(vUv, mousePosition);
    float mouseGlow = 1.0 - smoothstep(0.0, 0.3, mouseDistance);
    vec4 blurredLogo = blur(logoTexture, vUv, vec2(512.0, 512.0), vec2(2.0, 2.0));
    mixedColor = mix(mixedColor, blurredLogo.rgb, mouseGlow * 0.3);
    
    // Appliquer l'éclairage
    mixedColor *= (diffuse + 1.9); // Ajouter une lumière ambiante de base
    
    // Diminuer légèrement la luminosité globale
    mixedColor *= 0.2;
    
    // Ajuster le contraste
    float contrastValue = 1.8; // Augmenter cette valeur pour plus de contraste
    mixedColor = adjustContrast(mixedColor, contrastValue);
    
    // Conserver l'alpha original du logo
    gl_FragColor = vec4(mixedColor, logoColor.a);
}