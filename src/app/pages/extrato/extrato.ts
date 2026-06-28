import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExtratoService } from '../../services/extrato.service';
import { ClienteService } from '../../services/cliente.service';
import { MovimentacaoResponseDTO, MovimentacaoPageDTO, ExtratoFiltros } from '../../models/extrato.model';

@Component({
  selector: 'app-extrato',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './extrato.html',
  styleUrl: './extrato.css',
})
export class Extrato implements OnInit {
  movimentacoes: MovimentacaoResponseDTO[] = [];
  paginacao!: MovimentacaoPageDTO;

  carregando = true;
  erro = '';

  paginaAtual = 0;
  tamanhoPagina = 10;
  idConta = 0;
  nomeUsuario = '';
  numeroConta = '';

  // Filtros — espelham ExtratoFiltros
  filtroNome = '';
  filtroValor: number | null = null;
  ordenacao: 'dataMovimento' | 'valor' | 'tipoMovimento' = 'dataMovimento';
  direcao: 'ASC' | 'DESC' = 'DESC';

  constructor(
    private extratoService: ExtratoService,
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idSessao = localStorage.getItem('idUsuarioLogado');
    if (!idSessao) {
      this.router.navigate(['/login']);
      return;
    }

    this.clienteService.obterPerfilCompleto(Number(idSessao)).subscribe({
      next: (perfil) => {
        this.nomeUsuario = perfil.cliente.nome.split(' ')[0];
        this.numeroConta = perfil.conta?.numeroConta ?? '';
        this.idConta = perfil.conta?.id ?? 0;
        this.carregarExtrato();
      },
      error: () => {
        this.erro = 'Erro ao carregar dados do usuário.';
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarExtrato(): void {
    this.carregando = true;
    this.erro = '';

    const filtros: Partial<ExtratoFiltros> = {
      nome: this.filtroNome,
      valor: this.filtroValor,
      ordenacao: this.ordenacao,
      direcao: this.direcao,
    };

    this.extratoService
      .buscarExtrato(this.idConta, this.paginaAtual, this.tamanhoPagina, filtros)
      .subscribe({
        next: (dados) => {
          this.paginacao = dados;
          this.movimentacoes = dados.content;
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.erro = 'Erro ao carregar extrato. Verifique se o backend está rodando.';
          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  aplicarFiltros(): void {
    this.paginaAtual = 0;
    this.carregarExtrato();
  }

  limparFiltros(): void {
    this.filtroNome = '';
    this.filtroValor = null;
    this.ordenacao = 'dataMovimento';
    this.direcao = 'DESC';
    this.paginaAtual = 0;
    this.carregarExtrato();
  }

  irParaPagina(pagina: number): void {
    if (!this.paginacao) return;
    if (pagina < 0 || pagina >= this.paginacao.totalPages) return;
    this.paginaAtual = pagina;
    this.carregarExtrato();
  }

  get paginas(): number[] {
    const total = this.paginacao?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  get paginasVisiveis(): number[] {
    const total = this.paginacao?.totalPages ?? 0;
    const atual = this.paginaAtual;
    const visivel = new Set<number>();
    visivel.add(0);
    visivel.add(total - 1);
    for (let i = Math.max(0, atual - 1); i <= Math.min(total - 1, atual + 1); i++) {
      visivel.add(i);
    }
    return Array.from(visivel).sort((a, b) => a - b);
  }

  isCredito(mov: MovimentacaoResponseDTO): boolean {
    const t = mov.tipoMovimento?.toUpperCase() ?? '';
    return t === 'DEPOSITO' || t === 'TRANSFERENCIA_RECEBIDA';
  }

  formatarValor(mov: MovimentacaoResponseDTO): string {
    const prefix = this.isCredito(mov) ? '+' : '-';
    return `${prefix} ${mov.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  }

  formatarData(dataStr: string): string {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      DEPOSITO: 'Depósito',
      SAQUE: 'Saque',
      TRANSFERENCIA_ENVIADA: 'Transferência enviada',
      TRANSFERENCIA_RECEBIDA: 'Transferência recebida',
    };
    return map[tipo?.toUpperCase()] ?? tipo;
  }

  iconeMovimento(tipo: string): string {
    const t = tipo?.toUpperCase() ?? '';
    if (t === 'DEPOSITO') return 'bi-arrow-down-circle-fill';
    if (t === 'SAQUE') return 'bi-arrow-up-circle-fill';
    if (t === 'TRANSFERENCIA_ENVIADA') return 'bi-arrow-right-circle-fill';
    if (t === 'TRANSFERENCIA_RECEBIDA') return 'bi-arrow-left-circle-fill';
    return 'bi-circle-fill';
  }

  baixarPdf(): void {
  if (!this.idConta) return;

  const params: any = {};

  if (this.filtroNome && this.filtroNome.trim() !== '') {
    params.nome = this.filtroNome;
  }

  if (this.filtroValor !== null && this.filtroValor !== undefined) {
    params.valor = this.filtroValor;
  }

  if (this.ordenacao) {
    params.ordenacao = this.ordenacao;
  }

  if (this.direcao) {
    params.direcao = this.direcao;
  }

  this.extratoService.baixarPdf(this.idConta, params).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato-conta-${this.numeroConta}.pdf`;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    error: () => {
      this.erro = 'Erro ao gerar PDF do extrato.';
    }
  });
}

  logout(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']);
  }
}