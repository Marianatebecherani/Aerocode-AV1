// Massa de Dados — Backend de Aeronaves

// Aeronaves
export const aeronaves = [
  {
    codigo: "AER-0001",
    modelo: "Boeing 737 MAX 8",
    tipo: "COMERCIAL",
    capacidade: 210,
    alcance: 6570
  },
  {
    codigo: "AER-0002",
    modelo: "Airbus A320neo",
    tipo: "COMERCIAL",
    capacidade: 195,
    alcance: 6300
  },
  {
    codigo: "AER-0003",
    modelo: "Embraer KC-390",
    tipo: "MILITAR",
    capacidade: 80,
    alcance: 2815
  },
  {
    codigo: "AER-0004",
    modelo: "Lockheed Martin F-35",
    tipo: "MILITAR",
    capacidade: 1,
    alcance: 2200
  }
];

// Funcionários
export const funcionarios = [
  
  // 4 Administradores
  {
    id: "1",
    nome: "Gerson da Penha",
    telefone: "(12) 99111-1001",
    endereco: "Rua das Palmeiras, 120 - São José dos Campos/SP",
    usuario: "gerson.admin",
    senha: "adminpassword",
    nivelPermissao: "ADMINISTRADOR"
  },
  {
    id: "2",
    nome: "Fernanda Alves Lima",
    telefone: "(12) 99111-1002",
    endereco: "Av. Andrômeda, 450 - São José dos Campos/SP",
    usuario: "fernanda.admin",
    senha: "adminpassword",
    nivelPermissao: "ADMINISTRADOR"
  },
  {
    id: "3",
    nome: "Ricardo Mendes Costa",
    telefone: "(12) 99111-1003",
    endereco: "Rua Saturnino de Brito, 88 - Jacareí/SP",
    usuario: "ricardo.admin",
    senha: "adminpassword",
    nivelPermissao: "ADMINISTRADOR"
  },
  {
    id: "4",
    nome: "Juliana Prado Martins",
    telefone: "(12) 99111-1004",
    endereco: "Rua Esperança, 210 - Taubaté/SP",
    usuario: "juliana.admin",
    senha: "adminpassword",
    nivelPermissao: "ADMINISTRADOR"
  },

  // Engenheiros
  {
    id: "5",
    nome: "Mariana Tebecherani",
    telefone: "(12) 99222-2001",
    endereco: "Av. Cidade Jardim, 900 - São José dos Campos/SP",
    usuario: "mariana.eng",
    senha: "engpassword",
    nivelPermissao: "ENGENHEIRO"
  },
  {
    id: "6",
    nome: "Patrícia Moraes Silva",
    telefone: "(12) 99222-2002",
    endereco: "Rua Monte Castelo, 77 - Caçapava/SP",
    usuario: "patricia.eng",
    senha: "engpassword",
    nivelPermissao: "ENGENHEIRO"
  },
  {
    id: "7",
    nome: "André Luiz Ferreira",
    telefone: "(12) 99222-2003",
    endereco: "Rua das Acácias, 300 - São José dos Campos/SP",
    usuario: "andre.eng",
    senha: "engpassword",
    nivelPermissao: "ENGENHEIRO"
  },
  {
    id: "8",
    nome: "Camila Ribeiro Gomes",
    telefone: "(12) 99222-2004",
    endereco: "Av. São João, 155 - São José dos Campos/SP",
    usuario: "camila.eng",
    senha: "engpassword",
    nivelPermissao: "ENGENHEIRO"
  },

  // Operadores
  {
    id: "9",
    nome: "João Inácio da Silva",
    telefone: "(12) 99333-3001",
    endereco: "Rua Primavera, 80 - Jacareí/SP",
    usuario: "joao.op",
    senha: "oppassword",
    nivelPermissao: "OPERADOR"
  },
  {
    id: "10",
    nome: "Larissa Monteiro Dias",
    telefone: "(12) 99333-3002",
    endereco: "Rua das Flores, 91 - São José dos Campos/SP",
    usuario: "larissa.op",
    senha: "oppassword",
    nivelPermissao: "OPERADOR"
  },
  {
    id: "11",
    nome: "Gustavo Pereira Lima",
    telefone: "(12) 99333-3003",
    endereco: "Av. Cassiano Ricardo, 500 - São José dos Campos/SP",
    usuario: "gustavo.op",
    senha: "oppassword",
    nivelPermissao: "OPERADOR"
  },
  {
    id: "12",
    nome: "Bianca Teixeira Oliveira",
    telefone: "(12) 99333-3004",
    endereco: "Rua Central, 55 - Taubaté/SP",
    usuario: "bianca.op",
    senha: "oppassword",
    nivelPermissao: "OPERADOR"
  }
];

