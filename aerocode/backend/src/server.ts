import { app } from "./app";

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    console.log(`Backend AeroCode rodando em http://localhost:${port}`);
    console.log(`Health check em http://localhost:${port}/health`);
    console.log(`Documentacao Swagger em http://localhost:${port}/api-docs`);
    console.log(`Base da API v1 em http://localhost:${port}/api/v1`);
});
