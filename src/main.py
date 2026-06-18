# ==========================================================================================
#  Agente Supervisor + 2 Subagentes
#  Subagentes: pesquisa textual e PLN para leitura de PDF
#  Framework: LangGraph | Modelo: Groq
# ==========================================================================================
#
#  PRE-REQUISITOS:
#    pip install langgraph langchain langchain-groq langgraph-supervisor python-dotenv
#
#  Crie um arquivo .env na mesma pasta com:
#    GROQ_API_KEY=gsk_...
#    GROQ_MODEL=llama-3.1-8b-instant
#
# ==========================================================================================

from pathlib import Path

from config import carregar_ambiente
from llm import criar_llm
from supervisor import criar_agente_supervisor
from agentes.subagente_pesquisa import criar_subagente_pesquisa
from agentes.subagente_pln import criar_subagente_pln

# Envia a pergunta do usuario ao agente supervisor, exibe o cabecalho da consulta
# no terminal e retorna as mensagens geradas como resposta pelo fluxo de agentes.

def perguntar(pergunta: str) -> str:
    print(f"\n{'=' * 90}")
    print(f"PERGUNTA: {pergunta}")
    print("=" * 90)
    resultado = supervisor.invoke({
        "messages": [{"role": "user", "content": pergunta}]
    })
    resposta = resultado["messages"]
    return resposta


if __name__ == "__main__":
    
    src_dir, project_root = carregar_ambiente()

    # ==========================================================================================
    # 1. MODELO BASE
    # ==========================================================================================
    llm = criar_llm()
    
    # ==========================================================================================
    # 2. SUBAGENTES
    # ==========================================================================================
    subagente_pesquisa = criar_subagente_pesquisa(llm)
    subagente_pln = criar_subagente_pln(llm)
        
    # ==========================================================================================
    # 3. SUPERVISOR
    # ==========================================================================================
    supervisor = criar_agente_supervisor(llm, [subagente_pesquisa, subagente_pln])

    # ==========================================================================================
    # 4. EXECUCAO
    # ==========================================================================================
    print("Agente pronto! Digite 'sair' para encerrar.\n")
    
    while True:
        pergunta = input("Você: ").strip()

        if not pergunta:
            continue

        if pergunta.lower() == "sair":
            print("Encerrando...")
            break

        resposta = perguntar(pergunta)
        for linha in resposta:
            print(f"{linha.content}")


