from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool


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

PROMPT_AGENTE = (
    "Voce e um especialista em pesquisa de informacoes textuais. "
    "Use as ferramentas buscar_na_web e resumir_texto. "
    "NUNCA tente fazer extracao de dados em PDF."
)

def criar_subagente_pesquisa(model):
    return create_react_agent(
        model=model,
        tools=tools_subagente_pesquisa,
        prompt=PROMPT_AGENTE,
        name="subagente_pesquisa",
    )
