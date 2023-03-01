const ground = document.getElementById('ground');

const particles = [];

const time_step = 0.016;
const radius = 15;
const max_vel = 60;
const min_vel = -60;
const max_vel_magnitud = 84.8;
const WIDTH = 500;
const HEIGHT = 600;
const NUM_ROWS = 10;
const NUM_COLS = 10;
const PX_ROW = Math.ceil(HEIGHT / NUM_ROWS);
const PX_COL = Math.ceil(WIDTH / NUM_COLS);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addToQuadrant(particle, quadrants) {
  const OFFSETS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, -1], [1, 1]];
  const x_coor = Math.floor(particle.x / PX_COL);
  const y_coor = Math.floor(particle.y / PX_ROW);
  
  for (const offset of OFFSETS) {
    // If not in bounce. Skip
    if (x_coor + offset[0] > NUM_COLS - 1 || x_coor + offset[0] < 0) continue;
    if (y_coor + offset[1] > NUM_ROWS - 1 || y_coor + offset[1] < 0) continue;

    const key = (x_coor + offset[0]).toString() + "," + (y_coor + offset[1]).toString();
    if (quadrants.has(key)) quadrants.get(key).add(particle.id);
    else quadrants.set(key, new Set([particle.id]));
  }
}

function checkWallCollision(particle) {
  // If the particle crashes with a wall, it have to bounce.
  if (particle.x <= radius || particle.x >= WIDTH - radius) particle.x_vel = -particle.x_vel;
  if (particle.y <= radius || particle.y >= HEIGHT - radius) particle.y_vel = -particle.y_vel;
}

function checkParticlesCollision(particle1, particle2, calculated_colls) {
  // Calculate distance, if the distance is smaller than 2 times the radius, they are colliding.
  const distance = (particle2.x - particle1.x)**2 + (particle2.y - particle1.y)**2;
  if (distance > 4*radius**2 + 2) return;

  calculated_colls.add(particle1.id + "," + particle2.id);
  // Normal unit vector
  const normal_vect = {
    x: particle2.x - particle1.x,
    y: particle2.y - particle1.y
  };
  const normal_unit_vect = {
    x: normal_vect.x / (Math.sqrt(normal_vect.x**2 + normal_vect.y**2)),
    y: normal_vect.y / (Math.sqrt(normal_vect.x**2 + normal_vect.y**2)),
  };

    // Tangent unit vector
  const tangent_unit_vect = {
    x: -normal_unit_vect.y,
    y: normal_unit_vect.x
  }

  // Velocities in normal direction
  const vel_1_n = normal_unit_vect.x*particle1.x_vel + normal_unit_vect.y*particle1.y_vel;
  const vel_1_t = tangent_unit_vect.x*particle1.x_vel + normal_unit_vect.y*particle1.y_vel;

  const vel_2_n = normal_unit_vect.x*particle2.x_vel + normal_unit_vect.y*particle2.y_vel;
  const vel_2_t = tangent_unit_vect.x*particle2.x_vel + normal_unit_vect.y*particle2.y_vel;

  const final_vel_1_n = vel_2_n;
  const final_vel_2_n = vel_1_n;

  // Vector of final velocities in normal and tangent direction
  const final_vel_1_n_vect = {
    x: final_vel_1_n*normal_unit_vect.x,
    y: final_vel_1_n*normal_unit_vect.y
  };
  const final_vel_1_t_vect = {
    x: vel_1_t*tangent_unit_vect.x,
    y: vel_1_t*tangent_unit_vect.y
  };

  const final_vel_2_n_vect = {
    x: final_vel_2_n*normal_unit_vect.x,
    y: final_vel_2_n*normal_unit_vect.y
  };
  const final_vel_2_t_vect = {
    x: vel_2_t*tangent_unit_vect.x,
    y: vel_2_t*tangent_unit_vect.y
  };
      
  // Final velocities assignment
  particle1.x_vel = final_vel_1_n_vect.x + final_vel_1_t_vect.x;
  particle1.y_vel = final_vel_1_n_vect.y + final_vel_1_t_vect.y;
  particle2.x_vel = final_vel_2_n_vect.x + final_vel_2_t_vect.x;
  particle2.y_vel = final_vel_2_n_vect.y + final_vel_2_t_vect.y
}

function update() {
  const quadrants = new Map();
  const calculated_colls = new Set();

  // Spatial partitioning classification
  particles.forEach(particle => {
    addToQuadrant(particle, quadrants);
    checkWallCollision(particle);
  });

  // Detect and Handle collision by quadrants
  quadrants.forEach(item => {
    const arr = Array.from(item);
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const particle1 = particles[arr[i] - 1];
        const particle2 = particles[arr[j] - 1];

        // If possible collision and already calculated
        if (calculated_colls.has(particle1.id + "," + particle2.id)) continue;

        checkParticlesCollision(particle1, particle2, calculated_colls);
      }
    }
  });

  particles.forEach(particle => {
    // New Position
    particle.x = particle.x + particle.x_vel*time_step;
    particle.y = particle.y + particle.y_vel*time_step;

    // Update position
    const particle_ele = document.getElementById(`particle-${particle.id}`);
    particle_ele.style.left = `${particle.x}px`;
    particle_ele.style.bottom = `${particle.y}px`;
  });
}

function printParticles() {
  particles.forEach(particle => {
    const particle_ele = document.createElement('i');
    particle_ele.classList.add('particle');
    particle_ele.id = `particle-${particle.id}`;

    particle_ele.style.left = `${particle.x}px`;
    particle_ele.style.bottom = `${particle.y}px`;

    ground.appendChild(particle_ele);
  });
}

function generateParticles(n) {
  while (particles.length != n) {
    // Coords
    const x = (Math.random() * (WIDTH - 2*radius)) + radius;
    const y = (Math.random() * (HEIGHT - 2*radius)) + radius;

    // Get the particles that would be overlapping
    const overlapping_particles = particles.filter(particle => Math.abs(particle.x - x) <= 2*radius && Math.abs(particle.y - y) <= 2*radius);

    // If there is overlapping particles, try again
    if (overlapping_particles.length > 0) continue;

    particles.push({
      id: particles.length + 1,
      x,
      y,
      // Min velocity of 20, and max of 100
      x_vel: (Math.random() * (max_vel - min_vel)) + min_vel,
      y_vel: (Math.random() * (max_vel - min_vel)) + min_vel,
      x_acc: 0,
      y_acc: 0
    });
  }
}

function addParticle(x, y, x_vel, y_vel) {
  const particle = {
    id: particles.length + 1,
    x,
    y,
    x_vel,
    y_vel,
    x_acc: 0,
    y_acc: 0
  };

  // Print particle
  const particle_ele = document.createElement('i');
  particle_ele.classList.add('particle');
  particle_ele.id = `particle-${particle.id}`;
  
  particle_ele.style.left = `${particle.x}px`;
  particle_ele.style.bottom = `${particle.y}px`;
  
  ground.appendChild(particle_ele);  

  // Add to the other particles to simulate it
  particles.push(particle);
}

let play = false;

window.addEventListener('keydown', e => {
  if (e.key == ' ') {
    if (play) play = !play;
    else run();
  }
});

async function run() {
  play = true;
  
  while (play) {
    update();
    await sleep(time_step*1000);
  }
}

function main() {
  generateParticles(10);
  printParticles();
}

main();
