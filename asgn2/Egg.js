class Egg {
    constructor() {
        this.type = 'egg';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.latBands = 24;   // More divisions for smoother egg
        this.longBands = 24;
        this.radius = 0.5;
    }

    render() {
        const rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const r = this.radius;
        const latBands = this.latBands;
        const longBands = this.longBands;

        for (let lat = 0; lat < latBands; ++lat) {
            const theta1 = (lat * Math.PI) / latBands;
            const theta2 = ((lat + 1) * Math.PI) / latBands;

            for (let lon = 0; lon < longBands; ++lon) {
                let alpha = (Math.sin(lon / longBands * Math.PI) + Math.cos(lat / latBands * Math.PI)) / 2;
                alpha = (alpha + 1) / 2;

                gl.uniform4f(
                    u_FragColor,
                    rgba[0] * alpha,
                    rgba[1] * alpha,
                    rgba[2] * alpha,
                    rgba[3]
                );

                const phi1 = (lon * 2 * Math.PI) / longBands;
                const phi2 = ((lon + 1) * 2 * Math.PI) / longBands;

                const p1 = this.getEggPoint(r, theta1, phi1);
                const p2 = this.getEggPoint(r, theta2, phi1);
                const p3 = this.getEggPoint(r, theta2, phi2);
                const p4 = this.getEggPoint(r, theta1, phi2);

                drawTriangle3D([...p1, ...p2, ...p3]);
                drawTriangle3D([...p1, ...p3, ...p4]);
            }
        }
    }

    getEggPoint(r, theta, phi) {
        // Shape the egg: squish the top, fatten the bottom
        let eggShapeFactor = 1.0 - 0.3 * Math.cos(theta); // Tune this 0.3 for more/less egginess
        return [
            r * eggShapeFactor * Math.sin(theta) * Math.cos(phi),
            r * Math.cos(theta) * 1.2, // stretch vertically a little
            r * eggShapeFactor * Math.sin(theta) * Math.sin(phi)
        ];
    }
}
