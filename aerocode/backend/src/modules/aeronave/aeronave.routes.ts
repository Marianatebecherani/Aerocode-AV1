import { Router } from "express";
import { EtapaRepository } from "../etapa/etapa.repository";
import { PecaRepository } from "../peca/peca.repository";
import { TesteRepository } from "../teste/teste.repository";
import { AeronaveController } from "./aeronave.controller";
import { AeronaveRepository } from "./aeronave.repository";
import { AeronaveService } from "./aeronave.service";

const aeronaveRepository = new AeronaveRepository();
const pecaRepository = new PecaRepository();
const etapaRepository = new EtapaRepository();
const testeRepository = new TesteRepository();
const aeronaveService = new AeronaveService(
    aeronaveRepository,
    pecaRepository,
    etapaRepository,
    testeRepository
);
const aeronaveController = new AeronaveController(aeronaveService);

export const aeronaveRoutes = Router();

/**
 * @swagger
 * /aeronaves:
 *   post:
 *     summary: Cria uma nova aeronave.
 *     tags:
 *       - Aeronaves
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarAeronave'
 *     responses:
 *       201:
 *         description: Aeronave criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aeronave'
 *       400:
 *         description: Dados invalidos ou aeronave duplicada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
aeronaveRoutes.post("/", async (req, res) => {
    try {
        const aeronave = await aeronaveController.criar(req.body);
        res.status(201).json(aeronave);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar aeronave.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /aeronaves:
 *   get:
 *     summary: Lista todas as aeronaves cadastradas.
 *     tags:
 *       - Aeronaves
 *     responses:
 *       200:
 *         description: Lista de aeronaves.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Aeronave'
 */
aeronaveRoutes.get("/", async (_req, res) => {
    const aeronaves = await aeronaveController.listar();
    res.json(aeronaves);
});

/**
 * @swagger
 * /aeronaves/{id}:
 *   get:
 *     summary: Busca uma aeronave especifica pelo codigo.
 *     tags:
 *       - Aeronaves
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo da aeronave que sera consultada.
 *         example: AER-001
 *     responses:
 *       200:
 *         description: Aeronave encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aeronave'
 *       404:
 *         description: Aeronave nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
aeronaveRoutes.get("/:id", async (req, res) => {
    const aeronave = await aeronaveController.buscarPorCodigo(req.params.id);

    if (!aeronave) {
        res.status(404).json({ message: "Aeronave nao encontrada." });
        return;
    }

    res.json(aeronave);
});

/**
 * @swagger
 * /aeronaves/{id}:
 *   patch:
 *     summary: Atualiza uma aeronave existente pelo codigo.
 *     tags:
 *       - Aeronaves
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo da aeronave que sera atualizada.
 *         example: AER-001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarAeronave'
 *     responses:
 *       200:
 *         description: Aeronave atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aeronave'
 *       400:
 *         description: Dados invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Aeronave nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
aeronaveRoutes.patch("/:id", async (req, res) => {
    try {
        const aeronave = await aeronaveController.atualizar(req.params.id, req.body);

        if (!aeronave) {
            res.status(404).json({ message: "Aeronave nao encontrada." });
            return;
        }

        res.json(aeronave);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar aeronave.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /aeronaves/{id}:
 *   delete:
 *     summary: Remove uma aeronave existente pelo codigo.
 *     tags:
 *       - Aeronaves
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo da aeronave que sera removida.
 *         example: AER-001
 *     responses:
 *       204:
 *         description: Aeronave removida com sucesso.
 *       404:
 *         description: Aeronave nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
aeronaveRoutes.delete("/:id", async (req, res) => {
    const aeronaveDeletada = await aeronaveController.deletar(req.params.id);

    if (!aeronaveDeletada) {
        res.status(404).json({ message: "Aeronave nao encontrada." });
        return;
    }

    res.status(204).send();
});
