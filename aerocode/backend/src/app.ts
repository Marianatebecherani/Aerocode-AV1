import express = require("express");
import { Request, Response } from "express";
import { swaggerSpec, swaggerUi } from "./config/swagger";
import { etapaRoutes } from "./modules/etapa/etapa.routes";
import { pecaRoutes } from "./modules/peca/peca.routes";

export const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica se a API esta online.
 *     tags:
 *       - Health
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

app.use("/pecas", pecaRoutes);
app.use("/etapas", etapaRoutes);
