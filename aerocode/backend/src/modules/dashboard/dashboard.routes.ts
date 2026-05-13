import { Router } from "express";
import { AeronaveRepository } from "../aeronave/aeronave.repository";
import { EtapaRepository } from "../etapa/etapa.repository";
import { PecaRepository } from "../peca/peca.repository";
import { RelatorioRepository } from "../relatorio/relatorio.repository";
import { TesteRepository } from "../teste/teste.repository";
import { DashboardController } from "./dashboard.controller";
import { DashboardFiltrosDTO } from "./dashboard.entity";
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

function extrairFiltrosDashboard(query: Record<string, unknown>): DashboardFiltrosDTO {
    return {
        ...(typeof query.codigo === "string" ? { codigo: query.codigo } : {}),
        ...(typeof query.modelo === "string" ? { modelo: query.modelo } : {}),
        ...(typeof query.tipo === "string" ? { tipo: query.tipo } : {}),
        ...(typeof query.capacidadeMin === "string" ? { capacidadeMin: query.capacidadeMin } : {}),
        ...(typeof query.capacidadeMax === "string" ? { capacidadeMax: query.capacidadeMax } : {}),
        ...(typeof query.alcanceMin === "string" ? { alcanceMin: query.alcanceMin } : {}),
        ...(typeof query.alcanceMax === "string" ? { alcanceMax: query.alcanceMax } : {})
    };
}

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retorna o resumo consolidado para o dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - $ref: '#/components/parameters/DashboardFiltroCodigo'
 *       - $ref: '#/components/parameters/DashboardFiltroModelo'
 *       - $ref: '#/components/parameters/DashboardFiltroTipo'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMin'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMax'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMin'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMax'
 *     responses:
 *       200:
 *         description: Resumo consolidado do estado de producao.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResumo'
 */
dashboardRoutes.get("/", async (req, res) => {
    try {
        const resumo = await dashboardController.resumo(extrairFiltrosDashboard(req.query));
        res.json(resumo);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar resumo do dashboard.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /dashboard/aeronaves:
 *   get:
 *     summary: Retorna os indicadores de aeronaves para o dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - $ref: '#/components/parameters/DashboardFiltroCodigo'
 *       - $ref: '#/components/parameters/DashboardFiltroModelo'
 *       - $ref: '#/components/parameters/DashboardFiltroTipo'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMin'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMax'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMin'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMax'
 *     responses:
 *       200:
 *         description: Indicadores de aeronaves.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardAeronaves'
 */
dashboardRoutes.get("/aeronaves", async (req, res) => {
    try {
        const aeronaves = await dashboardController.aeronaves(extrairFiltrosDashboard(req.query));
        res.json(aeronaves);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar indicadores de aeronaves.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /dashboard/etapas:
 *   get:
 *     summary: Retorna os indicadores de etapas para o dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - $ref: '#/components/parameters/DashboardFiltroCodigo'
 *       - $ref: '#/components/parameters/DashboardFiltroModelo'
 *       - $ref: '#/components/parameters/DashboardFiltroTipo'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMin'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMax'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMin'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMax'
 *     responses:
 *       200:
 *         description: Indicadores de etapas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardEtapas'
 */
dashboardRoutes.get("/etapas", async (req, res) => {
    try {
        const etapas = await dashboardController.etapas(extrairFiltrosDashboard(req.query));
        res.json(etapas);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar indicadores de etapas.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /dashboard/pecas:
 *   get:
 *     summary: Retorna os indicadores de pecas para o dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - $ref: '#/components/parameters/DashboardFiltroCodigo'
 *       - $ref: '#/components/parameters/DashboardFiltroModelo'
 *       - $ref: '#/components/parameters/DashboardFiltroTipo'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMin'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMax'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMin'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMax'
 *     responses:
 *       200:
 *         description: Indicadores de pecas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardPecas'
 */
dashboardRoutes.get("/pecas", async (req, res) => {
    try {
        const pecas = await dashboardController.pecas(extrairFiltrosDashboard(req.query));
        res.json(pecas);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar indicadores de pecas.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /dashboard/testes:
 *   get:
 *     summary: Retorna os indicadores de testes para o dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - $ref: '#/components/parameters/DashboardFiltroCodigo'
 *       - $ref: '#/components/parameters/DashboardFiltroModelo'
 *       - $ref: '#/components/parameters/DashboardFiltroTipo'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMin'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMax'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMin'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMax'
 *     responses:
 *       200:
 *         description: Indicadores de testes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardTestes'
 */
dashboardRoutes.get("/testes", async (req, res) => {
    try {
        const testes = await dashboardController.testes(extrairFiltrosDashboard(req.query));
        res.json(testes);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar indicadores de testes.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /dashboard/relatorios:
 *   get:
 *     summary: Retorna os indicadores de relatorios para o dashboard.
 *     tags:
 *       - Dashboard
 *     parameters:
 *       - $ref: '#/components/parameters/DashboardFiltroCodigo'
 *       - $ref: '#/components/parameters/DashboardFiltroModelo'
 *       - $ref: '#/components/parameters/DashboardFiltroTipo'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMin'
 *       - $ref: '#/components/parameters/DashboardFiltroCapacidadeMax'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMin'
 *       - $ref: '#/components/parameters/DashboardFiltroAlcanceMax'
 *     responses:
 *       200:
 *         description: Indicadores de relatorios.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardRelatorios'
 */
dashboardRoutes.get("/relatorios", async (req, res) => {
    try {
        const relatorios = await dashboardController.relatorios(extrairFiltrosDashboard(req.query));
        res.json(relatorios);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar indicadores de relatorios.";
        res.status(400).json({ message });
    }
});
