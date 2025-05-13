class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.1; // Small movement step
    }

    forward() {
        let f = new Vector3();
        f.set(this.at); // Set f to at
        f.sub(this.eye); // Subtract eye from f
        f.normalize(); // Normalize f to get the direction

        // Scale the forward vector by the speed
        f.mul(this.speed);

        // Move the camera forward by adding the forward vector to eye and at
        this.eye.add(f);
        this.at.add(f);
    }

    back() {
        let b = new Vector3();
        b.set(this.eye); // Set b to eye
        b.sub(this.at);  // Subtract at from eye to get the reverse direction
        b.normalize();   // Normalize the vector to get the direction

        // Scale the backward vector by the speed
        b.mul(this.speed);

        // Move the camera backward by subtracting the backward vector from eye and at
        this.eye.add(b);
        this.at.add(b);
    }

    left() {
        // Compute forward vector f = at - eye
        let f = new Vector3();
        f.set(this.at);    // Set f to at
        f.sub(this.eye);   // Subtract eye from f to get forward direction
        f.normalize();     // Normalize the forward vector

        // Compute side vector s = up x f (cross product between up and forward vectors)
        let s = new Vector3();
        s = Vector3.cross(this.up, f); // Corrected: Cross product between up and forward vectors and store in s

        // Normalize the side vector
        s.normalize();

        // Scale the side vector by the speed
        s.mul(this.speed);

        // Move the camera left by adding the side vector from eye and at
        this.eye.add(s);
        this.at.add(s);
    }
    
    right() {
        // Compute forward vector f = at - eye
        let f = new Vector3();
        f.set(this.at);    // Set f to at
        f.sub(this.eye);   // Subtract eye from f to get forward direction
        f.normalize();     // Normalize the forward vector

        // Compute side vector s = up x f (cross product between up and forward vectors)
        let s = new Vector3();
        s = Vector3.cross(this.up, f); // Corrected: Cross product between up and forward vectors and store in s

        // Normalize the side vector
        s.normalize();

        // Scale the side vector by the speed
        s.mul(this.speed);

        // Move the camera right by subtracting the side vector from eye and at
        this.eye.sub(s);
        this.at.sub(s);
    }

    panLeft(alpha) {
        // 1. Compute the forward vector f = at - eye
        let f = new Vector3();
        f.set(this.at).sub(this.eye).normalize();

        // 2. Build a rotation matrix around the up vector
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(
            alpha,
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );

        // 3. Rotate f: f_prime = rotationMatrix * f
        let f_prime = rotationMatrix.multiplyVector3(f);

        // 4. Update at: at = eye + f_prime
        let newAt = new Vector3();
        newAt.set(this.eye).add(f_prime);
        this.at = newAt;
    }
    // Pan right (rotate the camera around the up vector in the opposite direction)
    panRight(alpha) {
        this.panLeft(-alpha);  // Pan right is just pan left with negative alpha
    }
}
