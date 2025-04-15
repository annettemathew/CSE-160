class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.verts = null; // default: no custom verts
    }

    render() {
        const rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        let vertsToDraw;

        if (this.verts && this.verts.length === 6) {
            // Use custom triangle vertices
            vertsToDraw = this.verts;
        } else {
            // Default: small triangle at this.position
            const [x, y] = this.position;
            const radius = this.size / 200.0;
            const angleOffset = Math.PI / 2;

            vertsToDraw = [];
            for (let i = 0; i < 3; i++) {
                const angle = angleOffset + (i * 2 * Math.PI / 3);
                vertsToDraw.push(x + radius * Math.cos(angle));
                vertsToDraw.push(y + radius * Math.sin(angle));
            }
        }

        drawTriangle(vertsToDraw);
    }
}


function drawTriangle(vertices) {
    //var vertices = new Float32Array([
    //  0, 0.5,   -0.5, -0.5,   0.5, -0.5
    //]);
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
    //  console.log('Failed to get the storage location of a_Position');
    //  return -1;
   // }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
    //return n;
  }
