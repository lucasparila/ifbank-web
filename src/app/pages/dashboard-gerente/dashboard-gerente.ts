import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContaPendenteDTO, PaginaDTO, PerfilGerenteCompletoDTO } from '../../models/perfil.model';
import { GerenteService, StatusContaFiltro } from '../../services/gerente.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';

interface AbaConfig {
  status: StatusContaFiltro;
  label: string;
}

@Component({
  selector: 'app-dashboard-gerente',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard-gerente.html',
  styleUrl: './dashboard-gerente.css',
})
export class DashboardGerente implements OnInit {
  abas: AbaConfig[] = [
    { status: 'PENDENTE', label: 'Pendentes' },
    { status: 'ATIVA', label: 'Aprovadas' },
    { status: 'INATIVA', label: 'Inativas' },
    { status: 'REJEITADA', label: 'Reprovadas' },
  ];

  abaAtiva: StatusContaFiltro = 'PENDENTE';

  pagina: PaginaDTO<ContaPendenteDTO> | null = null;
  paginaAtual: number = 0;
  tamanhoPagina: number = 10;

  dadosGerente!: PerfilGerenteCompletoDTO;
  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    private gerenteService: GerenteService,
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
    this.carregando = true;
    this.gerenteService.obterPerfilCompleto(Number(idSessao)).subscribe({
      next: (dados) => {
        if (dados.perfil !== 'GERENTE') {
          this.router.navigate(['/home']);
          return;
        }
        this.dadosGerente = dados;
        this.carregarPagina();
      },
      error: (err) => {
        console.error('Erro ao carregar perfil do gerente:', err);
        this.router.navigate(['/login']);
      },
    });
  }

  trocarAba(status: StatusContaFiltro): void {
    if (this.abaAtiva === status) return;
    this.abaAtiva = status;
    this.paginaAtual = 0;
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    this.carregarPagina();
  }

  carregarPagina(): void {
    this.carregando = true;
    this.gerenteService
      .obterContasPorStatus(this.abaAtiva, this.paginaAtual, this.tamanhoPagina)
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (dados) => {
          this.pagina = dados;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.mensagemErro = 'Não foi possível carregar a lista de contas.';
          console.error(err);
        },
      });
  }

  irParaPagina(numero: number): void {
    if (!this.pagina || numero < 0 || numero >= this.pagina.totalPages) return;
    this.paginaAtual = numero;
    this.carregarPagina();
  }

  proximaPagina(): void {
    if (this.pagina && !this.pagina.last) {
      this.irParaPagina(this.paginaAtual + 1);
    }
  }

  paginaAnterior(): void {
    if (this.pagina && !this.pagina.first) {
      this.irParaPagina(this.paginaAtual - 1);
    }
  }

  // Mostra "Aprovar" se estiver PENDENTE ou REJEITADA (reanálise)
  podeAprovar(): boolean {
    return this.abaAtiva === 'PENDENTE' || this.abaAtiva === 'REJEITADA';
  }

  // Mostra "Reprovar" só se estiver PENDENTE
  podeReprovar(): boolean {
    return this.abaAtiva === 'PENDENTE';
  }

  confirmarAprovacao(idConta: number | undefined, nomeCliente: string): void {
    if (!idConta) return;
    this.carregando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    this.gerenteService
      .aprovarConta(idConta)
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.mensagemSucesso = `A conta de ${nomeCliente} foi ativada com sucesso!`;
          this.carregarPagina();
        },
        error: (err) => {
          this.mensagemErro = 'Falha ao tentar aprovar a conta do cliente.';
          console.error(err);
          this.cdr.detectChanges();
        },
      });
  }

  confirmarReprovacao(idConta: number | undefined, nomeCliente: string): void {
    if (!idConta) return;
    this.carregando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    this.gerenteService
      .reprovarConta(idConta)
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.mensagemSucesso = `A conta de ${nomeCliente} foi reprovada com sucesso!`;
          this.carregarPagina();
        },
        error: (err) => {
          this.mensagemErro = 'Falha ao tentar reprovar a conta do cliente.';
          console.error(err);
          this.cdr.detectChanges();
        },
      });
  }

  onImagemErro(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'avatar-padrao.svg';
  }

  logoutGerente(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']);
  }
}