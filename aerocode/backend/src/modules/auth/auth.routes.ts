import { Router } from "express";
import { FuncionarioRepository } from "../funcionario/funcionario.repository";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const funcionarioRepository = new FuncionarioRepository();
const authService = new AuthService(funcionarioRepository);
const authController = new AuthController(authService);

export const authRoutes = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um funcionario pelo usuario e senha.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Resultado da autenticacao.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Credenciais invalidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.post("/login", async (req, res) => {
    try {
        const resultado = await authController.login(req.body);
        res.json(resultado);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao autenticar funcionario.";
        res.status(400).json({ message });
    }
});
