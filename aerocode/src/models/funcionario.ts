import * as bcrypt from 'bcrypt';
import { NivelPermissao } from "../enums";

export class Funcionario {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    usuario: string;
    senha: string; // Senha armazenada como hash
    nivelPermissao: NivelPermissao;

    constructor(
        id: string,
        nome: string,
        telefone: string,
        endereco: string,
        usuario: string,
        senha: string,
        nivelPermissao: NivelPermissao
    ) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.endereco = endereco;
        this.usuario = usuario;
        this.senha = senha;
        this.nivelPermissao = nivelPermissao;
    }

    /**
     * Autentica o usuário com base no usuário e senha fornecidos.
     */
    async autenticarUsuario(usuario: string, senhaPlana: string): Promise<boolean> {
        return this.usuario === usuario && await bcrypt.compare(senhaPlana, this.senha);
    }
}