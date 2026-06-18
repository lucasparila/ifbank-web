export interface InvestimentoDTO {
  id: number;
  tipoInvestimento: string;
  valorAplicado: number;
  rendimentoAcumulado: number;
  taxaRendimento: number;
  dataAplicacao: string;
  status: string;
}

export interface AplicarInvestimentoDTO {
  idConta: number;
  idTipoInvestimento: number;
  valorAplicado: number;
}

export interface ResgateDTO {
  id: number;
  idConta: number;
}

export interface ResumoInvestimentoDTO {
  totalInvestido: number;
  rendimentoAcumulado: number;
  quantidadeInvestimentos: number;
}

export interface TipoInvestimentoDTO {
  id: number;
  nome: string;
  rentabilidadeMes: number;
  carenciaDias: number;
  valorMinimo: number;
}