import swaggerUi = require("swagger-ui-express");

const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "AeroCode API",
        version: "1.0.0",
        description: "Documentacao da API backend do sistema AeroCode."
    },
    servers: [
        {
            url: "http://localhost:3000/api/v1",
            description: "Servidor local v1"
        }
    ],
    components: {
        schemas: {
            Aeronave: {
                type: "object",
                properties: {
                    codigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    modelo: {
                        type: "string",
                        example: "Boeing 737"
                    },
                    tipo: {
                        type: "string",
                        enum: ["COMERCIAL", "MILITAR"],
                        example: "COMERCIAL"
                    },
                    capacidade: {
                        type: "integer",
                        example: 180
                    },
                    alcance: {
                        type: "integer",
                        example: 5600
                    },
                    pecas: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/Peca"
                        }
                    },
                    etapas: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/Etapa"
                        }
                    },
                    testes: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/Teste"
                        }
                    }
                }
            },
            CriarAeronave: {
                type: "object",
                required: ["modelo", "tipo", "capacidade", "alcance"],
                properties: {
                    modelo: {
                        type: "string",
                        example: "Boeing 737"
                    },
                    tipo: {
                        type: "string",
                        enum: ["COMERCIAL", "MILITAR"],
                        example: "comercial"
                    },
                    capacidade: {
                        type: "integer",
                        example: 180
                    },
                    alcance: {
                        type: "integer",
                        example: 5600
                    }
                }
            },
            AtualizarAeronave: {
                type: "object",
                properties: {
                    modelo: {
                        type: "string",
                        example: "Boeing 737 MAX"
                    },
                    tipo: {
                        type: "string",
                        enum: ["COMERCIAL", "MILITAR"],
                        example: "COMERCIAL"
                    },
                    capacidade: {
                        type: "integer",
                        example: 190
                    },
                    alcance: {
                        type: "integer",
                        example: 6100
                    }
                }
            },
            Peca: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        example: "1"
                    },
                    nome: {
                        type: "string",
                        example: "Motor"
                    },
                    tipo: {
                        type: "string",
                        enum: ["NACIONAL", "IMPORTADA"],
                        example: "NACIONAL"
                    },
                    fornecedor: {
                        type: "string",
                        example: "Embraer"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    statusTracker: {
                        type: "object",
                        properties: {
                            atual: {
                                type: "object",
                                nullable: true,
                                properties: {
                                    status: {
                                        type: "string",
                                        enum: ["EM_PRODUCAO", "EM_TRANSPORTE", "PRONTA"],
                                        example: "EM_PRODUCAO"
                                    },
                                    data: {
                                        type: "string",
                                        format: "date-time",
                                        example: "2026-05-07T00:00:00.000Z"
                                    }
                                }
                            },
                            historico: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            enum: ["EM_PRODUCAO", "EM_TRANSPORTE", "PRONTA"],
                                            example: "EM_PRODUCAO"
                                        },
                                        data: {
                                            type: "string",
                                            format: "date-time",
                                            example: "2026-05-07T00:00:00.000Z"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            CriarPeca: {
                type: "object",
                required: ["nome", "tipo", "fornecedor", "aeronaveCodigo"],
                properties: {
                    nome: {
                        type: "string",
                        example: "Motor"
                    },
                    tipo: {
                        type: "string",
                        enum: ["NACIONAL", "IMPORTADA"],
                        example: "NACIONAL"
                    },
                    fornecedor: {
                        type: "string",
                        example: "Embraer"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    }
                }
            },
            AtualizarPeca: {
                type: "object",
                properties: {
                    nome: {
                        type: "string",
                        example: "Motor Principal"
                    },
                    tipo: {
                        type: "string",
                        enum: ["NACIONAL", "IMPORTADA"],
                        example: "IMPORTADA"
                    },
                    fornecedor: {
                        type: "string",
                        example: "AeroParts"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    }
                }
            },
            Etapa: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        example: "1"
                    },
                    nome: {
                        type: "string",
                        example: "Montagem da asa"
                    },
                    prazoConclusao: {
                        type: "string",
                        format: "date-time",
                        example: "2026-06-30T00:00:00.000Z"
                    },
                    prioridade: {
                        type: "integer",
                        example: 1
                    },
                    statusTracker: {
                        type: "object",
                        properties: {
                            atual: {
                                type: "object",
                                nullable: true,
                                properties: {
                                    status: {
                                        type: "string",
                                        enum: ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"],
                                        example: "PENDENTE"
                                    },
                                    data: {
                                        type: "string",
                                        format: "date-time",
                                        example: "2026-05-07T00:00:00.000Z"
                                    }
                                }
                            },
                            historico: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string",
                                            enum: ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"],
                                            example: "PENDENTE"
                                        },
                                        data: {
                                            type: "string",
                                            format: "date-time",
                                            example: "2026-05-07T00:00:00.000Z"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    funcionariosIds: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        example: ["1", "2"]
                    }
                }
            },
            CriarEtapa: {
                type: "object",
                required: ["nome", "prazoConclusao", "prioridade", "aeronaveCodigo"],
                properties: {
                    nome: {
                        type: "string",
                        example: "Montagem da asa"
                    },
                    prazoConclusao: {
                        type: "string",
                        format: "date-time",
                        example: "2026-06-30"
                    },
                    prioridade: {
                        type: "integer",
                        example: 1
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    funcionariosIds: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        example: ["1", "2"]
                    }
                }
            },
            AtualizarEtapa: {
                type: "object",
                properties: {
                    nome: {
                        type: "string",
                        example: "Montagem final da asa"
                    },
                    prazoConclusao: {
                        type: "string",
                        format: "date-time",
                        example: "2026-07-15"
                    },
                    prioridade: {
                        type: "integer",
                        example: 2
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    funcionariosIds: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        example: ["1", "3"]
                    }
                }
            },
            Funcionario: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        example: "1"
                    },
                    nome: {
                        type: "string",
                        example: "Maria Santos"
                    },
                    telefone: {
                        type: "string",
                        example: "(11) 99999-9999"
                    },
                    endereco: {
                        type: "string",
                        example: "Rua das Aeronaves, 123"
                    },
                    usuario: {
                        type: "string",
                        example: "maria.santos"
                    },
                    nivelPermissao: {
                        type: "string",
                        enum: ["ADMINISTRADOR", "ENGENHEIRO", "OPERADOR"],
                        example: "ENGENHEIRO"
                    }
                }
            },
            CriarFuncionario: {
                type: "object",
                required: ["nome", "telefone", "endereco", "usuario", "senha", "nivelPermissao"],
                properties: {
                    nome: {
                        type: "string",
                        example: "Maria Santos"
                    },
                    telefone: {
                        type: "string",
                        example: "(11) 99999-9999"
                    },
                    endereco: {
                        type: "string",
                        example: "Rua das Aeronaves, 123"
                    },
                    usuario: {
                        type: "string",
                        example: "maria.santos"
                    },
                    senha: {
                        type: "string",
                        format: "password",
                        example: "Senha@123"
                    },
                    nivelPermissao: {
                        type: "string",
                        enum: ["ADMINISTRADOR", "ENGENHEIRO", "OPERADOR"],
                        example: "ENGENHEIRO"
                    }
                }
            },
            AtualizarFuncionario: {
                type: "object",
                properties: {
                    nome: {
                        type: "string",
                        example: "Maria Santos"
                    },
                    telefone: {
                        type: "string",
                        example: "(11) 98888-8888"
                    },
                    endereco: {
                        type: "string",
                        example: "Avenida AeroCode, 456"
                    },
                    usuario: {
                        type: "string",
                        example: "maria.santos"
                    },
                    senha: {
                        type: "string",
                        format: "password",
                        example: "NovaSenha@123"
                    },
                    nivelPermissao: {
                        type: "string",
                        enum: ["ADMINISTRADOR", "ENGENHEIRO", "OPERADOR"],
                        example: "ADMINISTRADOR"
                    }
                }
            },
            Login: {
                type: "object",
                required: ["usuario", "senha"],
                properties: {
                    usuario: {
                        type: "string",
                        example: "maria.santos"
                    },
                    senha: {
                        type: "string",
                        format: "password",
                        example: "Senha@123"
                    }
                }
            },
            LoginResponse: {
                type: "object",
                properties: {
                    autenticado: {
                        type: "boolean",
                        example: true
                    },
                    funcionario: {
                        $ref: "#/components/schemas/Funcionario"
                    }
                }
            },
            Teste: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        example: "1"
                    },
                    tipo: {
                        type: "string",
                        enum: ["ELETRICO", "HIDRAULICO", "AERODINAMICO"],
                        example: "ELETRICO"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    resultadoTracker: {
                        type: "object",
                        properties: {
                            atual: {
                                type: "object",
                                nullable: true,
                                properties: {
                                    resultado: {
                                        type: "string",
                                        enum: ["APROVADO", "REPROVADO"],
                                        example: "APROVADO"
                                    },
                                    data: {
                                        type: "string",
                                        format: "date-time",
                                        example: "2026-05-08T01:06:48.436Z"
                                    }
                                }
                            },
                            historico: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        resultado: {
                                            type: "string",
                                            enum: ["APROVADO", "REPROVADO"],
                                            example: "APROVADO"
                                        },
                                        data: {
                                            type: "string",
                                            format: "date-time",
                                            example: "2026-05-08T01:06:48.436Z"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            CriarTeste: {
                type: "object",
                required: ["tipo", "resultado", "aeronaveCodigo"],
                properties: {
                    tipo: {
                        type: "string",
                        enum: ["ELETRICO", "HIDRAULICO", "AERODINAMICO"],
                        example: "eletrico"
                    },
                    resultado: {
                        type: "string",
                        enum: ["APROVADO", "REPROVADO"],
                        example: "aprovado"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    }
                }
            },
            AtualizarTeste: {
                type: "object",
                properties: {
                    tipo: {
                        type: "string",
                        enum: ["ELETRICO", "HIDRAULICO", "AERODINAMICO"],
                        example: "hidraulico"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    }
                }
            },
            Relatorio: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        example: "1"
                    },
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    },
                    dataEmissao: {
                        type: "string",
                        format: "date-time",
                        example: "2026-05-08T12:00:00.000Z"
                    },
                    detalhes: {
                        type: "object",
                        description: "Snapshot dos detalhes da aeronave no momento da emissao do relatorio.",
                        properties: {
                            codigo: {
                                type: "string",
                                example: "AER-0001"
                            },
                            modelo: {
                                type: "string",
                                example: "Boeing 737"
                            },
                            tipo: {
                                type: "string",
                                enum: ["COMERCIAL", "MILITAR"],
                                example: "COMERCIAL"
                            },
                            capacidade: {
                                type: "integer",
                                example: 180
                            },
                            alcance: {
                                type: "integer",
                                example: 5600
                            },
                            etapas: {
                                type: "array",
                                items: {
                                    type: "object"
                                }
                            },
                            pecas: {
                                type: "array",
                                items: {
                                    type: "object"
                                }
                            },
                            testes: {
                                type: "array",
                                items: {
                                    type: "object"
                                }
                            }
                        }
                    }
                }
            },
            CriarRelatorio: {
                type: "object",
                required: ["aeronaveCodigo"],
                properties: {
                    aeronaveCodigo: {
                        type: "string",
                        example: "AER-0001"
                    }
                }
            },
            ErrorResponse: {
                type: "object",
                properties: {
                    message: {
                        type: "string",
                        example: "Erro ao processar requisicao."
                    }
                }
            }
        }
    }
};

export const swaggerSpec = swaggerJsdoc({
    definition: swaggerDefinition,
    apis: ["./backend/src/**/*.ts"]
});

export { swaggerUi };
