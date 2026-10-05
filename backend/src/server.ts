import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Biblioteca API lista en http://localhost:${env.port}`);
});
