class Model {
    constructor(gl, filePath, onReadyCallback = () => {}) {
        this.gl = gl;
        this.filePath = filePath;
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.initialized = false;
        this.vertexCount = 0; // Initialize vertex count
        this.loader = new OBJLoader(this.filePath);
        
        this.loadModel().then(() => {
            onReadyCallback(this);
        }).catch(error => {
            console.error('Error loading model:', error);
        });
    }

    async loadModel() {
        try {
            await this.loader.parseModel();
            if (!this.loader.isFullyLoaded) {
                console.error('Model not fully loaded:', this.filePath);
                return;
            }
            
            this.modelData = this.loader.getModelData();
            this.vertexCount = this.modelData.vertices.length / 3; // Calculate vertex count
            
            console.log('Model loaded:', this.filePath, 
                       'Vertices:', this.modelData.vertices.length,
                       'Normals:', this.modelData.normals.length,
                       'Vertex count:', this.vertexCount);
            
            this.initBuffers();
        } catch (error) {
            console.error('Error in loadModel:', error);
            throw error;
        }
    }

    initBuffers() {
        // Create and initialize vertex buffer
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.modelData.vertices),
            this.gl.STATIC_DRAW
        );
        
        // Create and initialize normal buffer
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(this.modelData.normals),
            this.gl.STATIC_DRAW
        );
        
        // Verify buffer sizes
        const vertexBufferSize = this.modelData.vertices.length * Float32Array.BYTES_PER_ELEMENT;
        const normalBufferSize = this.modelData.normals.length * Float32Array.BYTES_PER_ELEMENT;
        
        console.log('Buffer sizes - Vertex:', vertexBufferSize, 'bytes, Normal:', normalBufferSize, 'bytes');
        
        this.initialized = true;
    }

    render(program) {
        if (!this.initialized || !this.loader.isFullyLoaded) {
            console.warn('Model not ready for rendering:', this.filePath);
            return;
        }

        // Debug output
        console.log('Rendering model with', this.vertexCount, 'vertices');

        // Set up vertex attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(program.a_Position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(program.a_Position);

        // Set up normal attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.vertexAttribPointer(program.a_Normal, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(program.a_Normal);

        // Set uniforms
        this.gl.uniformMatrix4fv(program.u_ModelMatrix, false, this.matrix.elements);
        this.gl.uniform4fv(program.u_FragColor, this.color);

        // Calculate and set normal matrix
        let normalMatrix = new Matrix4().setInverseOf(this.matrix).transpose();
        this.gl.uniformMatrix4fv(program.u_NormalMatrix, false, normalMatrix.elements);

        // Draw the model
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}