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
#    GROQ_MODEL=llama-3.3-70b-versatile
#
# ==========================================================================================

from pathlib import Path

from config import carregar_ambiente
from llm import criar_llm
from supervisor import criar_agente_supervisor
from agentes.subagente_pesquisa import criar_subagente_pesquisa
from agentes.subagente_pln import criar_subagente_pln

# ==========================================================================================
# Envia uma pergunta ao supervisor e retorna as mensagens geradas pelo fluxo.
# A funcao tambem imprime um cabecalho no terminal para separar visualmente cada
# interacao feita pelo usuario durante a execucao em modo console.
# ==========================================================================================
def perguntar(pergunta: str) -> str:
    print(f"\n{'=' * 90}")
    print(f"PERGUNTA: {pergunta}")
    print("=" * 90)
    resultado = supervisor.invoke({
        "messages": [{"role": "user", "content": pergunta}]
    })
    resposta = resultado["messages"]
    return resposta


# ==========================================================================================
# Ponto de entrada da aplicacao quando o arquivo e executado diretamente.
# Neste bloco o ambiente e carregado, os agentes sao montados e o loop de
# perguntas do terminal e iniciado.
# ==========================================================================================
if __name__ == "__main__":
    
    src_dir, project_root = carregar_ambiente()

    # ======================================================================================
    # 1. MODELO BASE
    # Cria o modelo de linguagem compartilhado pelos subagentes e pelo supervisor.
    # As configuracoes podem vir de parametros padrao ou das variaveis de ambiente.
    # ======================================================================================
    llm = criar_llm()
    
    # ======================================================================================
    # 2. SUBAGENTES
    # Instancia os especialistas que executam tarefas especificas.
    # Um subagente cuida de pesquisa textual e o outro cuida de PLN aplicado a PDFs.
    # ======================================================================================
    subagente_pesquisa = criar_subagente_pesquisa(llm)
    subagente_pln = criar_subagente_pln(llm)
        
    # ======================================================================================
    # 3. SUPERVISOR
    # Monta o agente supervisor responsavel por decidir qual subagente deve agir.
    # Ele recebe o mesmo modelo base e a lista de especialistas disponiveis.
    # ======================================================================================
    supervisor = criar_agente_supervisor(llm, [subagente_pesquisa, subagente_pln])

    # ======================================================================================
    # 4. EXECUCAO
    # Inicia o loop interativo no terminal.
    # O usuario digita perguntas, o supervisor processa cada entrada e o programa
    # encerra somente quando o comando "sair" e informado.
    # ======================================================================================
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


