varying vec2 vUv;
uniform float depth;

void main() {
    vUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    modelViewPosition.z -= depth;
    gl_Position = projectionMatrix * modelViewPosition;
}