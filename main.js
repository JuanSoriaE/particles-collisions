const ground = document.getElementById('ground');

let particles = [];

const time_step = 0.016;
const radius = 15;
const max_vel = 60;
const min_vel = -60;
const max_vel_magnitud = 84.8;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkWallCollision(particle) {
  // If the particle crashes with a wall, it have to bounce.
  if (particle.x <= radius || particle.x >= 500 - radius) particle.x_vel = -particle.x_vel;
  if (particle.y <= radius || particle.y >= 600 - radius) particle.y_vel = -particle.y_vel;
}

function checkParticleCollision(particle) {
  for (let i = particle.id; i < particles.length; i++) {
    // Calculate distance, if the distance is smaller than 2 times the radius, they are colliding.
    let distance = Math.sqrt(((particles[i].x - particle.x)**2) + (particles[i].y - particle.y)**2);
    if (distance <= 2*radius) {
      // Object 1: particle
      // Object 2: particles[i]

      // Normal unit vector
      let normal_vect = {
        x: particles[i].x - particle.x,
        y: particles[i].y - particle.y
      };
      let normal_unit_vect = {
        x: normal_vect.x / (Math.sqrt(normal_vect.x**2 + normal_vect.y**2)),
        y: normal_vect.y / (Math.sqrt(normal_vect.x**2 + normal_vect.y**2)),
      };

      // Tangent unit vector
      let tangent_unit_vect = {
        x: -normal_unit_vect.y,
        y: normal_unit_vect.x
      }

      // Velocities in normal direction
      let vel_1_n = normal_unit_vect.x*particle.x_vel + normal_unit_vect.y*particle.y_vel;
      let vel_1_t = tangent_unit_vect.x*particle.x_vel + normal_unit_vect.y*particle.y_vel;

      let vel_2_n = normal_unit_vect.x*particles[i].x_vel + normal_unit_vect.y*particles[i].y_vel;
      let vel_2_t = tangent_unit_vect.x*particles[i].x_vel + normal_unit_vect.y*particles[i].y_vel;

      let final_vel_1_n = vel_2_n;
      let final_vel_2_n = vel_1_n;

      // Vector of final velocities in normal and tangent direction
      let final_vel_1_n_vect = {
        x: final_vel_1_n*normal_unit_vect.x,
        y: final_vel_1_n*normal_unit_vect.y
      };
      let final_vel_1_t_vect = {
        x: vel_1_t*tangent_unit_vect.x,
        y: vel_1_t*tangent_unit_vect.y
      };

      let final_vel_2_n_vect = {
        x: final_vel_2_n*normal_unit_vect.x,
        y: final_vel_2_n*normal_unit_vect.y
      };
      let final_vel_2_t_vect = {
        x: vel_2_t*tangent_unit_vect.x,
        y: vel_2_t*tangent_unit_vect.y
      };
      
      // Final velocities assignment
      particle.x_vel = final_vel_1_n_vect.x + final_vel_1_t_vect.x;
      particle.y_vel = final_vel_1_n_vect.y + final_vel_1_t_vect.y;
      particles[i].x_vel = final_vel_2_n_vect.x + final_vel_2_t_vect.x;
      particles[i].y_vel = final_vel_2_n_vect.y + final_vel_2_t_vect.y;
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
    // particle.x_vel = particle.x_vel + x_acc*time_step;
    // particle.y_vel = particle.y_vel + y_acc*time_step;

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

function generateParticles(n) {
  while (particles.length != n) {
    // Coords
    let x = (Math.random() * 470) + 15;
    let y = (Math.random() * 570) + 15;

    // Get the particles that would be overlapping
    let overlapping_particles = particles.filter(particle => Math.abs(particle.x - x) <= 2*radius && Math.abs(particle.y - y) <= 2*radius);

    // If there is overlapping particles, try again
    if (overlapping_particles.length > 0) continue;

    // {id: 2, x: 400, y: 240, x_vel: -30, y_vel: 0, x_acc: 0, y_acc: 0},
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
  
  let i = 0;
  while (play) {
    update();
    await sleep(time_step*1000);
    i++;
  }
}

function main() {
  generateParticles(10);
  printParticles();
}

main();
