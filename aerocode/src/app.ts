import * as crypto from 'crypto';
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { Funcionario } from './models/funcionario';
import { Aeronave } from './models/aeronave';
import { NivelPermissao, TipoAeronave, TipoPeca, TipoTeste, ResultadoTeste, StatusEtapa, StatusPeca } from './enums';
import { Peca } from './models/peca';
import { Etapa } from './models/etapa';
import { Teste } from './models/teste';
import { Relatorio } from './models/relatorio';
import { PersistenceManager } from './services/persistence';

// --- Configuração do CLI ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

/**
 * Exibe uma lista de opções de um enum e solicita que o usuário escolha uma.
 * @param query O texto a ser exibido para o usuário.
 * @param enumObject O objeto enum com as opções.
 * @returns A opção do enum escolhida pelo usuário, ou null se a escolha for inválida.
 */
async function escolherOpcaoEnum<T extends string>(query: string, enumObject: { [key: string]: T }): Promise<T | null> {
    console.log(query);
    const options = Object.values(enumObject);
    options.forEach((option, index) => {
        console.log(`${index + 1}. ${option}`);
    });

    const escolha = parseInt(await question("Sua escolha: "), 10);

    if (isNaN(escolha) || escolha < 1 || escolha > options.length) {
        console.log("Erro: Opção inválida.");
        return null;
    }

    return options[escolha - 1] || null;
}

/**
 * Exibe uma lista de objetos e solicita que o usuário escolha um.
 * @param query O texto a ser exibido para o usuário.
 * @param items A lista de objetos para escolher.
 * @param displayFn Uma função que retorna a string a ser exibida para cada item.
 * @returns O objeto escolhido, ou null se a lista estiver vazia ou a escolha for inválida.
 */
async function escolherObjetoDeLista<T>(query: string, items: T[], displayFn: (item: T) => string): Promise<T | null> {
    if (items.length === 0) {
        console.log("Não há itens disponíveis para seleção.");
        return null;
    }

    console.log(query);
    items.forEach((item, index) => {
        console.log(`${index + 1}. ${displayFn(item)}`);
    });

    const escolha = parseInt(await question("Sua escolha: "), 10);
    if (isNaN(escolha) || escolha < 1 || escolha > items.length) {
        console.log("Erro: Opção inválida.");
        return null;
    }
    return items[escolha - 1] || null;
}


// --- "Banco de Dados" em Memória ---
let funcionarios: Funcionario[] = [];
let aeronaves: Aeronave[] = [];
// ... outros dados globais (peças, testes, etc., são parte da aeronave)

// --- Gerenciadores de Persistência ---
let funcionarioManager: PersistenceManager<Funcionario>;
let aeronaveManager: PersistenceManager<Aeronave>;

// --- Lógica de Persistência (Carregamento) ---
const dataDirs = {
    funcionarios: path.join(__dirname, '../data/funcionarios'),
    aeronaves: path.join(__dirname, '../data/aeronaves'),
    relatorios: path.join(__dirname, '../data/relatorios'),
    backups: path.join(__dirname, '../backups'),
};

function inicializarGerenciadores() {
    funcionarioManager = new PersistenceManager<Funcionario>(dataDirs.funcionarios);
    aeronaveManager = new PersistenceManager<Aeronave>(dataDirs.aeronaves);
}

