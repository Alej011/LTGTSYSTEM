import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    // Configuración de timeouts para mejor visualización
    defaultCommandTimeout: 8000,      // Tiempo de espera para comandos (default: 4000ms)
    pageLoadTimeout: 60000,            // Tiempo de espera para cargar páginas (default: 60000ms)
    requestTimeout: 10000,             // Tiempo de espera para requests HTTP (default: 5000ms)
    responseTimeout: 30000,            // Tiempo de espera para respuestas (default: 30000ms)
    execTimeout: 60000,                // Tiempo de espera para cy.exec() (default: 60000ms)
    taskTimeout: 60000,
  },
  env: {
    apiUrl: "http://localhost:4000",
  },
});
