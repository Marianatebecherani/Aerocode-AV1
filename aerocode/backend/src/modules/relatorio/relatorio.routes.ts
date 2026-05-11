import { Router } from "express";
import { AeronaveRepository } from "../aeronave/aeronave.repository";
import { AeronaveService } from "../aeronave/aeronave.service";
import { EtapaRepository } from "../etapa/etapa.repository";
import { FuncionarioRepository } from "../funcionario/funcionario.repository";
import { PecaRepository } from "../peca/peca.repository";
import { TesteRepository } from "../teste/teste.repository";
import { RelatorioController } from "./relatorio.controller";
import { RelatorioRepository } from "./relatorio.repository";
import { RelatorioService } from "./relatorio.service";

const aeronaveRepository = new AeronaveRepository();
const pecaRepository = new PecaRepository();
const etapaRepository = new EtapaRepository();
const testeRepository = new TesteRepository();
const funcionarioRepository = new FuncionarioRepository();
const aeronaveService = new AeronaveService(
    aeronaveRepository,
    pecaRepository,
    etapaRepository,
    testeRepository,
    funcionarioRepository
);
const relatorioRepository = new RelatorioRepository();
const relatorioService = new RelatorioService(relatorioRepository, aeronaveService);
const relatorioController = new RelatorioController(relatorioService);

export const relatorioRoutes = Router();

/**
 * @swagger
 * /relatorios:
 *   post:
 *     summary: Cria um novo relatorio a partir dos detalhes de uma aeronave.
 *     tags:
 *       - Relatorios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarRelatorio'
 *     responses:
 *       201:
 *         description: Relatorio criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relatorio'
 *       400:
 *         description: Dados invalidos ou aeronave inexistente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
relatorioRoutes.post("/", async (req, res) => {
    try {
        const relatorio = await relatorioController.criar(req.body);
        res.status(201).json(relatorio);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar relatorio.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /relatorios:
 *   get:
 *     summary: Lista todos os relatorios cadastrados.
 *     tags:
 *       - Relatorios
 *     parameters:
 *       - in: query
 *         name: aeronaveCodigo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra relatorios pelo codigo da aeronave.
 *         example: AER-0001
 *       - in: query
 *         name: dataInicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do intervalo de emissao do relatorio.
 *         example: "2026-05-01"
 *       - in: query
 *         name: dataFim
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do intervalo de emissao do relatorio.
 *         example: "2026-05-31"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Pagina desejada.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Quantidade de itens por pagina.
 *     responses:
 *       200:
 *         description: Lista paginada de relatorios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Relatorio'
 *                 paginacao:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Filtros ou parametros de paginacao invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
relatorioRoutes.get("/", async (req, res) => {
    try {
        const relatorios = await relatorioController.listar({
            ...(typeof req.query.aeronaveCodigo === "string" ? { aeronaveCodigo: req.query.aeronaveCodigo } : {}),
            ...(typeof req.query.dataInicio === "string" ? { dataInicio: req.query.dataInicio } : {}),
            ...(typeof req.query.dataFim === "string" ? { dataFim: req.query.dataFim } : {}),
            ...(typeof req.query.page === "string" ? { page: req.query.page } : {}),
            ...(typeof req.query.limit === "string" ? { limit: req.query.limit } : {})
        });
        res.json(relatorios);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao listar relatorios.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /relatorios/{id}:
 *   get:
 *     summary: Busca um relatorio especifico pelo id.
 *     tags:
 *       - Relatorios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do relatorio que sera consultado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Relatorio encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relatorio'
 *       404:
 *         description: Relatorio nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
relatorioRoutes.get("/:id", async (req, res) => {
    const relatorio = await relatorioController.buscarPorId(req.params.id);

    if (!relatorio) {
        res.status(404).json({ message: "Relatorio nao encontrado." });
        return;
    }

    res.json(relatorio);
});

/**
 * @swagger
 * /relatorios/{id}:
 *   delete:
 *     summary: Remove um relatorio existente pelo id.
 *     tags:
 *       - Relatorios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do relatorio que sera removido.
 *         example: "1"
 *     responses:
 *       204:
 *         description: Relatorio removido com sucesso.
 *       404:
 *         description: Relatorio nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
relatorioRoutes.delete("/:id", async (req, res) => {
    const relatorioDeletado = await relatorioController.deletar(req.params.id);

    if (!relatorioDeletado) {
        res.status(404).json({ message: "Relatorio nao encontrado." });
        return;
    }

    res.status(204).send();
});
