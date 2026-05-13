import { Router } from "express";
import { AeronaveRepository } from "../aeronave/aeronave.repository";
import { EtapaRepository } from "../etapa/etapa.repository";
import { PecaRepository } from "../peca/peca.repository";
import { RelatorioRepository } from "../relatorio/relatorio.repository";
import { TesteRepository } from "../teste/teste.repository";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

const dashboardService = new DashboardService(
    new AeronaveRepository(),
    new EtapaRepository(),
    new PecaRepository(),
    new TesteRepository(),
    new RelatorioRepository()
);
const dashboardController = new DashboardController(dashboardService);

export const dashboardRoutes = Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retorna o resumo consolidado para o dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Resumo consolidado do estado de producao.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResumo'
 */
dashboardRoutes.get("/", async (_req, res) => {
    const resumo = await dashboardController.resumo();
    res.json(resumo);
});

/**
 * @swagger
 * /dashboard/aeronaves:
 *   get:
 *     summary: Retorna os indicadores de aeronaves para o dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Indicadores de aeronaves.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardAeronaves'
 */
dashboardRoutes.get("/aeronaves", async (_req, res) => {
    const aeronaves = await dashboardController.aeronaves();
    res.json(aeronaves);
});

/**
 * @swagger
 * /dashboard/etapas:
 *   get:
 *     summary: Retorna os indicadores de etapas para o dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Indicadores de etapas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardEtapas'
 */
dashboardRoutes.get("/etapas", async (_req, res) => {
    const etapas = await dashboardController.etapas();
    res.json(etapas);
});

/**
 * @swagger
 * /dashboard/pecas:
 *   get:
 *     summary: Retorna os indicadores de pecas para o dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Indicadores de pecas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardPecas'
 */
dashboardRoutes.get("/pecas", async (_req, res) => {
    const pecas = await dashboardController.pecas();
    res.json(pecas);
});

/**
 * @swagger
 * /dashboard/testes:
 *   get:
 *     summary: Retorna os indicadores de testes para o dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Indicadores de testes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardTestes'
 */
dashboardRoutes.get("/testes", async (_req, res) => {
    const testes = await dashboardController.testes();
    res.json(testes);
});

/**
 * @swagger
 * /dashboard/relatorios:
 *   get:
 *     summary: Retorna os indicadores de relatorios para o dashboard.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Indicadores de relatorios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardRelatorios'
 */
dashboardRoutes.get("/relatorios", async (_req, res) => {
    const relatorios = await dashboardController.relatorios();
    res.json(relatorios);
});
