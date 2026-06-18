from __future__ import annotations

from pathlib import Path
import re
from typing import Any

import chromadb
import pdfplumber
import spacy
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
from langchain_text_splitters import RecursiveCharacterTextSplitter
from nltk.corpus import stopwords
from sentence_transformers import SentenceTransformer

# ==========================================================================================
# PLN com Embeddings, Banco Vetorial e Busca Semantica
#
# Este notebook implementa o laboratorio descrito no documento
# `IA-UA09-Lab1-Python-BD Vetorial e Busca Semantica`, usando Python para:
#
# - ler o conteudo textual de um PDF;
# - aplicar pre-processamento de linguagem natural em portugues;
# - dividir o texto em chunks;
# - gerar embeddings com `SentenceTransformer`;
# - armazenar os vetores em uma colecao ChromaDB;
# - consultar os trechos mais semanticamente proximos de uma pergunta.
# ==========================================================================================

# ==========================================================================================
# 1. Importacao das bibliotecas
#
# As bibliotecas necessarias ja estao instaladas no ambiente do projeto.
# Nesta etapa apenas importamos os recursos usados no fluxo.
# ==========================================================================================

# ==========================================================================================
# 2. Configuracao do arquivo PDF
#
# O roteiro do laboratorio cita o dataset `introducaoml.pdf`. O arquivo deve
# ficar em `data/introducaoml.pdf`, dentro da pasta do laboratorio. Se ele nao
# estiver disponivel, o notebook usa o PDF de apoio em `../docs` como fallback
# para manter o fluxo executavel.
# ==========================================================================================

DATA_DIR = Path("data")
DOCS_DIR = Path("..") / "docs"
PREFERRED_PDF = DATA_DIR / "busca_informada.pdf"
DEFAULT_COLLECTION_NAME = "machlrn"
DEFAULT_EMBEDDING_MODEL = "all-MiniLM-L6-v2"

_nlp = None
_stop_words: set[str] | None = None
_indice_padrao: dict[str, Any] | None = None
_ultimo_texto_lido = ""
_ultimo_pdf_lido: Path | None = None


def selecionar_pdf(
    preferred_pdf: str | Path = PREFERRED_PDF,
    docs_dir: str | Path = DOCS_DIR,
) -> Path:
    """Seleciona o PDF principal ou o primeiro PDF disponivel em docs."""
    preferred_pdf = Path(preferred_pdf)
    docs_dir = Path(docs_dir)

    if preferred_pdf.exists():
        return preferred_pdf

    available_pdfs = sorted(docs_dir.glob("*.pdf"))
    if available_pdfs:
        return available_pdfs[0]

    raise FileNotFoundError(
        f"Nenhum PDF encontrado em {preferred_pdf} ou na pasta {docs_dir}."
    )

# ==========================================================================================
# 3. Leitura do PDF
#
# A funcao abaixo percorre todas as paginas do PDF, extrai o texto e normaliza
# quebras de linha para espacos. Isso deixa o conteudo pronto para as etapas de
# PLN.
# ==========================================================================================

def ler_pdf(caminho_pdf: str | Path) -> str:
    """Le todas as paginas de um PDF e retorna o texto concatenado."""
    caminho_pdf = Path(caminho_pdf)

    with pdfplumber.open(caminho_pdf) as leitor_pdf:
        paginas = [pagina.extract_text() or "" for pagina in leitor_pdf.pages]

    return " ".join(paginas).replace("\n", " ").strip()

# ==========================================================================================
# 4. Preparacao dos recursos de PLN
#
# O pre-processamento usa stopwords em portugues e o modelo `pt_core_news_sm`
# do spaCy. Se algum recurso linguistico nao estiver disponivel localmente, o
# notebook usa uma alternativa minima para permitir a execucao, sem instalar
# bibliotecas novas.
# ==========================================================================================

def carregar_stopwords_portugues() -> set[str]:
    """Carrega stopwords em portugues do NLTK, com fallback local."""
    try:
        return set(stopwords.words("portuguese"))
    except LookupError:
        return {
            "a", "à", "ao", "aos", "as", "às", "com", "da", "das", "de", "do",
            "dos", "e", "em", "na", "nas", "no", "nos", "o", "os", "ou", "para",
            "por", "que", "se", "um", "uma", "uns", "umas",
        }


def carregar_modelo_spacy():
    """Carrega o modelo de portugues do spaCy, com fallback para tokenizacao."""
    try:
        return spacy.load("pt_core_news_sm")
    except OSError:
        return spacy.blank("pt")


