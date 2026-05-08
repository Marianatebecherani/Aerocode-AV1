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
 *     parameters:
 *       - in: query
 *         name: aeronaveCodigo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra testes pelo codigo da aeronave.
 *         example: AER-0001
 *       - in: query
 *         name: tipo
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ELETRICO, HIDRAULICO, AERODINAMICO]
 *         description: Filtra testes pelo tipo.
 *         example: eletrico
 *       - in: query
 *         name: resultado
 *         required: false
 *         schema:
 *           type: string
 *           enum: [APROVADO, REPROVADO]
 *         description: Filtra testes pelo resultado atual.
 *         example: aprovado
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
 *         description: Lista paginada de testes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teste'
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
testeRoutes.get("/", async (req, res) => {
    try {
        const testes = await testeController.listar({
            ...(typeof req.query.aeronaveCodigo === "string" ? { aeronaveCodigo: req.query.aeronaveCodigo } : {}),
            ...(typeof req.query.tipo === "string" ? { tipo: req.query.tipo } : {}),
            ...(typeof req.query.resultado === "string" ? { resultado: req.query.resultado } : {}),
            ...(typeof req.query.page === "string" ? { page: req.query.page } : {}),
            ...(typeof req.query.limit === "string" ? { limit: req.query.limit } : {})
        });
        res.json(testes);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao listar testes.";
        res.status(400).json({ message });
    }
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
 * /testes/{id}/resultado/aprovar:
 *   patch:
 *     summary: Aprova o resultado de um teste.
 *     tags:
 *       - Testes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do teste que sera aprovado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Teste aprovado com sucesso.
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
testeRoutes.patch("/:id/resultado/aprovar", async (req, res) => {
    const teste = await testeController.aprovar(req.params.id);

    if (!teste) {
        res.status(404).json({ message: "Teste nao encontrado." });
        return;
    }

    res.json(teste);
});

/**
 * @swagger
 * /testes/{id}/resultado/reprovar:
 *   patch:
 *     summary: Reprova o resultado de um teste.
 *     tags:
 *       - Testes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do teste que sera reprovado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Teste reprovado com sucesso.
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
testeRoutes.patch("/:id/resultado/reprovar", async (req, res) => {
    const teste = await testeController.reprovar(req.params.id);

    if (!teste) {
        res.status(404).json({ message: "Teste nao encontrado." });
        return;
    }

    res.json(teste);
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
