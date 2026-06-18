from pathlib import Path
from dotenv import load_dotenv

# ==========================================================================================
# Carrega variaveis de ambiente usadas pelo projeto.
# A funcao procura arquivos .env na raiz do projeto e dentro da pasta src,
# informa quais foram carregados quando verbose esta ativo e retorna os caminhos principais.
# ==========================================================================================
def carregar_ambiente(verbose: bool = True) -> tuple[Path, Path]:
    src_dir = Path(__file__).resolve().parent
    project_root = src_dir.parent

    env_paths = [
        project_root / ".env",
        src_dir / ".env",
    ]

    carregados = [
        env_path
        for env_path in env_paths
        if load_dotenv(env_path)
    ]

    if verbose:
        if carregados:
            print("Arquivo(s) .env carregado(s) corretamente:")
            for env in carregados:
                print(f" - {env}")
        else:
            print("Nenhum arquivo .env encontrado.")
    return src_dir, project_root
