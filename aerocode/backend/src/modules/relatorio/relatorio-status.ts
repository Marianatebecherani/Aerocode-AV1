import { AeronaveDetalhesResponseDTO } from "../aeronave/aeronave.entity";
import { StatusEtapa } from "../etapa/etapa-status";
import { StatusPeca } from "../peca/peca-status";
import { ResultadoTeste } from "../teste/teste-resultado";

export enum StatusRelatorio {
    EM_PRODUCAO = "EM_PRODUCAO",
    FINALIZADA = "FINALIZADA"
}

export function determinarStatusRelatorio(detalhes: AeronaveDetalhesResponseDTO): StatusRelatorio {
    const etapasConcluidas =
        detalhes.etapas.length > 0 &&
        detalhes.etapas.every((etapa) => etapa.status === StatusEtapa.CONCLUIDA);
    const pecasProntas =
        detalhes.pecas.length > 0 &&
        detalhes.pecas.every((peca) => peca.status === StatusPeca.PRONTA);
    const testesAprovados =
        detalhes.testes.length > 0 &&
        detalhes.testes.every((teste) => teste.resultado === ResultadoTeste.APROVADO);

    return etapasConcluidas && pecasProntas && testesAprovados
        ? StatusRelatorio.FINALIZADA
        : StatusRelatorio.EM_PRODUCAO;
}
