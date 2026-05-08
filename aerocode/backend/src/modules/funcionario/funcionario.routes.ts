import { Router } from "express";
import { FuncionarioController } from "./funcionario.controller";
import { FuncionarioRepository } from "./funcionario.repository";
import { FuncionarioService } from "./funcionario.service";

const funcionarioRepository = new FuncionarioRepository();
const funcionarioService = new FuncionarioService(funcionarioRepository);
const funcionarioController = new FuncionarioController(funcionarioService);

export const funcionarioRoutes = Router();

/**
 * @swagger
 * /funcionarios:
 *   post:
 *     summary: Cria um novo funcionario.
 *     tags:
 *       - Funcionarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarFuncionario'
 *     responses:
 *       201:
 *         description: Funcionario criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Funcionario'
 *       400:
 *         description: Dados invalidos ou usuario duplicado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
funcionarioRoutes.post("/", async (req, res) => {
    try {
        const funcionario = await funcionarioController.criar(req.body);
        res.status(201).json(funcionario);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao criar funcionario.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /funcionarios:
 *   get:
 *     summary: Lista todos os funcionarios cadastrados.
 *     tags:
 *       - Funcionarios
 *     parameters:
 *       - in: query
 *         name: termo
 *         required: false
 *         schema:
 *           type: string
 *         description: Busca por termo no nome ou usuario do funcionario.
 *         example: maria
 *       - in: query
 *         name: nivelPermissao
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ADMINISTRADOR, ENGENHEIRO, OPERADOR]
 *         description: Filtra funcionarios pelo nivel de permissao.
 *         example: engenheiro
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
 *         description: Lista paginada de funcionarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Funcionario'
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
funcionarioRoutes.get("/", async (req, res) => {
    try {
        const funcionarios = await funcionarioController.listar({
            ...(typeof req.query.termo === "string" ? { termo: req.query.termo } : {}),
            ...(typeof req.query.nivelPermissao === "string" ? { nivelPermissao: req.query.nivelPermissao } : {}),
            ...(typeof req.query.page === "string" ? { page: req.query.page } : {}),
            ...(typeof req.query.limit === "string" ? { limit: req.query.limit } : {})
        });
        res.json(funcionarios);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao listar funcionarios.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /funcionarios/{id}:
 *   get:
 *     summary: Busca um funcionario especifico pelo id.
 *     tags:
 *       - Funcionarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do funcionario que sera consultado.
 *         example: "1"
 *     responses:
 *       200:
 *         description: Funcionario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Funcionario'
 *       404:
 *         description: Funcionario nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
funcionarioRoutes.get("/:id", async (req, res) => {
    const funcionario = await funcionarioController.buscarPorId(req.params.id);

    if (!funcionario) {
        res.status(404).json({ message: "Funcionario nao encontrado." });
        return;
    }

    res.json(funcionario);
});

/**
 * @swagger
 * /funcionarios/{id}:
 *   patch:
 *     summary: Atualiza um funcionario existente pelo id.
 *     tags:
 *       - Funcionarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do funcionario que sera atualizado.
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarFuncionario'
 *     responses:
 *       200:
 *         description: Funcionario atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Funcionario'
 *       400:
 *         description: Dados invalidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Funcionario nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
funcionarioRoutes.patch("/:id", async (req, res) => {
    try {
        const funcionario = await funcionarioController.atualizar(req.params.id, req.body);

        if (!funcionario) {
            res.status(404).json({ message: "Funcionario nao encontrado." });
            return;
        }

        res.json(funcionario);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao atualizar funcionario.";
        res.status(400).json({ message });
    }
});

/**
 * @swagger
 * /funcionarios/{id}:
 *   delete:
 *     summary: Remove um funcionario existente pelo id.
 *     tags:
 *       - Funcionarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id do funcionario que sera removido.
 *         example: "1"
 *     responses:
 *       204:
 *         description: Funcionario removido com sucesso.
 *       404:
 *         description: Funcionario nao encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
funcionarioRoutes.delete("/:id", async (req, res) => {
    const funcionarioDeletado = await funcionarioController.deletar(req.params.id);

    if (!funcionarioDeletado) {
        res.status(404).json({ message: "Funcionario nao encontrado." });
        return;
    }

    res.status(204).send();
});
