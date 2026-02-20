
let n_roads = 0;

function fibDance(start, ang0, leng0, depth, max_depth, points, rh) {
    if (depth >= max_depth) return;

    let i = 0;
    let current_leng = leng0;
    let first = {x: start.x, y: start.y, h: rh};

    let run_mode = true;

    while (run_mode) {
        const segLength = current_leng * Math.pow(phi, i);
        const rad = ang0 * Math.PI / 180;
        const x = first.x + segLength * Math.cos(rad);
        const y = first.y - segLength * Math.sin(rad);
        ang0 = ang0 + i * phi; // spiral rotation

        const next = {x: x, y: y}; //next

        if (segLength > 0) {
            n_roads++;
            points.push({x: next.x, y: next.y, h: rh});
        }

        // Move to next point
        //all points in this interval need to be pushed
        steps = 20
        delta = segLength/steps
        fp = first
        d_x = next.x - first.x
        d_y = next.y - first.y
        alpha = Math.atan2(d_y, d_x)
        for (j = 0; j < steps; j++){
            fp.x += delta*Math.cos(alpha)
            fp.y += delta*Math.sin(alpha)
            points.push({x: fp.x, y: fp.y, h: rh});
            rh += .001

        }
        first = next;

        // Branch-off conditions
        if (
            segLength > 100*current_leng
        ) {
            if (depth < max_depth) {
                //console.log('recursion', first)
                fibDance(first, ang0 + 275, leng0, depth + 1, max_depth, points, rh);
                run_mode = true;
            }
        }

        i++;
        if (x < -100 || x > 100 || y < -100 || y > 100) {
            run_mode = false; // bounds for terrain
        }
    }
}







// 1. Generate tributary points (simple fractal tree)
function generateTributaries(x, y, length, angle, depth, points) {
    if (depth === 0) return;
    const x2 = x + length * Math.cos(angle);
    const y2 = y + length * Math.sin(angle);
    points.push({x: x2, y: y2});
    generateTributaries(x2, y2, length * 0.6, angle - 0.5, depth - 1, points);
    generateTributaries(x2, y2, length * 0.6, angle + 0.5, depth - 1, points);
}

// Collect points for rivers

// Generate tributary network
let rivers = [{x: 0, y: 0, h:0}];
//function fibDance(start, ang0, leng0, depth, max_depth, points) {

//fibDance({x: 0, y: 0}, 90, 0.2, 0, 2, rivers);
fibDance({x: 50, y: -100}, 180, 0.3, 0, 2, rivers, 0);

// Create terrain geometry
const terrainGeometry = new THREE.PlaneBufferGeometry(200, 200, 100, 100);
terrainGeometry.rotateX(-Math.PI / 2);

const pos = terrainGeometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const pz = pos.getZ(i);

    // Find nearest river point
    let minDist = Infinity;
    let minH = 0
    for (let r of rivers) {
        const dx = px - r.x;
        const dz = pz - r.y;
        const dist = Math.sqrt(dx*dx + dz*dz);
        if (dist < minDist){
            minDist = dist;
            minH = r.h
        }
    }

    // Lower terrain near rivers
   // const height = Math.max(0, 10 - (15 / (minDist + 1)));
   const height = Math.max(0, minH+5*Math.log(minDist+0.5))
    pos.setY(i, height);
}
pos.needsUpdate = true;
terrainGeometry.computeVertexNormals();

const terrainMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
scene.add(terrain);
