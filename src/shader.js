let vs = `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec3 a_normal;

uniform mat4 u_matrix;
uniform vec3 u_lightDirection;

out vec4 v_color;
out float v_lightWeight;

void main() {
    vec3 normal = normalize((u_matrix * vec4(a_normal, 0.0)).xyz);
    float nDotL = max(dot(normal, normalize(u_lightDirection)), 0.0);
    v_lightWeight = nDotL;

    gl_Position = u_matrix * a_position;
    v_color = a_color;
}`;

let fs = `#version 300 es
precision highp float;

in float v_lightWeight;
in vec4 v_color;

uniform vec4 u_pureColor;
uniform vec3 u_lightColor;

out vec4 outColor;

void main() {
    vec3 ambientComponent = vec3(0.25, 0.25, 0.25);
    vec3 lightEffect = u_lightColor * v_lightWeight;
    vec3 color = (u_pureColor.rgb * lightEffect) + ambientComponent;
    float alpha = u_pureColor.a;

    outColor = vec4(color, alpha);
}`;


export { vs, fs }