def preparar_recursos_pln():
    """Inicializa e reutiliza modelo spaCy e stopwords."""
    global _nlp, _stop_words

    if _nlp is None:
        _nlp = carregar_modelo_spacy()

    if _stop_words is None:
        api_stop_words = carregar_stopwords_portugues()
        minhas_stop_words = {"a", "e", "i", "o", "u"}
        _stop_words = api_stop_words | minhas_stop_words

    return _nlp, _stop_words

# ==========================================================================================
# 5. Tratamento de linguagem natural
#
# A funcao `tratamento_pln` aplica as etapas solicitadas no roteiro:
# normalizacao, remocao de numeros e pontuacao, tokenizacao, remocao de
# stopwords e lematizacao quando o modelo carregado fornece essa informacao.
# ==========================================================================================

def tratamento_pln(
    texto: str,
    nlp_model=None,
    stop_words_custom: set[str] | None = None,
) -> str:
    """Normaliza, tokeniza, remove stopwords e lematiza texto em portugues."""
    if nlp_model is None or stop_words_custom is None:
        nlp_model, stop_words_custom = preparar_recursos_pln()

    texto = texto.lower()
    texto = re.sub(r"[^a-zA-Záéíóúàâêôãõç\s]", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()

    doc = nlp_model(texto)
    tokens_limpos: list[str] = []

    for token in doc:
        termo = token.text.strip()
        if not termo or termo in stop_words_custom or token.is_punct or token.is_space:
            continue

        lema = token.lemma_.strip() if token.lemma_ else termo
        if lema and lema != "-PRON-":
            tokens_limpos.append(lema)

    return " ".join(tokens_limpos)

# ==========================================================================================
# 6. Divisao do texto em chunks
#
# A busca semantica funciona melhor quando o texto e dividido em blocos menores.
# O roteiro usa `chunk_size=150` e `chunk_overlap=30`, valores mantidos nesta
# implementacao.
# ==========================================================================================

def dividir_em_chunks(
    texto: str,
    chunk_size: int = 150,
    chunk_overlap: int = 30,
) -> list[str]:
    """Divide o texto tratado em chunks para indexacao semantica."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return text_splitter.split_text(texto)

# ==========================================================================================
# 7. Geracao de embeddings
#
# Cada chunk e convertido em um vetor numerico pelo modelo `all-MiniLM-L6-v2`.
# Esses vetores representam o significado aproximado dos trechos e serao
# gravados no banco vetorial.
# ==========================================================================================

def carregar_modelo_embedding(
    model_name: str = DEFAULT_EMBEDDING_MODEL,
) -> SentenceTransformer:
    """Carrega o modelo de embeddings usado para chunks e consultas."""
    return SentenceTransformer(model_name)


def gerar_embeddings(
    chunks: list[str],
    embedding_model: SentenceTransformer,
    show_progress_bar: bool = True,
):
    """Gera embeddings para a lista de chunks."""
    return embedding_model.encode(chunks, show_progress_bar=show_progress_bar)

# ==========================================================================================
# 8. Criacao da colecao no ChromaDB
#
# A colecao abaixo e criada em memoria. Isso simplifica o laboratorio: a cada
# execucao completa do notebook, os vetores sao reconstruidos a partir do PDF.
# ==========================================================================================

def criar_colecao(
    chunks: list[str],
    embeddings,
    collection_name: str = DEFAULT_COLLECTION_NAME,
):
    """Cria ou recupera uma colecao ChromaDB e adiciona os chunks."""
    client = chromadb.Client()
    collection = client.get_or_create_collection(name=collection_name)
    uids = [f"doc_{i}" for i in range(len(chunks))]

    collection.upsert(
        documents=chunks,
        embeddings=embeddings.tolist(),
        ids=uids,
    )

    return collection


def criar_indice_pln(
    pdf_path: str | Path | None = None,
    collection_name: str = DEFAULT_COLLECTION_NAME,
    embedding_model_name: str = DEFAULT_EMBEDDING_MODEL,
    chunk_size: int = 150,
    chunk_overlap: int = 30,
    show_progress_bar: bool = True,
) -> dict[str, Any]:
    """Executa o fluxo completo de PLN e retorna os objetos reutilizaveis."""
    caminho_pdf = Path(pdf_path) if pdf_path is not None else selecionar_pdf()
    texto_pdf = ler_pdf(caminho_pdf)
    texto_pdf_tratado = tratamento_pln(texto_pdf)
    chunks = dividir_em_chunks(texto_pdf_tratado, chunk_size, chunk_overlap)
    embedding_model = carregar_modelo_embedding(embedding_model_name)
    embeddings = gerar_embeddings(chunks, embedding_model, show_progress_bar)
    collection = criar_colecao(chunks, embeddings, collection_name)

    return {
        "pdf_path": caminho_pdf,
        "texto_pdf": texto_pdf,
        "texto_pdf_tratado": texto_pdf_tratado,
        "chunks": chunks,
        "embedding_model": embedding_model,
        "collection": collection,
    }

# ==========================================================================================
# 9. Busca semantica
#
# A consulta e transformada em embedding e comparada com os vetores armazenados
# no ChromaDB. Quanto menor a distancia, maior a similaridade semantica entre a
# pergunta e o trecho recuperado.
# ==========================================================================================

def buscar_semanticamente(
    pergunta: str,
    indice: dict[str, Any] | None = None,
    n_resultados: int = 3,
) -> dict:
    """Executa uma consulta semantica na colecao ChromaDB."""
    global _indice_padrao

    if indice is None:
        if _indice_padrao is None:
            _indice_padrao = criar_indice_pln(show_progress_bar=False)
        indice = _indice_padrao

    pergunta_tratada = tratamento_pln(pergunta)
    embedding_model = indice["embedding_model"]
    collection = indice["collection"]
    query_embedding = embedding_model.encode([pergunta_tratada]).tolist()

    return collection.query(
        query_embeddings=query_embedding,
        n_results=n_resultados,
    )


# ==========================================================================================
# Ferramenta principal do subagente de PLN.
# Ela garante que o indice semantico do PDF exista, executa uma busca pelos
# trechos mais relevantes para a pergunta e guarda o texto recuperado para uso posterior.
# ==========================================================================================
@tool
def extrair_texto_pdf_semantico(
    pergunta: str = "Qual e o conteudo principal do documento?",
    n_resultados: int = 3,
) -> str:
    """
    Le o PDF configurado e extrai trechos relevantes usando busca semantica.
    Use esta ferramenta antes de contar os caracteres lidos.
    """
    global _indice_padrao, _ultimo_pdf_lido, _ultimo_texto_lido

    if _indice_padrao is None:
        _indice_padrao = criar_indice_pln(show_progress_bar=False)

    resultados = buscar_semanticamente(
        pergunta=pergunta,
        indice=_indice_padrao,
        n_resultados=n_resultados,
    )
    documentos = resultados.get("documents", [[]])[0]

    _ultimo_pdf_lido = Path(_indice_padrao["pdf_path"])
    _ultimo_texto_lido = "\n".join(documentos)

    # print("\n\nFoi usado o extrair...\n\n")

    return f"PDF {_ultimo_pdf_lido.name} lido"

# ==========================================================================================
# Ferramenta auxiliar que informa o tamanho do conteudo recuperado.
# Ela usa o texto salvo pela ultima chamada de extrair_texto_pdf_semantico e
# retorna apenas a quantidade de caracteres, seguindo o fluxo pedido no prompt.
# ==========================================================================================
@tool
def contar_caracteres_lidos() -> str:
    """
    Conta os caracteres dos trechos lidos pela ultima busca semantica no PDF.
    Use depois de extrair_texto_pdf_semantico.
    """
    return f"Total de caracteres: {len(_ultimo_texto_lido)}"

# ==========================================================================================
# Lista de ferramentas disponiveis para o subagente de PLN.
# O agente so tera acesso a estas funcoes, o que restringe sua atuacao a leitura
# semantica do PDF e contagem dos caracteres dos trechos encontrados.
# ==========================================================================================
tools_subagente_pln = [
    extrair_texto_pdf_semantico,
    contar_caracteres_lidos,
]

# ==========================================================================================
# Prompt de sistema que define o papel e as regras do subagente.
# Ele obriga o fluxo correto: primeiro extrair trechos do PDF com busca semantica,
# depois contar caracteres, sem executar tarefas fora do escopo de PLN.
# ==========================================================================================
PROMPT_AGENTE = (
    "Voce e um especialista em leitura de PDFs com PLN e busca semantica. "
    "Use SOMENTE as ferramentas extrair_texto_pdf_semantico e "
    "contar_caracteres_lidos. "
    "Quando o usuario pedir para ler um PDF, primeiro chame "
    "extrair_texto_pdf_semantico. Depois chame contar_caracteres_lidos. "
    "A resposta final deve conter exatamente o resultado das duas "
    "ferramentas, em linhas separadas. "
    "NUNCA faca calculos, conversoes de unidades ou buscas web."
)

# ==========================================================================================
# Fabrica o subagente de PLN a partir do modelo recebido.
# O create_react_agent monta um agente ReAct com as ferramentas e o prompt
# definidos acima, nomeando-o para identificacao no fluxo multiagente.
# ==========================================================================================
def criar_subagente_pln(model):
    return create_react_agent(
        model=model,
        tools=tools_subagente_pln,
        prompt=PROMPT_AGENTE,
        name="subagente_pln",
    )
