import { Router } from "express";
import { TesteController } from "./teste.controller";
import { TesteRepository } from "./teste.repository";
import { TesteService } from "./teste.service";

const testeRepository = new TesteRepository();
const testeService = new TesteService(testeRepository);
const testeController = new TesteController(testeService);

export const testeRoutes = Router();

/**
 * @swagger
 * /testes:
 *   post:
 *     summary: Cria um novo teste.
 *     tags:
 *       - Testes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarTeste'
 *     responses:
 *       201:
 *         description: Teste criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teste'
 *       400:
 *         description: Dados invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
testeRoutes.post("/", async (req, res) => {
    try {
        const teste = await testeController.criar(req.body);
        res.status(201).json(teste);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar teste.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /testes:
 *   get:
 *     summary: Lista todos os testes cadastrados.
 *     tags:
 *       - Testes
 *     responses:
 *       200:
 *         description: Lista de testes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teste'
 */
testeRoutes.get("/", async (_req, res) => {
    const testes = await testeController.listar();
    res.json(testes);
});

/**
 * @swagger
 * /testes/{id}:
 *   get:
 *     summary: Busca um teste especifico pelo id.
 *     tags:
 *       - Testes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do teste que sera consultado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Teste encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teste'
 *       404:
 *         description: Teste nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
testeRoutes.get("/:id", async (req, res) => {
    const teste = await testeController.buscarPorId(req.params.id);

    if (!teste) {
        res.status(404).json({ message: "Teste nao encontrado." });
        return;
    }

    res.json(teste);
});

/**
 * @swagger
 * /testes/{id}:
 *   patch:
 *     summary: Atualiza um teste existente pelo id.
 *     tags:
 *       - Testes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do teste que sera atualizado.
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarTeste'
 *     responses:
 *       200:
 *         description: Teste atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teste'
 *       400:
 *         description: Dados invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Teste nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
testeRoutes.patch("/:id", async (req, res) => {
    try {
        const teste = await testeController.atualizar(req.params.id, req.body);

        if (!teste) {
            res.status(404).json({ message: "Teste nao encontrado." });
            return;
        }

        res.json(teste);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar teste.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /testes/{id}:
 *   delete:
 *     summary: Remove um teste existente pelo id.
 *     tags:
 *       - Testes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do teste que sera removido.
 *         example: "1"
 *     responses:
 *       204:
 *         description: Teste removido com sucesso.
 *       404:
 *         description: Teste nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
testeRoutes.delete("/:id", async (req, res) => {
    const testeDeletado = await testeController.deletar(req.params.id);

    if (!testeDeletado) {
        res.status(404).json({ message: "Teste nao encontrado." });
        return;
    }

    res.status(204).send();
});
