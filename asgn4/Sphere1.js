class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];  // Fixed typo in alpha value (was 1,0)
        this.matrix = new Matrix4();
        this.textureNum = -2;  // Default to solid color
        this.normalMatrix = new Matrix4();  // For potential lighting calculations
        this.verts32 = new Float32Array([]);
    }

    render() {
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // Only calculate normal matrix if not in normal visualization mode
        if(this.textureNum !== -3) {
            this.normalMatrix.setInverseOf(this.matrix);
            this.normalMatrix.transpose();
            gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
        }
    
        var d = Math.PI/10;
        var dd = Math.PI/10;
        for(var t = 0; t < Math.PI; t+= d) {
            for(var r = 0; r < (2*Math.PI); r+=d) {
                // Positions
                var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
                var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
                var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
                var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];
    
                // Normals (same as positions for unit sphere)
                var n1 = p1.slice();
                var n2 = p2.slice();
                var n3 = p3.slice();
                var n4 = p4.slice();
    
                // UVs
                var uv1 = [t/Math.PI, r/(2*Math.PI)];
                var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
                var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
                var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];
    
                // Triangle 1
                drawTriangle3DUVNormal(
                    [...p1, ...p2, ...p4],  // positions
                    [...uv1, ...uv2, ...uv4],  // UVs
                    [...n1, ...n2, ...n4]   // actual normals
                );
    
                // Triangle 2
                drawTriangle3DUVNormal(
                    [...p1, ...p4, ...p3],  // positions
                    [...uv1, ...uv4, ...uv3],  // UVs
                    [...n1, ...n4, ...n3]   // actual normals
                );
            }
        }
    }

    renderNormal() {
        var rgba = this.color;
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
    
        // Pass the color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass the matrices
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
    
        // Front face (Z-)
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], 
            [0,0, 1,1, 1,0], 
            [0, 0, -1, 0, 0, -1, 0, 0, -1]
        );
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], 
            [0,0, 0,1, 1,1], 
            [0, 0, -1, 0, 0, -1, 0, 0, -1]
        );
    
        // Back face (Z+)
        drawTriangle3DUVNormal(
            [0.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 1.0, 1.0], 
            [0,0, 1,0, 1,1], 
            [0, 0, 1, 0, 0, 1, 0, 0, 1]
        );
        drawTriangle3DUVNormal(
            [0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0], 
            [0,0, 1,1, 0,1], 
            [0, 0, 1, 0, 0, 1, 0, 0, 1]
        );
    
        // Top face (Y+)
        drawTriangle3DUVNormal(
            [0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0],  // Changed vertex order
            [0,0, 0,1, 1,1], 
            [0, 1, 0, 0, 1, 0, 0, 1, 0]
        );
        drawTriangle3DUVNormal(
            [0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0],  // Changed vertex order
            [0,0, 1,1, 1,0], 
            [0, 1, 0, 0, 1, 0, 0, 1, 0]
        );
    
        // Bottom face (Y-)
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], 
            [0,0, 1,1, 1,0], 
            [0, -1, 0, 0, -1, 0, 0, -1, 0]
        );
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], 
            [0,0, 0,1, 1,1], 
            [0, -1, 0, 0, -1, 0, 0, -1, 0]
        );
    
        // Right face (X+)
        drawTriangle3DUVNormal(
            [1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], 
            [0,0, 1,1, 0,1], 
            [1, 0, 0, 1, 0, 0, 1, 0, 0]
        );
        drawTriangle3DUVNormal(
            [1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0], 
            [0,0, 1,0, 1,1], 
            [1, 0, 0, 1, 0, 0, 1, 0, 0]
        );
    
        // Left face (X-)
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0, 1.0], 
            [0,0, 0,1, 1,1], 
            [-1, 0, 0, -1, 0, 0, -1, 0, 0]
        );
        drawTriangle3DUVNormal(
            [0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], 
            [0,0, 1,1, 1,0], 
            [-1, 0, 0, -1, 0, 0, -1, 0, 0]
        );
    }
}