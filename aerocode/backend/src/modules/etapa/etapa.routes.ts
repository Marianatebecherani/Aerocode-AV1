import { Router } from "express";
import { EtapaController } from "./etapa.controller";
import { EtapaRepository } from "./etapa.repository";
import { EtapaService } from "./etapa.service";
import { FuncionarioRepository } from "../funcionario/funcionario.repository";

const etapaRepository = new EtapaRepository();
const funcionarioRepository = new FuncionarioRepository();
const etapaService = new EtapaService(etapaRepository, funcionarioRepository);
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
 *     parameters:
 *       - in: query
 *         name: aeronaveCodigo
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra etapas pelo codigo da aeronave.
 *         example: AER-0001
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *         description: Busca por termo no nome da etapa.
 *         example: montagem
 *       - in: query
 *         name: prazoInicio
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do intervalo de prazo de conclusao.
 *         example: "2026-06-01"
 *       - in: query
 *         name: prazoFim
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do intervalo de prazo de conclusao.
 *         example: "2026-06-30"
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDENTE, EM_ANDAMENTO, CONCLUIDA]
 *         description: Filtra etapas pelo status atual.
 *         example: pendente
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
 *         description: Lista paginada de etapas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Etapa'
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
etapaRoutes.get("/", async (req, res) => {
    try {
        const etapas = await etapaController.listar({
            ...(typeof req.query.aeronaveCodigo === "string" ? { aeronaveCodigo: req.query.aeronaveCodigo } : {}),
            ...(typeof req.query.nome === "string" ? { nome: req.query.nome } : {}),
            ...(typeof req.query.prazoInicio === "string" ? { prazoInicio: req.query.prazoInicio } : {}),
            ...(typeof req.query.prazoFim === "string" ? { prazoFim: req.query.prazoFim } : {}),
            ...(typeof req.query.status === "string" ? { status: req.query.status } : {}),
            ...(typeof req.query.page === "string" ? { page: req.query.page } : {}),
            ...(typeof req.query.limit === "string" ? { limit: req.query.limit } : {})
        });
        res.json(etapas);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao listar etapas.";
        res.status(400).json({ message });
    }
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
    try {
        const etapa = await etapaController.prosseguirStatus(req.params.id);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao avancar status da etapa.";
        res.status(400).json({ message });
    }
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
    try {
        const etapa = await etapaController.retrocederStatus(req.params.id);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao retroceder status da etapa.";
        res.status(400).json({ message });
    }
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
 * /etapas/{id}/funcionarios/{funcionarioId}:
 *   post:
 *     summary: Associa um funcionario a uma etapa.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que recebera o funcionario.
 *         example: "1"
 *       - in: path
 *         name: funcionarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do funcionario que sera associado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Funcionario associado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: Funcionario inexistente ou ja associado a etapa.
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
etapaRoutes.post("/:id/funcionarios/:funcionarioId", async (req, res) => {
    try {
        const etapa = await etapaController.associarFuncionario(req.params.id, req.params.funcionarioId);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao associar funcionario a etapa.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /etapas/{id}/funcionarios/{funcionarioId}:
 *   delete:
 *     summary: Remove a associacao de um funcionario com uma etapa.
 *     tags:
 *       - Etapas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id da etapa que tera o funcionario removido.
 *         example: "1"
 *       - in: path
 *         name: funcionarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do funcionario que sera desassociado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Funcionario desassociado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etapa'
 *       400:
 *         description: Funcionario nao esta associado a etapa.
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
etapaRoutes.delete("/:id/funcionarios/:funcionarioId", async (req, res) => {
    try {
        const etapa = await etapaController.desassociarFuncionario(req.params.id, req.params.funcionarioId);

        if (!etapa) {
            res.status(404).json({ message: "Etapa nao encontrada." });
            return;
        }

        res.json(etapa);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao remover funcionario da etapa.";
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
