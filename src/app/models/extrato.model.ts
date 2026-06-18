// NOVO ARQUIVO: src/app/models/extrato.model.ts

export interface MovimentacaoResponseDTO {
  id: number;
  tipoMovimento: string;        // "DEPOSITO" | "SAQUE" | "TRANSFERENCIA_ENVIADA" | "TRANSFERENCIA_RECEBIDA"
  valor: number;
  saldoAtualizado: number;
  dataMovimento: string;        // "2025-06-15"
  nomeCliente?: string;
  emailCliente?: string;
  contaDestino?: string;
}

export interface PageDTO<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;               // página atual 0-indexed
  size: number;
  first: boolean;
  last: boolean;
}

export type MovimentacaoPageDTO = PageDTO<MovimentacaoResponseDTO>;

export interface ExtratoFiltros {
  nome?: string;
  valor?: number | null;
  ordenacao: 'dataMovimento' | 'valor' | 'tipoMovimento';
  direcao: 'ASC' | 'DESC';
}