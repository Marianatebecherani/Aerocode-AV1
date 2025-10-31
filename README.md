# Aerocode-AV1
Projeto CRUD com CLI da matéria de Programacao Orientada a Objeto para cadastro de funcionarios e aeronaves.

# ✈️ AeroCode - Sistema de Gerenciamento de Produção Aeronáutica

![Status do Projeto](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Linguagem](https://img.shields.io/badge/linguagem-TypeScript-blue)
![Plataforma](https://img.shields.io/badge/plataforma-Node.js-green)

O AeroCode é um sistema de linha de comando (CLI) desenvolvido para gerenciar o complexo processo de produção de aeronaves. Ele permite o rastreamento desde o cadastro de funcionários e aeronaves até o gerenciamento de peças, etapas de montagem, testes de qualidade e geração de relatórios.

---

## ✨ Funcionalidades Principais

- **Controle de Acesso por Nível:**
  - **Administrador:** Gerenciamento total de usuários, aeronaves e relatórios.
  - **Engenheiro:** Definição de especificações técnicas, como peças, etapas e testes.
  - **Operador:** Execução e atualização do status das etapas de produção.
- **Gerenciamento de Produção:**
  - Cadastro detalhado de aeronaves.
  - Adição e rastreamento de peças e seus status (`EM_ESTOQUE`, `EM_USO`, `DESCARTADA`).
  - Criação e acompanhamento de etapas de produção (`PENDENTE`, `EM_ANDAMENTO`, `CONCLUIDA`).
  - Associação de funcionários a etapas específicas.
- **Persistência de Dados:**
  - Os dados são salvos localmente em arquivos JSON, simulando um banco de dados e garantindo que as informações não sejam perdidas ao fechar o sistema.
- **Relatórios e Backup:**
  - Geração de relatórios de produção, andamento, funcionários e peças.
  - Funcionalidade de backup para criar cópias de segurança dos dados.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução do JavaScript/TypeScript.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **ts-node**: Para executar o projeto TypeScript diretamente, sem a necessidade de compilação prévia.
- **bcrypt**: Para hashing seguro de senhas.

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### Pré-requisitos

Você precisa ter o Node.js (que inclui o `npm`) instalado em seu computador.

### 1. Clone o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO_GIT>
cd aerocode
```

### 2. Instale as Dependências

Dentro da pasta do projeto, execute o comando abaixo para instalar todas as bibliotecas necessárias (`typescript`, `ts-node`, `bcrypt`, etc.).

```bash
npm install
```

### 3. Execute a Aplicação

Use o `ts-node` para iniciar o sistema diretamente pelo arquivo principal.

```bash
npx ts-node src/app.ts
```

> **💡 Dica:** Na primeira vez que você executar o projeto, o sistema detectará que não há funcionários cadastrados e criará automaticamente um usuário **Administrador** padrão para você começar.

---

## 🔑 Usuário Padrão (Primeira Execução)

Ao iniciar o sistema pela primeira vez, use as seguintes credenciais para fazer login como Administrador:

- **Usuário:** `admin`
- **Senha:** `admin`

A partir deste usuário, você poderá cadastrar outros funcionários com diferentes níveis de permissão.

---


---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

Feito com ❤️ por Mariana.


