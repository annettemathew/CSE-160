class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];  // Fixed typo in alpha value (was 1,0)
        this.matrix = new Matrix4();
        this.textureNum = -2;  // Default to solid color
        this.normalMatrix = new Matrix4();  // For potential lighting calculations
    }

    render1() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
        /*  var xy = g_points[i];
        var rgba = g_colors[i];
        var size = g_sizes[i]; */

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // Pass the size of a point to u_Size variable
        //gl.uniform1f(u_Size, size);
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        // Draw
        //var d = this.size/200.0;
        //gl.drawArrays(gl.POINTS, 0, 1);

        //let angleStep = 360/this.segments;
        /*for(var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }*/
        //drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
    
        // Front of cube
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);
        // Back, Top, Bottom, Right, Left

        // Pass the color of a point to a u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        // Back:
        drawTriangle3DUV([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // Top:
        drawTriangle3DUV([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);

        // Pass the color of a point to a u_FragColor uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        // Bottom:
        drawTriangle3DUV([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0], [0,0, 0,1, 1,1]);

        // Pass the color of a point to a u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        // Right:
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0], [0,1, 1,0, 0,0]);
        drawTriangle3DUV([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0], [0,1, 1,1, 1,0]);
        // Pass the color of a point to a u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        // Left:
        drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0], [0,1, 1,0, 0,0]);
        drawTriangle3DUV([1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0], [0,1, 1,1, 1,0]);


    }
    render() {
        const rgba = this.color;
        
        // Pass the texture number to shader
        gl.uniform1i(u_whichTexture, this.textureNum);
        
        // Pass the color to shader (used if textureNum == -2)
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass the model matrix to shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Calculate normal matrix (transpose inverse of model matrix)
        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        // If you have a normal matrix uniform, you would pass it here

        // Define all vertices and UVs at once for better performance
        const vertices = new Float32Array([
            // Front face
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0,
            
            // Back face
            0, 0, 1,  1, 0, 1,  1, 1, 1,
            0, 0, 1,  1, 1, 1,  0, 1, 1,
            
            // Top face
            0, 1, 0,  1, 1, 1,  1, 1, 0,
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            
            // Bottom face
            0, 0, 0,  1, 0, 0,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  0, 0, 1,
            
            // Right face
            1, 0, 0,  1, 1, 1,  1, 0, 1,
            1, 0, 0,  1, 1, 0,  1, 1, 1,
            
            // Left face
            0, 0, 0,  0, 0, 1,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 1, 0
        ]);

        const uvs = new Float32Array([
            // Front
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1,
            
            // Back
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            
            // Top
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1,
            
            // Bottom
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1,
            
            // Right
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1,
            
            // Left
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1
        ]);

        // Draw all triangles at once
        drawTriangle3DUV(vertices, uvs);
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