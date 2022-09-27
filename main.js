const ground = document.getElementById('ground');

let particles = [
  // Y test case
  {id: 1, x: 100, y: 100, x_vel: 0, y_vel: 30, x_acc: 0, y_acc: 0},
  {id: 2, x: 100, y: 400, x_vel: 0, y_vel: -30, x_acc: 0, y_acc: 0},

  // X test case
  {id: 3, x: 70, y: 100, x_vel: 30, y_vel: 0, x_acc: 0, y_acc: 0},
  {id: 4, x: 400, y: 100, x_vel: -30, y_vel: 0, x_acc: 0, y_acc: 0},

  // 2d test case
  {id: 5, x: 20, y: 200, x_vel: 30, y_vel: 30, x_acc: 0, y_acc: 0},
  {id: 6, x: 200, y: 200, x_vel: -30, y_vel: -30, x_acc: 0, y_acc: 0},

  // Special test case
  {id: 7, x: 200, y: 400, x_vel: 100, y_vel: -100, x_acc: 0, y_acc: 0},
  {id: 8, x: 400, y: 400, x_vel: -100, y_vel: -100, x_acc: 0, y_acc: 0},
];

const g = -9.8;
const time_step = 0.02;
const radius = 15;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkWallCollision(particle) {
  // If the particle crashes with a wall, it have to bounce.
  if (particle.x <= radius || particle.x >= 500 - radius) particle.x_vel = -particle.x_vel;
  if (particle.y <= radius || particle.y >= 500 - radius) particle.y_vel = -particle.y_vel;
}

function checkParticleCollision(particle) {
  for (let i = 0; i < particles.length; i++) {
    if (particles[i].id == particle.id) continue;

    // Calculate distance, if the distance is smaller than 2 times the radius, they are colliding.
    let distance = Math.sqrt(((particles[i].x - particle.x)**2) + (particles[i].y - particle.y)**2);
    if (distance <= 2*radius) {
      // Swap x velocities
      let x_vel_aux = particles[i].x_vel;
      particles[i].x_vel = particle.x_vel;
      particle.x_vel = x_vel_aux;

      // Swap y velocities
      let y_vel_aux = particles[i].y_vel;
      particles[i].y_vel = particle.y_vel;
      particle.y_vel = y_vel_aux;
    }
  }
}

function update() {
  particles.forEach(particle => {
    checkWallCollision(particle);
    checkParticleCollision(particle);
    
    // New position
    particle.x = particle.x + particle.x_vel*time_step;
    particle.y = particle.y + particle.y_vel*time_step;

    // New velocities
    // particle.x_vel = particle.x_vel + 0*time_step;
    // particle.y_vel = particle.y_vel + g*time_step;

    // Update position
    let particle_ele = document.getElementById(`particle-${particle.id}`);
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

let play = false;

window.addEventListener('keydown', e => {
  if (e.key == ' ') {
    if (play) play = !play;
    else run();
  }
});

async function run() {
  play = true;
  
  let i = 0;
  while (play) {
    update();
    await sleep(time_step*1000);
    i++;
  }
}

function main() {
  printParticles();
}

main();