// Peças
export const pecas = [
  // AER-0001
  {
    id: "1",
    nome: "Turbina Esquerda",
    tipo: "IMPORTADA",
    fornecedor: "GE Aerospace",
    aeronaveCodigo: "AER-0001"
  },
  {
    id: "2",
    nome: "Turbina Direita",
    tipo: "IMPORTADA",
    fornecedor: "GE Aerospace",
    aeronaveCodigo: "AER-0001"
  },
  {
    id: "3",
    nome: "Trem de Pouso",
    tipo: "NACIONAL",
    fornecedor: "Embraer Systems",
    aeronaveCodigo: "AER-0001"
  },
  {
    id: "4",
    nome: "Painel de Controle",
    tipo: "IMPORTADA",
    fornecedor: "Honeywell",
    aeronaveCodigo: "AER-0001"
  },
  {
    id: "5",
    nome: "Sistema de Navegação",
    tipo: "IMPORTADA",
    fornecedor: "Garmin",
    aeronaveCodigo: "AER-0001"
  },

  // AER-0002
  {
    id: "6",
    nome: "Asa Direita",
    tipo: "NACIONAL",
    fornecedor: "Avibras",
    aeronaveCodigo: "AER-0002"
  },
  {
    id: "7",
    nome: "Asa Esquerda",
    tipo: "NACIONAL",
    fornecedor: "Avibras",
    aeronaveCodigo: "AER-0002"
  },
  {
    id: "8",
    nome: "Cockpit Digital",
    tipo: "IMPORTADA",
    fornecedor: "Thales",
    aeronaveCodigo: "AER-0002"
  },
  {
    id: "9",
    nome: "Sistema Hidráulico",
    tipo: "IMPORTADA",
    fornecedor: "Parker Aerospace",
    aeronaveCodigo: "AER-0002"
  },
  {
    id: "10",
    nome: "Freio Aerodinâmico",
    tipo: "NACIONAL",
    fornecedor: "Akaer",
    aeronaveCodigo: "AER-0002"
  },

  // AER-0003
  {
    id: "11",
    nome: "Compartimento de Carga",
    tipo: "NACIONAL",
    fornecedor: "Embraer Defense",
    aeronaveCodigo: "AER-0003"
  },
  {
    id: "12",
    nome: "Radar Militar",
    tipo: "IMPORTADA",
    fornecedor: "Raytheon",
    aeronaveCodigo: "AER-0003"
  },
  {
    id: "13",
    nome: "Motor Turboélice",
    tipo: "IMPORTADA",
    fornecedor: "Rolls-Royce",
    aeronaveCodigo: "AER-0003"
  },
  {
    id: "14",
    nome: "Blindagem Inferior",
    tipo: "NACIONAL",
    fornecedor: "CBC Aero",
    aeronaveCodigo: "AER-0003"
  },
  {
    id: "15",
    nome: "Sistema de Comunicação",
    tipo: "IMPORTADA",
    fornecedor: "Motorola Aerospace",
    aeronaveCodigo: "AER-0003"
  },

  // AER-0004
  {
    id: "16",
    nome: "Canhão Integrado",
    tipo: "IMPORTADA",
    fornecedor: "Lockheed Martin",
    aeronaveCodigo: "AER-0004"
  },
  {
    id: "17",
    nome: "Sensor Térmico",
    tipo: "IMPORTADA",
    fornecedor: "Northrop Grumman",
    aeronaveCodigo: "AER-0004"
  },
  {
    id: "18",
    nome: "Cabine Pressurizada",
    tipo: "NACIONAL",
    fornecedor: "AEL Sistemas",
    aeronaveCodigo: "AER-0004"
  },
  {
    id: "19",
    nome: "Sistema de Ejeção",
    tipo: "IMPORTADA",
    fornecedor: "Martin-Baker",
    aeronaveCodigo: "AER-0004"
  },
  {
    id: "20",
    nome: "Computador de Bordo",
    tipo: "IMPORTADA",
    fornecedor: "BAE Systems",
    aeronaveCodigo: "AER-0004"
  }
];


