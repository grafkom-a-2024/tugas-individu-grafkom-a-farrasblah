const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.log("WebGL tidak didukung, mencoba dengan eksperimen WebGL.");
    gl = canvas.getContext('experimental-webgl');
}

if (!gl) {
    console.error("WebGL tidak dapat diinisialisasi.");
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
const positions = [
    // Front face
    -0.5, -0.5, 0.5,   0.5, -0.5, 0.5,   0.5, 0.5, 0.5,   -0.5, 0.5, 0.5,
    // Back face
    -0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,   0.5, 0.5, -0.5,   0.5, -0.5, -0.5,
    // Top face
    -0.5, 0.5, -0.5,   -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,   0.5, 0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5, 0.5,   -0.5, -0.5, 0.5,
    // Right face
    0.5, -0.5, -0.5,   0.5, 0.5, -0.5,   0.5, 0.5, 0.5,   0.5, -0.5, 0.5,
    // Left face
    -0.5, -0.5, -0.5,  -0.5, -0.5, 0.5,   -0.5, 0.5, 0.5,   -0.5, 0.5, -0.5,
];

const faceColors = [
    [1.0, 0.0, 0.0, 1.0], // Red
    [0.0, 1.0, 0.0, 1.0], // Green
    [0.0, 0.0, 1.0, 1.0], // Blue
    [1.0, 1.0, 0.0, 1.0], // Yellow
    [1.0, 0.0, 1.0, 1.0], // Magenta
    [0.0, 1.0, 1.0, 1.0], // Cyan
];

const textureCoordinates = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];

const textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);


const colors = [].concat(...faceColors.map(color => Array(4).fill(color)).flat());

function initBuffers(gl) {
    const texture = loadTexture(gl, "https://webglfundamentals.org/webgl/resources/f-texture.png");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer(); // Tambahkan buffer koordinat tekstur
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23, // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer, // Kembalikan buffer koordinat tekstur
        indices: indexBuffer,
        texture: texture,
    };
}

// Fungsi untuk memuat gambar tekstur
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const pixel = new Uint8Array([255, 0, 255, 255]); // magenta sementara
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, internalFormat, gl.UNSIGNED_BYTE, pixel);

    const image = new Image();
    image.crossOrigin = "anonymous"; // Tambahkan ini
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, internalFormat, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = url;

    return texture;
}


function initShaders(gl) {
    const vertexShaderSource = `
        attribute vec4 vertexPosition;
        attribute vec2 vertexTexCoord;  // Tambah koordinat tekstur
        varying vec2 fragTexCoord;      // Teruskan ke fragment shader
        uniform mat4 modelViewMatrix;

        void main(void) {
            gl_Position = modelViewMatrix * vertexPosition;
            fragTexCoord = vertexTexCoord; // Kirim ke fragment shader
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        varying vec2 fragTexCoord;
        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, fragTexCoord); // Ambil warna dari tekstur
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram));
    }

    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'vertexPosition'),
            vertexTexCoord: gl.getAttribLocation(shaderProgram, 'vertexTexCoord'), // Tambah lokasi atribut untuk koordinat tekstur
        },
        uniformLocations: {
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'modelViewMatrix'),
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
        },
    };
}


function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const programInfo = initShaders(gl);
const buffers = initBuffers(gl);

let cubeRotation = 0.0;

function drawScene(gl, programInfo, buffers, cubeRotation) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(programInfo.program);

    // Posisi vertex
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Koordinat tekstur
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexTexCoord, 2, gl.FLOAT, false, 0, 0); // Enable texCoord attribute
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexTexCoord);

    // Tekstur
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buffers.texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    // Indeks
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    const modelViewMatrix = mat4.create();
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.7, [0, 1, 0]);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}


let lastTime = 0;

function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000; // Mengubah milidetik menjadi detik
    lastTime = currentTime;

    cubeRotation += deltaTime; // Update rotasi

    drawScene(gl, programInfo, buffers, cubeRotation);
    requestAnimationFrame(animate); // Minta frame berikutnya
}

requestAnimationFrame(animate);