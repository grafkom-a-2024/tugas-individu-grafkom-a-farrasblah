function main(){
    var canvas = document.getElementById('myCanvas');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log("WebGL tidak didukung, mencoba dengan eksperimen WebGL.");
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl) {
        alert("Browser Anda tidak mendukung WebGL.");
        return;
    }

    var vertices = new Float32Array([
        // Bagian vertikal dari L
        -0.5,  0.5,
        -0.3,  0.5,
        -0.3, -0.5,
        -0.5, -0.5,

        // Bagian horizontal dari L
        -0.3, -0.3,
         0.3, -0.3,
         0.3, -0.5,
        -0.3, -0.5
    ]);

    // Buat buffer untuk menyimpan vertex
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Vertex shader dengan translasi
    var vertCode = `
        attribute vec2 coordinates;
        uniform vec2 u_translation;
        void main(void) {
            gl_Position = vec4(coordinates + u_translation, 0.0, 1.0);
        }`;
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    // Fragment shader untuk warna hitam
    var fragCode = `
        void main(void) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Warna hitam
        }`;
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    // Buat dan gunakan program shader
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Hubungkan buffer dengan atribut shader
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    // Ambil lokasi uniform untuk translasi
    var translationLocation = gl.getUniformLocation(shaderProgram, "u_translation");

    var translation = [0.0, 0.0];

    // Fungsi untuk menggambar ulang scene
    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Set translasi
        gl.uniform2fv(translationLocation, translation);

        // Gambar bentuk L
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // Bagian vertikal
        gl.drawArrays(gl.TRIANGLE_FAN, 4, 4); // Bagian horizontal
    }

    // Event listener untuk slider X
    document.getElementById('x').addEventListener('input', function(event) {
        translation[0] = parseFloat(event.target.value);
        drawScene();
    });

    // Event listener untuk slider Y
    document.getElementById('y').addEventListener('input', function(event) {
        translation[1] = parseFloat(event.target.value);
        drawScene();
    });

    // Inisialisasi warna latar belakang dan gambar awal
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // Latar belakang putih
    drawScene();
}

main();




