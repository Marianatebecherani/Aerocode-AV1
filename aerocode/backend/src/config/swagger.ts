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
