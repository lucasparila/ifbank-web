export interface MovimentacaoRequestDTO {
  idConta: number;
  valor: number;
}

export interface TransferenciaRequestDTO {
  idConta: number;
  numeroContaDestino: string;
  valor: number;
}

export interface MovimentacaoResponseDTO {
  id: number;
  tipoMovimento: string;
  valor: number;
  saldoAtualizado: number;
  dataMovimento: string;
}