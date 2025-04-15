function drawHelloKitty() {
    g_shapesList = [];
  
    function addTriangle(verts, color) {
      const t = new Triangle();
      t.verts = verts;
      t.color = color;
      g_shapesList.push(t);
    }
  
    // Colors
    const white = [1, 1, 1, 1];
    const gray = [0.2, 0.2, 0.2, 1];
    const yellow = [1, 0.9, 0.7, 1];
    const pink = [1, 0.75, 0.8, 1];
    const tan = [1, 0.9, 0.8, 1];
    const black = [0, 0, 0, 1];
  
    // --- Face Base (big hexagonal-ish face) ---
    addTriangle([-0.75, 0.5, 0.75, 0.5, -0.75, -0.5], white);
    addTriangle([0.75, 0.5, 0.75, -0.5, -0.75, -0.5], white);
    addTriangle([-0.75, 0.5, -0.8, 0, -0.75, -0.5], white);
    addTriangle([0.75, 0.5, 0.8, 0, 0.75, -0.5], white);
    addTriangle([-0.75, -0.5, 0, -0.6, 0.75, -0.5], white);

    //addTriangle([-0.6, 0.1, 0.6, 0.1, -0.6, -0.6], white);
    //addTriangle([-0.6, -0.6, 0.6, 0.1, 0.6, -0.6], white);
    //addTriangle([-0.6, 0.1, -0.7, -0.25, -0.6, -0.6], white);
    //addTriangle([0.6, 0.1, 0.7, -0.25, 0.6, -0.6], white);
  
    // --- Ears ---
    addTriangle([-0.77, 0.35, -0.71, 0.8, -0.35, 0.5], white);   // Left ear
    addTriangle([0.77, 0.35, 0.71, 0.8, 0.35, 0.5], white);     // Right ear
  
    // --- Eyes ---
    // 0.25 top 
    // 0.15
    addTriangle([-0.31, 0., -0.25, 0., -0.31, -0.15], gray); // Left eye left triangle
    addTriangle([-0.25, -0.15, -0.25, 0, -0.31, -0.15], gray); // Left eye right triangle
    addTriangle([0.31, 0., 0.25, 0., 0.31, -0.15], gray); // Right eye left triangle
    addTriangle([0.25, -0.15, 0.25, 0, 0.31, -0.15], gray); // Right eye right triangle
  
    // --- Nose ---
    addTriangle([-0.05, -0.15, 0.05, -0.15, -0.05, -0.2], yellow);
    addTriangle([-0.05, -0.2, 0.05, -0.2, 0.05, -0.15], yellow);
    addTriangle([-0.05, -0.15, -0.07, -0.17, -0.05, -0.2], yellow);
    addTriangle([0.05, -0.15, 0.07, -0.17, 0.05, -0.2], yellow);
  
    // --- Whiskers Left ---
    addTriangle([-0.8, -0.1, -0.4, -0.15, -0.5, -0.1], gray);
    addTriangle([-0.8, -0.21, -0.4, -0.21, -0.5, -0.17], gray);
    addTriangle([-0.8, -0.32, -0.4, -0.27, -0.5, -0.24], gray);
  
    // --- Whiskers Right ---
    addTriangle([0.8, -0.1, 0.4, -0.15, 0.5, -0.1], gray);
    addTriangle([0.8, -0.21, 0.4, -0.21, 0.5, -0.17], gray);
    addTriangle([0.8, -0.32, 0.4, -0.27, 0.5, -0.24], gray);
  
    // --- Flower/Bow (top-right) ---
    const centerX = 0.55;
    const centerY = 0.4;
    const rOuter = 0.2;
    const rInner = 0.05;
    const petalCount = 6;
  
    for (let i = 0; i < petalCount; i++) {
      const angle1 = (i * 2 * Math.PI) / petalCount;
      const angle2 = ((i + 1) * 2 * Math.PI) / petalCount;
      addTriangle(
        [
          centerX, centerY,
          centerX + rOuter * Math.cos(angle1), centerY + rOuter * Math.sin(angle1),
          centerX + rOuter * Math.cos(angle2), centerY + rOuter * Math.sin(angle2)
        ],
        pink
      );
    }
  
    // Flower center (two triangles to make square)
    addTriangle(
      [centerX - rInner, centerY - rInner, centerX + rInner, centerY - rInner, centerX + rInner, centerY + rInner],
      tan
    );
    addTriangle(
      [centerX - rInner, centerY - rInner, centerX - rInner, centerY + rInner, centerX + rInner, centerY + rInner],
      tan
    );
  
    renderAllShapes();
  }
  