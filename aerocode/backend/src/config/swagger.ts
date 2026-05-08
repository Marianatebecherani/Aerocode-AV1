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
            url: "http://localhost:3000",
            description: "Servidor local"
        }
    ],
    components: {
        schemas: {
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
                required: ["nome", "tipo", "fornecedor"],
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
                    aeronaveId: {
                        type: "string",
                        example: "AER-001"
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
                required: ["nome", "prazoConclusao", "prioridade", "aeronaveId"],
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
                    aeronaveId: {
                        type: "string",
                        example: "AER-001"
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
                    aeronaveId: {
                        type: "string",
                        example: "AER-001"
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
                    resultado: {
                        type: "string",
                        enum: ["APROVADO", "REPROVADO"],
                        example: "APROVADO"
                    }
                }
            },
            CriarTeste: {
                type: "object",
                required: ["tipo", "resultado"],
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
                    resultado: {
                        type: "string",
                        enum: ["APROVADO", "REPROVADO"],
                        example: "reprovado"
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
