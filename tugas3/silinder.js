let texture;

// Load the texture
function loadTexture(gl, url) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 0, 255]); // opaque black
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, internalFormat, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = url;

    return texture;
}

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

function createCylinder(radius, height, numSegments) {
    const positions = [];
    const indices = [];
    const textureCoordinates = [];
    
    for (let i = 0; i <= numSegments; ++i) {
        const angle = i * 2 * Math.PI / numSegments;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions.push(x, height / 2, z);
        textureCoordinates.push(i / numSegments, 0);
        positions.push(x, -height / 2, z);
        textureCoordinates.push(i / numSegments, 1);
    }

    for (let i = 0; i < numSegments; ++i) {
        const p1 = i * 2;
        const p2 = p1 + 1;
        const p3 = (i * 2 + 2) % (numSegments * 2);
        const p4 = (i * 2 + 3) % (numSegments * 2);

        indices.push(p1, p2, p3);
        indices.push(p2, p4, p3);
    }

    const topCenter = positions.length / 3;
    positions.push(0, height / 2, 0);
    textureCoordinates.push(0.5, 0);
    for (let i = 0; i < numSegments; ++i) {
        indices.push(i * 2, topCenter, (i * 2 + 2) % (numSegments * 2));
    }

    const bottomCenter = positions.length / 3;
    positions.push(0, -height / 2, 0);
    textureCoordinates.push(0.5, 1);
    for (let i = 0; i < numSegments; ++i) {
        indices.push((i * 2 + 1) % (numSegments * 2), bottomCenter, (i * 2 + 3) % (numSegments * 2));
    }

    return {
        positions: positions,
        indices: indices,
        textureCoordinates: textureCoordinates,
    };
}

const cylinderData = createCylinder(0.5, 1.0, 32);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderData.positions), gl.STATIC_DRAW);

const textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinderData.textureCoordinates), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinderData.indices), gl.STATIC_DRAW);

texture = loadTexture(gl, "https://webglfundamentals.org/webgl/resources/f-texture.png");

function initShaders(gl) {
    const vertexShaderSource = `
        attribute vec4 vertexPosition;
        attribute vec2 vertexTexCoord;
        varying vec2 fragTexCoord;

        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        void main(void) {
            gl_Position = projectionMatrix * modelViewMatrix * vertexPosition;
            fragTexCoord = vertexTexCoord;
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        varying vec2 fragTexCoord;
        uniform sampler2D uSampler;

        void main(void) {
            gl_FragColor = texture2D(uSampler, fragTexCoord);
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
            vertexTexCoord: gl.getAttribLocation(shaderProgram, 'vertexTexCoord'),
        },
        uniformLocations: {
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'modelViewMatrix'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'projectionMatrix'),
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

function drawScene(gl, programInfo) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(programInfo.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexTexCoord);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -3]);

    // Tambahkan rotasi pada sumbu X dan Y
    const rotationX = Date.now() / 1000; // rotasi berdasarkan waktu
    const rotationY = Date.now() / 1000; // rotasi berdasarkan waktu

    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationX, [1, 0, 0]); // rotasi sumbu X
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationY, [0, 1, 0]); // rotasi sumbu Y

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

    gl.drawElements(gl.TRIANGLES, cylinderData.indices.length, gl.UNSIGNED_SHORT, 0);
}

function animate() {
    drawScene(gl, programInfo);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
