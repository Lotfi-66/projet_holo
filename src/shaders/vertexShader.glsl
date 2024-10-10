varying vec2 vUv;
varying vec3 vNormal;
varying float vPeel;
varying float vFacing;

uniform float unrollProgress;

#define PI 3.14159265359

void main() {
    vUv = uv;

    // Calcul de l'effet de décollement diagonal
    float diagonalProgress = (vUv.x + vUv.y) * 0.5;
    vPeel = smoothstep(-0.2, 1.0, (unrollProgress - diagonalProgress) / 1.2);

    vec3 pos = position;
    vec3 norm = normal; // Utiliser la normale originale

    if (vPeel > 0.0) {
        // Calcul de l'axe de rotation (perpendiculaire à la diagonale)
        vec3 rotationAxis = normalize(vec3(1.0, -1.0, 0.0));

        // Angle de rotation basé sur la progression du décollement
        float angle = vPeel * PI;

        // Matrice de rotation autour de l'axe calculé
        float c = cos(angle);
        float s = sin(angle);
        float t = 1.0 - c;
        mat3 rotMat = mat3(
            t * rotationAxis.x * rotationAxis.x + c,
            t * rotationAxis.x * rotationAxis.y - s * rotationAxis.z,
            t * rotationAxis.x * rotationAxis.z + s * rotationAxis.y,
            t * rotationAxis.x * rotationAxis.y + s * rotationAxis.z,
            t * rotationAxis.y * rotationAxis.y + c,
            t * rotationAxis.y * rotationAxis.z - s * rotationAxis.x,
            t * rotationAxis.x * rotationAxis.z - s * rotationAxis.y,
            t * rotationAxis.y * rotationAxis.z + s * rotationAxis.x,
            t * rotationAxis.z * rotationAxis.z + c
        );

        // Application de la rotation
        pos = rotMat * pos;
        norm = rotMat * norm; // Appliquer la même transformation aux normales

        // Ajout d'une courbure progressive
        float curveFactor = vPeel * vPeel * 0.1;
        pos.z += curveFactor * sin(PI * diagonalProgress);

        // Calcul du rayon d'enroulement
        float radius = 0.1; // Ajustez cette valeur pour changer le rayon de l'enroulement
        float enrollAngle = max(0.0, angle - PI * 0.5); // Commence l'enroulement après 90 degrés

        // Appliquer l'enroulement
        if (enrollAngle > 0.0) {
            float x = sin(enrollAngle) * radius;
            float y = (1.0 - cos(enrollAngle)) * radius;
            pos.x += x;
            pos.y += y;
            pos.z += radius * (1.0 - cos(enrollAngle * 0.5));
        }

        // Déplacement vers le haut à droite
        vec2 moveDirection = normalize(vec2(1.0, 1.0));
        float moveAmount = vPeel * 0.3; // Ajustez cette valeur pour contrôler l'amplitude du mouvement
        pos.xy += moveDirection * moveAmount;
    }

    vNormal = normalMatrix * norm; // Calculer les normales transformées

    // Calculer si nous sommes sur la face avant ou arrière
    vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
    vFacing = dot(normalize(modelViewPosition.xyz), normalize(norm));

    gl_Position = projectionMatrix * modelViewPosition;
}