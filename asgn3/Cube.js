class Cube {
    constructor() {
        this.type= 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1,0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }

    render() {
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

    renderfaster() {
        //console.log("render faster()");
        const rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        const vertices = [
            // Front
            0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0,
            // Back
            0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0,
            0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0,
            // Top
            0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0,
            // Bottom
            0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0,
            // Right
            0.0, 0.0, 1.0,   0.0, 1.0, 0.0,   0.0, 0.0, 0.0,
            0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0,
            // Left
            1.0, 0.0, 1.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
            1.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0
        ];

        const uvs = [
            // Front
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            // Back
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            // Top
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            // Bottom
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            // Right
            0,1, 1,0, 0,0,
            0,1, 1,1, 1,0,
            // Left
            0,1, 1,0, 0,0,
            0,1, 1,1, 1,0
        ];
    

    /*    const brightness = [1.0, 0.9, 0.85, 0.8, 0.75, 0.7]; // Face tints

        for (let i = 0; i < 6; ++i) {
            const b = brightness[i];
            gl.uniform4f(u_FragColor, rgba[0]*b, rgba[1]*b, rgba[2]*b, rgba[3]);

            const faceVerts = vertices.slice(i * 18, i * 18 + 18); // 6 floats per vertex × 3 = 18
            const faceUVs   = uvs.slice(i * 12, i * 12 + 12);       // 2 floats per vertex × 3 = 6 × 2

            drawTriangle3DUV(faceVerts, faceUVs);
        }*/
        drawTriangle3DUV(vertices, uvs);
    }
    

    renderfast() {
        //console.log("in renderfast()");
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
        /*  var xy = g_points[i];
        var rgba = g_colors[i];
        var size = g_sizes[i]; */

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        
        // Pass the texture number
        //gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // Pass the size of a point to u_Size variable
        //gl.uniform1f(u_Size, size);
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        var allverts = [];
        // Front
        allverts=allverts.concat([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
        allverts=allverts.concat([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);
        // Top
        allverts=allverts.concat([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
        allverts=allverts.concat([0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0]);
        // Right
        allverts=allverts.concat([1.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 0.0]);
        allverts=allverts.concat([1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
        // Left
        allverts=allverts.concat([0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 0.0]);
        allverts=allverts.concat([0.0, 0.0, 0.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0]);
        // Bottom
        allverts=allverts.concat([0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0]);
        allverts=allverts.concat([0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0]);
        // Back
        allverts=allverts.concat([0.0, 0.0, 1.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0]);
        allverts=allverts.concat([0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0]);
        drawTriangle3D(allverts);

    }
}