function garantirDiretorios() {
    Object.values(dataDirs).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function carregarFuncionarios() {
    funcionarios = funcionarioManager.loadAll((obj: any) => {
        // "Hidratação": Recria a instância da classe para restaurar métodos
        return new Funcionario(
            obj.id, obj.nome, obj.telefone, obj.endereco,
            obj.usuario, obj.senha, obj.nivelPermissao
        );
    });
    console.log(`${funcionarios.length} funcionários carregados.`);
}

function carregarAeronaves() {
    aeronaves = aeronaveManager.loadAll((obj: any) => {
        // "Hidratação" da Aeronave
        const aero = new Aeronave(
            obj.codigo, obj.modelo, obj.tipo,
            obj.capacidade, obj.alcance
        );
        
        // Hidratação dos objetos internos
        aero.pecas = obj.pecas.map((p: any) => Object.assign(new Peca(p.nome, p.tipo, p.fornecedor), p));
        aero.etapas = obj.etapas.map((e: any) => {
            const etapa = Object.assign(new Etapa(e.nome, e.prazo), e);
            etapa.funcionarios = e.funcionarios.map((funcId: string) => 
                funcionarios.find(func => func.id === funcId)
            ).filter(Boolean) as Funcionario[]; // Remove nulos
            return etapa;
        });
        aero.testes = obj.testes.map((t: any) => Object.assign(new Teste(t.tipo, t.resultado), t));
        
        return aero;
    });
    console.log(`${aeronaves.length} aeronaves carregadas.`);
}

function salvarTudo() {
    console.log("Salvando dados...");
    funcionarios.forEach(f => funcionarioManager.save(f));
    aeronaves.forEach(a => aeronaveManager.save(a, (aeronave: Aeronave) => {
        const dataToSave = JSON.parse(JSON.stringify(aeronave));
        dataToSave.etapas.forEach((etapa: any) => {
            etapa.funcionarios = etapa.funcionarios.map((func: { id: string }) => func.id);
        });
        return dataToSave;
    }));
    console.log("Dados salvos.");
}

// --- Lógica de Autenticação ---
async function login(): Promise<Funcionario | null> {
    console.log("--- Bem-vindo ao Sistema AeroCode ---");
    const usuario = await question("Usuário: ");
    const senha = await question("Senha: ");

    const usuarioEncontrado = funcionarios.find(f => f.usuario.toLowerCase() === usuario.toLowerCase());

    if (usuarioEncontrado && await usuarioEncontrado.autenticarUsuario(usuarioEncontrado.usuario, senha)) {
        console.log(`Login bem-sucedido! Bem-vindo, ${usuarioEncontrado.nome} (${usuarioEncontrado.nivelPermissao}).`);
        return usuarioEncontrado;
    } else {
        console.log("Usuário ou senha inválidos.");
        return null;
    }
}

// --- Menus da Aplicação ---
async function menuAdministrador() {
    let loop = true;
    while (loop) {
        console.log("\n--- Menu Administrador ---");
        console.log("1. Cadastrar Funcionário");
        console.log("2. Cadastrar Aeronave");
        console.log("3. Ver Detalhes da Aeronave");
        console.log("4. Gerar Relatório Final de Produção");
        console.log("5. Gerar Relatório de Funcionários");
        console.log("6. Gerar Relatório de Peças");
        console.log("7. Gerar Relatório de Andamento de Aeronave");
        console.log("8. Fazer Backup dos Dados");
        console.log("0. Salvar e Sair");
        console.log("---");

        const escolha = await question("Sua escolha: ");
        switch (escolha) {
            case '1':
                await cadastrarFuncionario();
                break;
            case '2':
                await cadastrarAeronave();
                break;
            case '3':
                await verDetalhesAeronave();
                break;
            case '4':
                await gerarRelatorioProducao();
                break;
            case '5':
                await gerarRelatorioFuncionarios();
                break;
            case '6':
                await gerarRelatorioPecas();
                break;
            case '7':
                await gerarRelatorioAndamentoAeronave();
                break;
            case '8':
                await fazerBackup();
                break;
            case '0':
                loop = false;
                break;
            default:
                console.log("Opção inválida.");
        }
    }
}

async function menuEngenheiro() {
    let loop = true;
    while (loop) {
        console.log("\n--- Menu Engenheiro ---");
        console.log("1. Adicionar Peça a uma Aeronave");
        console.log("2. Adicionar Etapa de Produção a uma Aeronave");
        console.log("3. Adicionar Teste a uma Aeronave");
        console.log("4. Associar Funcionário a uma Etapa");
        console.log("5. Ver Detalhes da Aeronave");
        console.log("0. Salvar e Sair");

        const escolha = await question("Sua escolha: ");
        switch (escolha) {
            case '1':
                await adicionarPecaAeronave();
                break;
            case '2':
                await adicionarEtapaAeronave();
                break;
            case '3':
                await adicionarTesteAeronave();
                break;
            case '4':
                await associarFuncionarioEtapa();
                break;
            case '5':
                await verDetalhesAeronave();
                break;
            case '0':
                loop = false;
                break;
            default:
                console.log("Opção inválida.");
        }
    }
}

async function menuOperador(operador: Funcionario) {
    let loop = true;
    while (loop) {
        console.log("\n--- Menu Operador ---");
        console.log("1. Ver Minhas Etapas de Produção");
        console.log("2. Iniciar Etapa");
        console.log("3. Finalizar Etapa");
        console.log("4. Atualizar Status de Peça");
        console.log("0. Salvar e Sair");

        const escolha = await question("Sua escolha: ");
        switch (escolha) {
            case '1':
                await verMinhasEtapas(operador);
                break;
            case '2':
                await mudarStatusEtapa(operador, 'iniciar');
                break;
            case '3':
                await mudarStatusEtapa(operador, 'finalizar');
                break;
            case '4':
                await atualizarStatusPeca();
                break;
            case '0':
                loop = false;
                break;
            default:
                console.log("Opção inválida.");
        }
    }
}

// --- Funções do Menu Operador ---
async function verMinhasEtapas(operador: Funcionario) {
    console.log(`\n--- Etapas associadas a ${operador.nome} ---`);
    const etapasDoOperador = aeronaves.flatMap(a => 
        a.etapas
         .filter(e => e.funcionarios.some(f => f.id === operador.id))
         .map(e => ({ aeronave: a, etapa: e }))
    );

    if (etapasDoOperador.length === 0) {
        console.log("Você não está associado a nenhuma etapa no momento.");
        return;
    }

    etapasDoOperador.forEach(({ aeronave, etapa }) => {
        console.log(`- Aeronave: ${aeronave.modelo} (${aeronave.codigo}) | Etapa: ${etapa.nome} | Status: ${etapa.status}`);
    });
}

async function mudarStatusEtapa(operador: Funcionario, acao: 'iniciar' | 'finalizar') {
    console.log(`\n--- ${acao.charAt(0).toUpperCase() + acao.slice(1)} Etapa ---`);
    // 1. Encontrar todas as etapas associadas ao operador
    const etapasDoOperador = aeronaves.flatMap(a => 
        a.etapas
         .filter(e => e.funcionarios.some(f => f.id === operador.id))
         .map(e => ({ aeronave: a, etapa: e }))
    );

    if (etapasDoOperador.length === 0) {
        console.log("Você não está associado a nenhuma etapa que possa ser alterada.");
        return;
    }

    // 2. Pedir para o operador escolher uma de suas etapas
    const escolha = await escolherObjetoDeLista(
        "Escolha a etapa para " + acao + ":", 
        etapasDoOperador, 
        item => `Aeronave: ${item.aeronave.modelo} | Etapa: ${item.etapa.nome} | Status: ${item.etapa.status}`
    );

    if (!escolha) {
        return; // O usuário cancelou ou a escolha foi inválida
    }

    // 3. Executar a ação na etapa escolhida
    if (acao === 'iniciar') escolha.etapa.iniciar();
    else escolha.etapa.finalizar();
}

async function atualizarStatusPeca() {
    console.log("\n--- Atualizar Status de Peça ---");

    // 1. Escolher a aeronave
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave que contém a peça:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    if (aeronave.pecas.length === 0) {
        console.log("Esta aeronave não possui peças registradas.");
        return;
    }
    // 2. Escolher a peça dentro da aeronave
    const peca = await escolherObjetoDeLista("Escolha a peça que deseja atualizar:", aeronave.pecas, p => `${p.nome} (Status atual: ${p.status})`);
    if (!peca) {
        return;
    }

    const novoStatus = await escolherOpcaoEnum("Escolha o novo status para a peça:", StatusPeca);
    if (novoStatus) {
        peca.atualizarStatus(novoStatus);
    }
}

// --- Funções do Menu Engenheiro ---
async function adicionarPecaAeronave() {
    console.log("\n--- Adicionar Peça ---");
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    const nome = await question("Nome da Peça: ");
    const tipo = await escolherOpcaoEnum("Tipo da Peça:", TipoPeca);
    const fornecedor = await question("Fornecedor: ");

    if (!tipo) {
        return;
    }

    const novaPeca = new Peca(nome, tipo, fornecedor);
    aeronave.pecas.push(novaPeca);
    console.log(`Peça "${nome}" adicionada à aeronave ${aeronave.codigo}.`);
}

async function adicionarEtapaAeronave() {
    console.log("\n--- Adicionar Etapa de Produção ---");
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    const nome = await question("Nome da Etapa: ");
    const prazo = await question("Prazo (ex: 10 dias): ");

    const novaEtapa = new Etapa(nome, prazo);
    aeronave.etapas.push(novaEtapa);
    console.log(`Etapa "${nome}" adicionada à aeronave ${aeronave.codigo}.`);
}

async function adicionarTesteAeronave() {
    console.log("\n--- Adicionar Teste ---");
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    const tipo = await escolherOpcaoEnum("Tipo do Teste:", TipoTeste);
    const resultado = await escolherOpcaoEnum("Resultado do Teste:", ResultadoTeste);


    if (!tipo || !resultado) {
        return;
    }

    const novoTeste = new Teste(tipo, resultado);
    aeronave.testes.push(novoTeste);
    console.log(`Teste "${tipo}" adicionado à aeronave ${aeronave.codigo}.`);
}

// --- Funções de Negócio (Exemplos) ---
async function cadastrarFuncionario() {
    console.log("\n--- Cadastro de Funcionário ---");
    
    // Lógica para gerar ID numérico e sequencial
    const maiorId = funcionarios.reduce((max, f) => Math.max(max, parseInt(f.id)), 0);
    const id = (maiorId + 1).toString();

    const nome = await question("Nome: ");
    const telefone = await question("Telefone: ");
    const endereco = await question("Endereço: ");
    const usuario = await question("Usuário (para login): ");
    const senhaPlana = await question("Senha: ");
    const nivel = await escolherOpcaoEnum("Nível de Permissão:", NivelPermissao);

    // Validação básica do Nível
    if (!nivel) {
        return;
    }

    // Gera o hash da senha
    const saltRounds = 10;
    const senhaHasheada = await bcrypt.hash(senhaPlana, saltRounds);

    const novoFunc = new Funcionario(id, nome, telefone, endereco, usuario, senhaHasheada, nivel);
    funcionarios.push(novoFunc);
    console.log(`Funcionário cadastrado com sucesso! ID gerado: ${id}`);
}

async function cadastrarAeronave() {
    console.log("\n--- Cadastro de Aeronave ---");
    const codigo = crypto.randomUUID().substring(0, 8).toUpperCase(); // Gera um código mais curto
    const modelo = await question("Modelo: ");
    const tipo = await escolherOpcaoEnum("Tipo da Aeronave:", TipoAeronave);
    const capacidade = parseInt(await question("Capacidade (passageiros): "), 10);
    const alcance = parseInt(await question("Alcance (km): "), 10);

    if (!tipo) {
        return;
    }
    if (isNaN(capacidade) || isNaN(alcance)) {
        console.log("Erro: Capacidade e alcance devem ser números.");
        return;
    }

    const novaAero = new Aeronave(codigo, modelo, tipo, capacidade, alcance);
    aeronaves.push(novaAero);
    console.log(`Aeronave cadastrada com sucesso! Código gerado: ${codigo}`);
}

async function verDetalhesAeronave() {
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave para ver os detalhes:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (aeronave) {
        aeronave.detalhes();
    } else {
        console.log("Aeronave não encontrada.");
    }
}

async function gerarRelatorioProducao() {
    console.log("\n--- Geração de Relatório Final ---");
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave para o relatório:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    const cliente = await question("Nome do Cliente: ");
    const dataEntrega = await question("Data de Entrega (ex: DD/MM/AAAA): ");

    const relatorio = new Relatorio();
    relatorio.gerarRelatorio(aeronave, cliente, dataEntrega);
    relatorio.salvarEmArquivo();
}

async function gerarRelatorioAndamentoAeronave() {
    console.log("\n--- Relatório de Andamento da Aeronave ---");
    const aeronave = await escolherObjetoDeLista("Escolha a aeronave para o relatório de andamento:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    console.log(`\nAndamento da Aeronave: ${aeronave.modelo} (${aeronave.codigo})`);
    console.log("-------------------------------------------------");

    const totalEtapas = aeronave.etapas.length;
    if (totalEtapas === 0) {
        console.log("Nenhuma etapa de produção foi definida para esta aeronave.");
        console.log("Progresso: 0%");
    } else {
        const etapasConcluidas = aeronave.etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;
        const percentualConcluido = (etapasConcluidas / totalEtapas) * 100;
        console.log(`Progresso das Etapas: ${etapasConcluidas} de ${totalEtapas} concluídas.`);
        console.log(`Percentual: ${percentualConcluido.toFixed(2)}%`);
    }

    console.log(`Peças Registradas: ${aeronave.pecas.length}`);
    console.log(`Testes Realizados: ${aeronave.testes.length}`);
    console.log("-------------------------------------------------");
}

async function gerarRelatorioFuncionarios() {
    console.log("\n--- Relatório de Funcionários ---");
    if (funcionarios.length === 0) {
        console.log("Nenhum funcionário cadastrado.");
        return;
    }

    funcionarios.forEach(f => {
        console.log(`- ID: ${f.id}`);
        console.log(`  Nome: ${f.nome}`);
        console.log(`  Usuário: ${f.usuario}`);
        console.log(`  Nível: ${f.nivelPermissao}\n`);
    });
}

async function gerarRelatorioPecas() {
    console.log("\n--- Relatório Geral de Peças ---");
    const todasAsPecas = aeronaves.flatMap(a => a.pecas.map(p => ({ peca: p, aeronave: a })));

    if (todasAsPecas.length === 0) {
        console.log("Nenhuma peça registrada em nenhuma aeronave.");
        return;
    }

    todasAsPecas.forEach(({ peca, aeronave }) => {
        console.log(`- Peça: ${peca.nome} | Status: ${peca.status} | Aeronave: ${aeronave.modelo} (${aeronave.codigo})`);
    });
}

async function associarFuncionarioEtapa() {
    console.log("\n--- Associar Funcionário a uma Etapa ---");
    const aeronave = await escolherObjetoDeLista("Primeiro, escolha a aeronave:", aeronaves, a => `${a.modelo} (${a.codigo})`);
    if (!aeronave) {
        return;
    }

    const etapa = await escolherObjetoDeLista("Escolha a etapa:", aeronave.etapas, e => `${e.nome} (Status: ${e.status})`);
    
    if (!etapa) {
        console.log("Erro: Escolha de etapa inválida.");
        return;
    }

    const funcionario = await escolherObjetoDeLista("Agora, escolha o funcionário a ser associado:", funcionarios, f => `${f.nome} (ID: ${f.id})`);
    if (!funcionario) {
        return;
    }

    etapa.associarFuncionario(funcionario);
}

async function fazerBackup() {
    console.log("\n--- Iniciando Backup dos Dados ---");
    try {
        // Garante que o diretório base de backups exista
        if (!fs.existsSync(dataDirs.backups)) {
            fs.mkdirSync(dataDirs.backups, { recursive: true });
        }

        // Cria um nome de pasta único com data e hora
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const backupDir = path.join(dataDirs.backups, `backup_${timestamp}`);
        fs.mkdirSync(backupDir, { recursive: true });

        // Copia cada diretório de dados para a pasta de backup
        const dirsToBackup = ['funcionarios', 'aeronaves', 'relatorios'];
        for (const dirName of dirsToBackup) {
            const sourceDir = (dataDirs as any)[dirName];
            const destDir = path.join(backupDir, dirName);
            if (fs.existsSync(sourceDir)) {
                fs.cpSync(sourceDir, destDir, { recursive: true });
            }
        }
        console.log(`Backup concluído com sucesso em: ${backupDir}`);
    } catch (error) {
        console.error("Ocorreu um erro durante o backup:", error);
    }
}

// --- Ponto de Entrada Principal (Main) ---
async function main() {
    // 1. Setup inicial
    garantirDiretorios();
    inicializarGerenciadores();
    
    // 2. Carregar dados
    carregarFuncionarios();
    // Precisa carregar funcionários PRIMEIRO, pois Etapas dependem deles
    carregarAeronaves(); 

    // 3. (Opcional) Criar usuário admin se não houver nenhum
    if (funcionarios.length === 0) {
        console.log("Nenhum funcionário encontrado. Criando usuário 'admin' padrão.");
        const senhaPlana = "admin";
        const saltRounds = 10;
        const senhaHasheada = await bcrypt.hash(senhaPlana, saltRounds);

        const admin = new Funcionario("1", "Admin", "99999-9999", "Sao Jose dos Campos", "admin", senhaHasheada, NivelPermissao.ADMINISTRADOR);
        funcionarios.push(admin);
        funcionarioManager.save(admin); // Salva o admin inicial
        console.log("Usuário 'admin' criado com ID: 1");
    }

    // 4. Iniciar ciclo de login e menu
    let rodando = true;
    while(rodando) {
        const usuarioLogado = await login();

        if (usuarioLogado) {
            // 5. Direcionar para o menu correto
            switch (usuarioLogado.nivelPermissao) {
                case NivelPermissao.ADMINISTRADOR:
                    await menuAdministrador();
                    break;
                case NivelPermissao.ENGENHEIRO:
                    await menuEngenheiro();
                    break;
                case NivelPermissao.OPERADOR:
                    await menuOperador(usuarioLogado);
                    break;
            }
            salvarTudo(); // Salva os dados após o usuário sair do seu menu
        } else {
            // Se o login falhar, perguntamos se o usuário quer tentar de novo ou sair
            const tentarNovamente = await question("Tentar novamente? (s/n): ");
            if (tentarNovamente.toLowerCase() !== 's') {
                rodando = false;
            }
        }
    }

    // 6. Encerrar
    rl.close();
}

// Executar a aplicação
main();