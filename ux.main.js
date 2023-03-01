const scope = document.getElementById('scope');

// ADD PARTICLES BY DRAGGING
let mouse_initial_x, mouse_initial_y, mouse_final_x, mouse_final_y, flag = false, distance;
ground.addEventListener('mousedown', e => {
  flag = true;
  distance = 0;
  mouse_initial_x = e.layerX;
  mouse_initial_y = e.layerY;
});

ground.addEventListener('mousemove', e => {
  if (!flag) return;

  mouse_final_x = e.layerX;
  mouse_final_y = e.layerY;
  distance = Math.sqrt((mouse_final_x - mouse_initial_x)**2 + (mouse_final_y - mouse_initial_y)**2);

  // We have yo obtain the angle to get the components of velocity
  let opposite = mouse_final_y - mouse_initial_y;
  let adjacent = mouse_final_x - mouse_initial_x;
  let angle = Math.atan(opposite / adjacent);

  let angle_to_rotate;
  if (mouse_final_x > mouse_initial_x) angle_to_rotate = angle + Math.PI * 3 / 2;
  else angle_to_rotate = angle + Math.PI * 1 / 2;

  // Display scope
  distance = distance > 200 ? 200 : distance;
  scope.style.display = 'block';
  scope.style.height = `${distance - 30}px`;
  scope.style.rotate = `${angle_to_rotate}rad`;
  scope.style.top = `${mouse_initial_y}px`;
  scope.style.left = `${mouse_initial_x}px`;
});

ground.addEventListener('mouseup', e => {
  // Undisplay scope
  scope.style.display = 'none';

  if (mouse_initial_x < 15 || mouse_initial_x > 485 || mouse_initial_y < 15 || mouse_initial_y > 585) return;
  distance = distance > 200 ? 200 : distance;
  let percentange = parseInt(distance / 2);

  // The particle position will be where we start to drag
  let x = mouse_initial_x, y = 600 - mouse_initial_y;

  // We have yo obtain the angle to get the components of velocity
  let opposite = mouse_final_y - mouse_initial_y;
  let adjacent = mouse_final_x - mouse_initial_x;
  let angle = Math.atan(opposite / adjacent);

  let vel_magnitud = percentange * max_vel_magnitud / 100;
  let x_vel = vel_magnitud * Math.cos(angle);
  let y_vel = vel_magnitud * Math.sin(angle);

  if (mouse_initial_x > mouse_final_x) x_vel = Math.abs(x_vel);
  else x_vel = -Math.abs(x_vel);

  if (mouse_initial_y > mouse_final_y) y_vel = -Math.abs(y_vel);
  else y_vel = Math.abs(y_vel);

  addParticle(x, y, x_vel, y_vel);
  flag = false;
});
