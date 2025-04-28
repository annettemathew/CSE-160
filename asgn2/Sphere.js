class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.latBands = 12;   // Number of latitude divisions
        this.longBands = 12;  // Number of longitude divisions
        this.radius = 0.5;
    }

    render() {
        const rgba = this.color;
        //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const r = this.radius;
        const latBands = this.latBands;
        const longBands = this.longBands;
        let x = 1;

        for (let lat = 0; lat < latBands; ++lat) {
            const theta1 = (lat * Math.PI) / latBands;
            const theta2 = ((lat + 1) * Math.PI) / latBands;
            //gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]*x);

            for (let lon = 0; lon < longBands; ++lon) {
                //let alpha = rgba[3] * 0.5 * (Math.sin(lon / longBands * Math.PI) + 1);
                //gl.uniform4f(u_FragColor, rgba[0]*alpha, rgba[1]*alpha, rgba[2]*alpha, rgba[3]);
                let alpha = (Math.sin(lon / longBands * Math.PI) + Math.cos(lat / latBands * Math.PI)) / 2;
                alpha = (alpha + 1) / 2; // normalize to [0, 1]
                
                gl.uniform4f(
                    u_FragColor,
                    rgba[0] * alpha,
                    rgba[1] * alpha,
                    rgba[2] * alpha,
                    rgba[3]
                );
                
                const phi1 = (lon * 2 * Math.PI) / longBands;
                const phi2 = ((lon + 1) * 2 * Math.PI) / longBands;

                const p1 = this.getSpherePoint(r, theta1, phi1);
                const p2 = this.getSpherePoint(r, theta2, phi1);
                const p3 = this.getSpherePoint(r, theta2, phi2);
                const p4 = this.getSpherePoint(r, theta1, phi2);

                // Two triangles per quad on sphere
                drawTriangle3D([...p1, ...p2, ...p3]);
                drawTriangle3D([...p1, ...p3, ...p4]);
                
            }
            x-=0.1;
        }
    }

    getSpherePoint(r, theta, phi) {
        return [
            r * Math.sin(theta) * Math.cos(phi),
            r * Math.cos(theta),
            r * Math.sin(theta) * Math.sin(phi)
        ];
    }
}
