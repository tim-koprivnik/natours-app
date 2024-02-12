import { login } from './login';
import { displayMap } from './leaflet';

const loginForm = document.querySelector('.form');
const map = document.getElementById('map');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}
