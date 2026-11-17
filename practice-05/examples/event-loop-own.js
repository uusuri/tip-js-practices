// Прогноз: A, B, C, D, E, G, F.
import './event-loop.js';
Promise.resolve().then(() => console.log('G: собственная микрозадача'));
