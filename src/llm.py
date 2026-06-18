import os
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_groq import ChatGroq

# ==========================================================================================
# Cria e configura o modelo de linguagem usado pelos agentes.
# A funcao aceita valores informados por parametro, mas tambem permite configurar
# o modelo e a temperatura por variaveis de ambiente, usando padroes quando elas nao existem.
# ==========================================================================================
def criar_llm(
    model: str | None = None,
    temperature: float | None = None,
) -> BaseChatModel:

    model = model or os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile",
    )

    temperature = (
        temperature
        if temperature is not None
        else float(
            os.getenv(
                "GROQ_TEMPERATURE",
                "0"
            )
        )
    )

    return ChatGroq(
        model=model,
        temperature=temperature,
    )
