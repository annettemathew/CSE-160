// asg0.js
function main() {
// Retrieve <canvas> element                                  <- (1)
    var canvas = document.getElementById('cnv1');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG                          <- (2)
    var ctx = canvas.getContext('2d');

    // Draw a black rectangle                                       <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill a rectangle with the color
    //let v1 = new Vector3([2.25, 2.25, 0]);
    //drawVector(v1, "red");
}

function handleDrawEvent() {
    var canvas = document.getElementById('cnv1');
    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let x1 = document.getElementById("v1_x").value;
    let y1 = document.getElementById("v1_y").value;
    //console.log("x1: ", x1, "y1: ", y1);
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");
    let x2 = document.getElementById("v2_x").value;
    let y2 = document.getElementById("v2_y").value;
    //console.log("x2: ", x2, "y2: ", y2);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
    //ctx.strokeStyle = "red";
    //let cx = canvas.width/2;
    //let cy = canvas.height/2;
    
    //ctx.beginPath();
    //ctx.moveTo(cx, cy);
    //ctx.lineTo(cx + 75, cy + 50);
    //ctx.stroke();
}

function angleBetween(v1, v2) {
    let dot = Vector3.dot(v1, v2);
    //console.log("dot ", dot)
    //console.log("dot divided by magnitudes ", dot/(v1.magnitude() * v2.magnitude()))
    let angle = Math.acos(dot / (v1.magnitude() * v2.magnitude()));
    let degrees = angle * (180 / Math.PI);
    return degrees;
}

function areaTriangle(v1, v2) {
    let cross = Vector3.cross(v1, v2);
    let areaTriangle = cross.magnitude() / 2;
    return areaTriangle;
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('cnv1');
    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let x1 = document.getElementById("v1_x").value;
    let y1 = document.getElementById("v1_y").value;
    //console.log("x1: ", x1, "y1: ", y1);
    let v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, "red");
    let x2 = document.getElementById("v2_x").value;
    let y2 = document.getElementById("v2_y").value;
    //console.log("x2: ", x2, "y2: ", y2);
    let v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, "blue");
    let scalar = document.getElementById("scalar").value;
    let selector_val = document.getElementById("op-select").value;
    //let result;
    //let result2;
    let v3;
    let v4;
    let angle;
    switch(selector_val) {
        case "add":
            v3 = new Vector3(v1.elements).add(v2);
            drawVector(v3, "green");
            break;
        case "subtract":
            v3 = new Vector3(v1.elements).sub(v2);
            drawVector(v3, "green");
            break;
        case "multiply":
            v3 = new Vector3(v1.elements).mul(scalar);
            v4 = new Vector3(v2.elements).mul(scalar);
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;
        case "divide":
            v3 = new Vector3(v1.elements).div(scalar);
            v4 = new Vector3(v2.elements).div(scalar);
            drawVector(v3, "green");
            drawVector(v4, "green");
            break;
        case "angle_between":
            // let dot = Vector3.dot(v1, v2);
            // //console.log("dot ", dot)
            // //console.log("dot divided by magnitudes ", dot/(v1.magnitude() * v2.magnitude()))
            // let angle = Math.acos(dot / (v1.magnitude() * v2.magnitude()));
            // let degrees = angle * (180 / Math.PI);
            angle = angleBetween(v1, v2);
            console.log("Angle: ", angle);
            break;
        case "area":
            console.log("Area of the triangle: " + areaTriangle(v1, v2));
            break;
        case "magnitude":
        //alert("Magnitude of v1: " + v1.magnitude().toFixed(2));
            console.log("Magnitude v1: ", v1.magnitude())
            console.log("Magnitude v2: ", v2.magnitude())
            break;
        case "normalize":
            v3 = new Vector3(v1.elements).normalize();
            drawVector(v3, "green");
            v4 = new Vector3(v2.elements).normalize();
            drawVector(v4, "green");
            break;
        default:
            console.log("Please select an operation.");
    }
            
}

function drawVector(v, color) {
    var canvas = document.getElementById('cnv1');
    var ctx = canvas.getContext('2d');
    //let v1 = document.getElementById("name").value;
    //console.log(v1);
    ctx.strokeStyle = color;
    let cx = canvas.width/2;
    let cy = canvas.height/2;
    let scale = 20;
    let x1 = v.elements[0] * scale;
    let y1 = v.elements[1] * scale;
    //console.log(v.elements);
    //console.log("x:", x1, "y:", y1);
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + x1, cy - y1);
    ctx.stroke();
}