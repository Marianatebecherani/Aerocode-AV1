from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool

# ==========================================================================================
# Define uma ferramenta de pesquisa textual simulada para o subagente.
# A funcao recebe uma consulta, procura palavras-chave em uma base local de respostas
# e retorna uma informacao correspondente ou uma resposta padrao quando nao ha match.
# ==========================================================================================
@tool
def buscar_na_web(query: str) -> str:
    """
    Busca informacoes textuais sobre um tema.
    Use para perguntas sobre conceitos, fatos e definicoes.
    """
    resultados = {
        "joniel": "E um aluno da fatec que estuda IA.",
        "machine learning": (
            "Algoritmos aprendem padroes em dados para prever, decidir e "
            "melhorar automaticamente."
        ),
        "llm": "Modelo treinado em textos para compreender e gerar linguagem humana.",
        "groq": "Empresa que acelera execucao de modelos de IA com baixa latencia.",
        "default": (
            f"Informacao encontrada sobre '{query}': topico com vasta "
            "literatura disponivel."
        ),
    }
    chave = next((k for k in resultados if k in query.lower()), "default")
    return resultados[chave]

# ==========================================================================================
# Define uma ferramenta auxiliar para reduzir textos longos.
# Se o conteudo tiver ate 50 palavras, ele e mantido como esta; caso contrario,
# a funcao retorna apenas as 50 primeiras palavras seguidas de reticencias.
# ==========================================================================================
@tool
def resumir_texto(texto: str) -> str:
    """
    Resume um texto longo em ate 50 palavras.
    Use apos buscar informacoes textuais extensas.
    """
    palavras = texto.split()
    if len(palavras) <= 50:
        return texto
    return " ".join(palavras[:50]) + "..."


tools_subagente_pesquisa = [
    buscar_na_web,
    resumir_texto,
]

# ==========================================================================================
# Prompt de sistema que orienta o comportamento do subagente de pesquisa.
# Ele delimita o papel do agente, indica quais ferramentas devem ser usadas e
# impede que este subagente tente executar tarefas fora do seu escopo, como PDFs.
# ==========================================================================================
PROMPT_AGENTE = (
    "Voce e um especialista em pesquisa de informacoes textuais. "
    "Use as ferramentas buscar_na_web e resumir_texto. "
    "NUNCA tente fazer extracao de dados em PDF."
)

# ==========================================================================================
# Fabrica o subagente de pesquisa usando o modelo recebido.
# O agente e criado no padrao ReAct do LangGraph, com as ferramentas e o prompt
# definidos acima, ficando pronto para ser chamado pelo fluxo principal.
# ==========================================================================================
def criar_subagente_pesquisa(model):
    return create_react_agent(
        model=model,
        tools=tools_subagente_pesquisa,
        prompt=PROMPT_AGENTE,
        name="subagente_pesquisa",
    )
