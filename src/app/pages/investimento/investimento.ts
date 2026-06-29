import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { InvestimentoService } from '../../services/investimento.service';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import {
  InvestimentoDTO,
  ResumoInvestimentoDTO,
  TipoInvestimentoDTO,
} from '../../models/investimento.model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-investimento',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './investimento.html',
  styleUrl: './investimento.css',
})
export class Investimento implements OnInit {
  perfil!: PerfilCompletoDTO;
  contaId!: number;

  investimentos: InvestimentoDTO[] = [];
  tiposDisponiveis: TipoInvestimentoDTO[] = [];
  resumo: ResumoInvestimentoDTO = {
    totalInvestido: 0,
    rendimentoAcumulado: 0,
    quantidadeInvestimentos: 0,
  };

  carregando = true;
  erroMensagem = '';
  sucessoMensagem = '';

  // Aplicação
  idTipoSelecionado: number | null = null;
  valorAplicado: number | null = null;
  aplicando = false;
  erroAplicacao = '';

  // Resgate
  idInvestimentoResgate: number | null = null;
  resgatando = false;
  erroResgate = '';

  constructor(
    private clienteService: ClienteService,
    private investimentoService: InvestimentoService,
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
      next: (dados) => {
        this.perfil = dados;
        if (!dados.conta) {
          this.erroMensagem = 'Nenhuma conta bancária vinculada ao seu perfil.';
          this.carregando = false;
          this.cdr.detectChanges();
          return;
        }
        // Usa o id da conta que virá do ContaDTO (veja nota abaixo)
        this.contaId = dados.conta!.id;
        this.carregarTudo();
      },
      error: () => {
        this.erroMensagem = 'Erro ao carregar os dados da sua conta.';
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarTudo(): void {
    this.investimentoService.listarTipos().subscribe({
      next: (tipos) => { this.tiposDisponiveis = tipos; this.cdr.detectChanges(); },
      error: (err) => console.error(err),
    });

    this.investimentoService.listarInvestimentos(this.contaId).subscribe({
      next: (dados) => { this.investimentos = dados; this.cdr.detectChanges(); },
      error: (err) => console.error(err),
    });

    this.investimentoService.obterResumo(this.contaId).subscribe({
      next: (dados) => {
        this.resumo = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  tipoSelecionado(): TipoInvestimentoDTO | null {
    return this.tiposDisponiveis.find(t => t.id === this.idTipoSelecionado) ?? null;
  }

  aplicar(): void {
    this.erroAplicacao = '';
    const tipo = this.tipoSelecionado();

    if (!this.idTipoSelecionado || !this.valorAplicado) {
      this.erroAplicacao = 'Preencha o tipo e o valor do investimento.';
      return;
    }
    if (this.valorAplicado <= 0) {
      this.erroAplicacao = 'O valor deve ser maior que zero.';
      return;
    }
    if (tipo && this.valorAplicado < tipo.valorMinimo) {
      this.erroAplicacao = `Valor mínimo para ${tipo.nome} é R$ ${tipo.valorMinimo.toFixed(2)}.`;
      return;
    }
    if (this.perfil.conta && this.valorAplicado > this.perfil.conta.saldo) {
      this.erroAplicacao = 'Saldo insuficiente para esta aplicação.';
      return;
    }

    this.aplicando = true;
    this.investimentoService.aplicarInvestimento({
      idConta: this.contaId,
      idTipoInvestimento: this.idTipoSelecionado,
      valorAplicado: this.valorAplicado,
    }).subscribe({
      next: () => {
        this.sucessoMensagem = 'Investimento aplicado com sucesso!';
        this.aplicando = false;
        this.idTipoSelecionado = null;
        this.valorAplicado = null;
        this.recarregar();
      },
      error: (err) => {
        this.erroAplicacao = err.error || 'Erro ao aplicar investimento. Tente novamente.';
        this.aplicando = false;
        this.cdr.detectChanges();
      },
    });
  }

  resgatar(): void {
    this.erroResgate = '';
    if (!this.idInvestimentoResgate) {
      this.erroResgate = 'Selecione um investimento para resgatar.';
      return;
    }
    this.resgatando = true;
    this.investimentoService.resgatar({
      id: this.idInvestimentoResgate,
      idConta: this.contaId,
    }).subscribe({
      next: () => {
        this.sucessoMensagem = 'Resgate realizado com sucesso!';
        this.resgatando = false;
        this.idInvestimentoResgate = null;
        this.recarregar();
      },
      error: (err) => {
        this.erroResgate = err.error || 'Erro ao realizar resgate. Tente novamente.';
        this.resgatando = false;
        this.cdr.detectChanges();
      },
    });
  }

  recarregar(): void {
    const idSessao = localStorage.getItem('idUsuarioLogado');
    if (!idSessao) return;
    this.clienteService.obterPerfilCompleto(Number(idSessao)).subscribe({
      next: (dados) => {
        this.perfil = dados;
        this.carregarTudo();
      },
      error: (err) => console.error(err),
    });
  }

  ativos(): InvestimentoDTO[] {
    return this.investimentos.filter(i => i.status === 'ATIVA');
  }

  get fotoUrlCompleta(): string {
    const foto = this.perfil?.cliente?.fotoUrl;
    if (!foto) {
      return 'avatar-padrao.svg';
    }
    return foto.startsWith('http') ? foto : 'http://localhost:8080' + foto;
  }

  onImagemErro(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'avatar-padrao.svg';
  }

  logout(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']);
  }
}