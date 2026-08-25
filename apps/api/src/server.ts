import { appDataSource } from "./database/data-source.js";
import { app } from "./app.js";
import { env } from "./config/env.js";

appDataSource
  .initialize()
  .then(() =>
    app.listen(env.API_PORT, () =>
      console.log(`API listening on :${env.API_PORT}`),
    ),
  )
  .catch((error) => {
    console.error("Database initialization failed", error);
    process.exit(1);
  });
