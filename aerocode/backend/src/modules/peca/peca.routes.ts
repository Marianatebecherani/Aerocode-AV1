import { Router } from "express";
import { PecaController } from "./peca.controller";
import { PecaRepository } from "./peca.repository";
import { PecaService } from "./peca.service";

const pecaRepository = new PecaRepository();
const pecaService = new PecaService(pecaRepository);
const pecaController = new PecaController(pecaService);

export const pecaRoutes = Router();

/**
 * @swagger
 * /pecas:
 *   post:
 *     summary: Cria uma nova peca.
 *     tags:
 *       - Pecas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarPeca'
 *     responses:
 *       201:
 *         description: Peca criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Peca'
 *       400:
 *         description: Dados invalidos ou peca duplicada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pecaRoutes.post("/", async (req, res) => {
    try {
        const peca = await pecaController.criar(req.body);
        res.status(201).json(peca);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar peca.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /pecas:
 *   get:
 *     summary: Lista todas as pecas cadastradas.
 *     tags:
 *       - Pecas
 *     parameters:
 *       - in: query
 *         name: tipo
 *         required: false
 *         schema:
 *           type: string
 *           enum: [NACIONAL, IMPORTADA]
 *         description: Filtra pecas pelo tipo.
 *         example: nacional
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [EM_PRODUCAO, EM_TRANSPORTE, PRONTA]
 *         description: Filtra pecas pelo status atual.
 *         example: EM_PRODUCAO
 *       - in: query
 *         name: termo
 *         required: false
 *         schema:
 *           type: string
 *         description: Busca por termo no nome ou fornecedor.
 *         example: motor
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
 *         description: Lista paginada de pecas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Peca'
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
pecaRoutes.get("/", async (req, res) => {
    try {
        const pecas = await pecaController.listar({
            ...(typeof req.query.tipo === "string" ? { tipo: req.query.tipo } : {}),
            ...(typeof req.query.status === "string" ? { status: req.query.status } : {}),
            ...(typeof req.query.termo === "string" ? { termo: req.query.termo } : {}),
            ...(typeof req.query.page === "string" ? { page: req.query.page } : {}),
            ...(typeof req.query.limit === "string" ? { limit: req.query.limit } : {})
        });
        res.json(pecas);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao listar pecas.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /pecas/{id}:
 *   get:
 *     summary: Busca uma peca especifica pelo id.
 *     tags:
 *       - Pecas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da peca que sera consultada.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Peca encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Peca'
 *       404:
 *         description: Peca nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pecaRoutes.get("/:id", async (req, res) => {
    const peca = await pecaController.buscarPorId(req.params.id);

    if (!peca) {
        res.status(404).json({ message: "Peca nao encontrada." });
        return;
    }

    res.json(peca);
});

/**
 * @swagger
 * /pecas/{id}:
 *   patch:
 *     summary: Atualiza uma peca existente pelo id.
 *     tags:
 *       - Pecas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da peca que sera atualizada.
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarPeca'
 *     responses:
 *       200:
 *         description: Peca atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Peca'
 *       400:
 *         description: Dados invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Peca nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pecaRoutes.patch("/:id", async (req, res) => {
    try {
        const peca = await pecaController.atualizar(req.params.id, req.body);

        if (!peca) {
            res.status(404).json({ message: "Peca nao encontrada." });
            return;
        }

        res.json(peca);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar peca.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /pecas/{id}/status/prosseguir:
 *   patch:
 *     summary: Avanca a peca para o proximo status.
 *     tags:
 *       - Pecas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da peca que tera o status avancado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Status da peca avancado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Peca'
 *       400:
 *         description: Erro ao avancar status.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Peca nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pecaRoutes.patch("/:id/status/prosseguir", async (req, res) => {
    try {
        const peca = await pecaController.prosseguirStatus(req.params.id);

        if (!peca) {
            res.status(404).json({ message: "Peca nao encontrada." });
            return;
        }

        res.json(peca);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao avancar status da peca.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /pecas/{id}/status/retroceder:
 *   patch:
 *     summary: Retrocede a peca para o status anterior.
 *     tags:
 *       - Pecas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da peca que tera o status retrocedido.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Status da peca retrocedido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Peca'
 *       400:
 *         description: Erro ao retroceder status.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Peca nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pecaRoutes.patch("/:id/status/retroceder", async (req, res) => {
    try {
        const peca = await pecaController.retrocederStatus(req.params.id);

        if (!peca) {
            res.status(404).json({ message: "Peca nao encontrada." });
            return;
        }

        res.json(peca);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao retroceder status da peca.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /pecas/{id}:
 *   delete:
 *     summary: Remove uma peca existente pelo id.
 *     tags:
 *       - Pecas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da peca que sera removida.
 *         example: "1"
 *     responses:
 *       204:
 *         description: Peca removida com sucesso.
 *       404:
 *         description: Peca nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pecaRoutes.delete("/:id", async (req, res) => {
    const pecaDeletada = await pecaController.deletar(req.params.id);

    if (!pecaDeletada) {
        res.status(404).json({ message: "Peca nao encontrada." });
        return;
    }

    res.status(204).send();
});