// Etapas
export const etapas = [
  // AER-0001
  {
    id: "1",
    nome: "Montagem da Fuselagem",
    prazoConclusao: "2026-06-10T18:00:00.000Z",
    prioridade: 1,
    aeronaveCodigo: "AER-0001",
    funcionariosIds: ["5", "9"]
  },
  {
    id: "2",
    nome: "Instalação Elétrica",
    prazoConclusao: "2026-06-15T18:00:00.000Z",
    prioridade: 2,
    aeronaveCodigo: "AER-0001",
    funcionariosIds: ["6", "10"]
  },
  {
    id: "3",
    nome: "Integração do Cockpit",
    prazoConclusao: "2026-06-20T18:00:00.000Z",
    prioridade: 3,
    aeronaveCodigo: "AER-0001",
    funcionariosIds: ["7", "11"]
  },
  {
    id: "4",
    nome: "Inspeção Final",
    prazoConclusao: "2026-06-25T18:00:00.000Z",
    prioridade: 4,
    aeronaveCodigo: "AER-0001",
    funcionariosIds: ["8", "12"]
  },

  // AER-0002
  {
    id: "5",
    nome: "Montagem Estrutural",
    prazoConclusao: "2026-07-05T18:00:00.000Z",
    prioridade: 1,
    aeronaveCodigo: "AER-0002",
    funcionariosIds: ["5", "10"]
  },
  {
    id: "6",
    nome: "Calibração de Sensores",
    prazoConclusao: "2026-07-10T18:00:00.000Z",
    prioridade: 2,
    aeronaveCodigo: "AER-0002",
    funcionariosIds: ["6", "11"]
  },
  {
    id: "7",
    nome: "Configuração de Software",
    prazoConclusao: "2026-07-15T18:00:00.000Z",
    prioridade: 3,
    aeronaveCodigo: "AER-0002",
    funcionariosIds: ["7", "12"]
  },
  {
    id: "8",
    nome: "Validação Operacional",
    prazoConclusao: "2026-07-18T18:00:00.000Z",
    prioridade: 4,
    aeronaveCodigo: "AER-0002",
    funcionariosIds: ["8", "9"]
  },

  // AER-0003
  {
    id: "9",
    nome: "Instalação de Blindagem",
    prazoConclusao: "2026-08-01T18:00:00.000Z",
    prioridade: 1,
    aeronaveCodigo: "AER-0003",
    funcionariosIds: ["5", "11"]
  },
  {
    id: "10",
    nome: "Configuração de Radar",
    prazoConclusao: "2026-08-05T18:00:00.000Z",
    prioridade: 2,
    aeronaveCodigo: "AER-0003",
    funcionariosIds: ["6", "12"]
  },
  {
    id: "11",
    nome: "Teste de Comunicação",
    prazoConclusao: "2026-08-09T18:00:00.000Z",
    prioridade: 3,
    aeronaveCodigo: "AER-0003",
    funcionariosIds: ["7", "9"]
  },
  {
    id: "12",
    nome: "Homologação Militar",
    prazoConclusao: "2026-08-15T18:00:00.000Z",
    prioridade: 4,
    aeronaveCodigo: "AER-0003",
    funcionariosIds: ["8", "10"]
  },

  // AER-0004
  {
    id: "13",
    nome: "Integração de Armamentos",
    prazoConclusao: "2026-09-01T18:00:00.000Z",
    prioridade: 1,
    aeronaveCodigo: "AER-0004",
    funcionariosIds: ["5", "12"]
  },
  {
    id: "14",
    nome: "Ajuste de Sensores",
    prazoConclusao: "2026-09-06T18:00:00.000Z",
    prioridade: 2,
    aeronaveCodigo: "AER-0004",
    funcionariosIds: ["6", "9"]
  },
  {
    id: "15",
    nome: "Configuração Tática",
    prazoConclusao: "2026-09-10T18:00:00.000Z",
    prioridade: 3,
    aeronaveCodigo: "AER-0004",
    funcionariosIds: ["7", "10"]
  },
  {
    id: "16",
    nome: "Teste de Combate Simulado",
    prazoConclusao: "2026-09-15T18:00:00.000Z",
    prioridade: 4,
    aeronaveCodigo: "AER-0004",
    funcionariosIds: ["8", "11"]
  }
];


// Testes
export const testes = [
  // AER-0001
  {
    id: "1",
    tipo: "ELETRICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0001"
  },
  {
    id: "2",
    tipo: "HIDRAULICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0001"
  },
  {
    id: "3",
    tipo: "AERODINAMICO",
    resultado: "REPROVADO",
    aeronaveCodigo: "AER-0001"
  },

  // AER-0002
  {
    id: "4",
    tipo: "ELETRICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0002"
  },
  {
    id: "5",
    tipo: "HIDRAULICO",
    resultado: "REPROVADO",
    aeronaveCodigo: "AER-0002"
  },
  {
    id: "6",
    tipo: "AERODINAMICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0002"
  },

  // AER-0003
  {
    id: "7",
    tipo: "ELETRICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0003"
  },
  {
    id: "8",
    tipo: "HIDRAULICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0003"
  },
  {
    id: "9",
    tipo: "AERODINAMICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0003"
  },

  // AER-0004
  {
    id: "10",
    tipo: "ELETRICO",
    resultado: "REPROVADO",
    aeronaveCodigo: "AER-0004"
  },
  {
    id: "11",
    tipo: "HIDRAULICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0004"
  },
  {
    id: "12",
    tipo: "AERODINAMICO",
    resultado: "APROVADO",
    aeronaveCodigo: "AER-0004"
  }
];
