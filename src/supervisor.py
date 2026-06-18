from typing import Any, Sequence

from langchain_core.language_models.chat_models import BaseChatModel
from langgraph_supervisor import create_supervisor

# ==========================================================================================
# Prompt que orienta o supervisor a escolher o subagente correto.
# Ele descreve as responsabilidades de cada especialista e define quando delegar
# tarefas de pesquisa textual, leitura de PDF, PLN e contagem de caracteres.
# ==========================================================================================
PROMPT_SUPERVISOR = (
    "Voce e um supervisor que delega tarefas a dois especialistas:\n"
    "- subagente_pesquisa: para buscar informacoes textuais e conceitos\n"
    "- subagente_pln: para ler PDF com busca semantica e contar os "
    "- ..........."
    "caracteres lidos\n\n"
    "Para pedidos de leitura de PDF, documentos, PLN, busca semantica em "
    "PDF ou contagem de caracteres lidos, chame o subagente_pln. "
    "Se a pergunta tiver parte textual e parte sobre PDF, chame cada "
    "agente separadamente e consolide as respostas."
)

# ==========================================================================================
# Cria o agente supervisor que coordena os subagentes recebidos.
# A funcao registra a lista de agentes, conecta o modelo de linguagem e compila
# o fluxo para que o supervisor delegue tarefas e devolva a ultima mensagem gerada.
# ==========================================================================================
def criar_agente_supervisor(
    llm: BaseChatModel,
    agentes: Sequence[Any],
) -> Any:
    return create_supervisor(
        agents=list(agentes),
        model=llm,
        prompt=PROMPT_SUPERVISOR,
        output_mode="last_message",
        add_handoff_back_messages=False,
    ).compile()
