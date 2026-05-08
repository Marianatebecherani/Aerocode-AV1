import { Router } from "express";
import { EtapaController } from "./etapa.controller";
import { EtapaRepository } from "./etapa.repository";
import { EtapaService } from "./etapa.service";

const etapaRepository = new EtapaRepository();
const etapaService = new EtapaService(etapaRepository);
const etapaController = new EtapaController(etapaService);

export const etapaRoutes = Router();

/**
 * @swagger
 * /etapas:
 *   post:
 *     summary: Cria uma nova etapa.
 *     tags:
 *       - Etapas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarEtapa'
 *     responses:
 *       201:
 *         description: Etapa criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: Dados invalidos ou etapa duplicada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.post("/", async (req, res) => {
    try {
        const etapa = await etapaController.criar(req.body);
        res.status(201).json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar etapa.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /etapas:
 *   get:
 *     summary: Lista todas as etapas cadastradas.
 *     tags:
 *       - Etapas
 *     responses:
 *       200:
 *         description: Lista de etapas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Etapa'
 */
etapaRoutes.get("/", async (_req, res) => {
    const etapas = await etapaController.listar();
    res.json(etapas);
});

/**
 * @swagger
 * /etapas/{id}:
 *   get:
 *     summary: Busca uma etapa especifica pelo id.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que sera consultada.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Etapa encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.get("/:id", async (req, res) => {
    const etapa = await etapaController.buscarPorId(req.params.id);

    if (!etapa) {
        res.status(404).json({ message: "Etapa nao encontrada." });
        return;
    }

    res.json(etapa);
});

/**
 * @swagger
 * /etapas/{id}:
 *   patch:
 *     summary: Atualiza uma etapa existente pelo id.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que sera atualizada.
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarEtapa'
 *     responses:
 *       200:
 *         description: Etapa atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: Dados invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.patch("/:id", async (req, res) => {
    try {
        const etapa = await etapaController.atualizar(req.params.id, req.body);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar etapa.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /etapas/{id}/status/prosseguir:
 *   patch:
 *     summary: Avanca a etapa para o proximo status.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que tera o status avancado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Status da etapa avancado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.patch("/:id/status/prosseguir", async (req, res) => {
    const etapa = await etapaController.prosseguirStatus(req.params.id);

    if (!etapa) {
        res.status(404).json({ message: "Etapa nao encontrada." });
        return;
    }

    res.json(etapa);
});

/**
 * @swagger
 * /etapas/{id}/status/retroceder:
 *   patch:
 *     summary: Retrocede a etapa para o status anterior.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que tera o status retrocedido.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Status da etapa retrocedido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.patch("/:id/status/retroceder", async (req, res) => {
    const etapa = await etapaController.retrocederStatus(req.params.id);

    if (!etapa) {
        res.status(404).json({ message: "Etapa nao encontrada." });
        return;
    }

    res.json(etapa);
});

/**
 * @swagger
 * /etapas/{id}/status/iniciar:
 *   patch:
 *     summary: Inicia uma etapa pendente.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que sera iniciada.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Etapa iniciada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: A etapa nao pode ser iniciada no status atual.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.patch("/:id/status/iniciar", async (req, res) => {
    try {
        const etapa = await etapaController.iniciar(req.params.id);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao iniciar etapa.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /etapas/{id}/status/finalizar:
 *   patch:
 *     summary: Finaliza uma etapa em andamento.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que sera finalizada.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Etapa finalizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: A etapa nao pode ser finalizada no status atual.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.patch("/:id/status/finalizar", async (req, res) => {
    try {
        const etapa = await etapaController.finalizar(req.params.id);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao finalizar etapa.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /etapas/{id}:
 *   delete:
 *     summary: Remove uma etapa existente pelo id.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que sera removida.
 *         example: "1"
 *     responses:
 *       204:
 *         description: Etapa removida com sucesso.
 *       404:
 *         description: Etapa nao encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
etapaRoutes.delete("/:id", async (req, res) => {
    const etapaDeletada = await etapaController.deletar(req.params.id);

    if (!etapaDeletada) {
        res.status(404).json({ message: "Etapa nao encontrada." });
        return;
    }

    res.status(204).send();
});
