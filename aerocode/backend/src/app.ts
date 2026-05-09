import cors = require("cors");
import express = require("express");
import { Request, Response } from "express";
import { swaggerSpec, swaggerUi } from "./config/swagger";
import { aeronaveRoutes } from "./modules/aeronave/aeronave.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { etapaRoutes } from "./modules/etapa/etapa.routes";
import { funcionarioRoutes } from "./modules/funcionario/funcionario.routes";
import { pecaRoutes } from "./modules/peca/peca.routes";
import { relatorioRoutes } from "./modules/relatorio/relatorio.routes";
import { testeRoutes } from "./modules/teste/teste.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica se a API esta online.
 *     tags:
 *       - Health
 *     servers:
 *       - url: http://localhost:3000
 *         description: Servidor local
 *     responses:
 *       200:
 *         description: API online.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
});

app.use("/api/v1/pecas", pecaRoutes);
app.use("/api/v1/etapas", etapaRoutes);
app.use("/api/v1/funcionarios", funcionarioRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/testes", testeRoutes);
app.use("/api/v1/aeronaves", aeronaveRoutes);
app.use("/api/v1/relatorios", relatorioRoutes);
