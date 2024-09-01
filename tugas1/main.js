function main(){
    var canvas = document.getElementById("myCanvas");
    var gl = canvas.getContext("webgl");

    if (!gl) {
        console.log("WebGL tidak didukung, mencoba dengan eksperimen WebGL.");
        gl = canvas.getContext("experimental-webgl");
    }

    if (!gl) {
        alert("Browser Anda tidak mendukung WebGL.");
        return;
    }

    // Warnai canvas dengan warna hitam
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Hitam dengan opasitas penuh
    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertices = new Float32Array([
        0.0,  0.5,  
       -0.5, -0.5,  
        0.5, -0.5   
    ]);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


    // Membuat vertex shader
    var vertexShaderSource = `
        attribute vec2 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    // Membuat fragment shader
    var fragmentShaderSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Warna putih
        }
    `;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Membuat program dan menggabungkan shader
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Menggambar segitiga
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();





