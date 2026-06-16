import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ContaPendenteDTO, PerfilGerenteCompletoDTO } from '../../models/perfil.model';
import { GerenteService } from '../../services/gerente.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import{RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-dashboard-gerente',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard-gerente.html',
  styleUrl: './dashboard-gerente.css',
})
export class DashboardGerente implements OnInit {
  contasPendentes: ContaPendenteDTO[] = [];
  dadosGerente!: PerfilGerenteCompletoDTO;
  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    private gerenteService: GerenteService,
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

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
        console.log('Perfil do gerente carregado:', this.dadosGerente);
      
        this.carregarPendencias();
      },
      error: (err) => {
        console.error("Erro ao carregar perfil do gerente:", err);
        this.router.navigate(['/login']);
      }
    });

  }

  carregarPendencias(): void {
    this.carregando = true;
    this.gerenteService.obterContasPendentes()
      .pipe(finalize(() => { this.carregando = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (dados) => {
          console.log('Contas pendentes recebidas:', dados);
          this.contasPendentes = dados;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.mensagemErro = 'Não foi possível carregar a lista de contas pendentes.';
          console.error(err);
        }
      });
  }

  confirmarAprovacao(idConta: number | undefined, nomeCliente: string): void {
     console.log('clicou', idConta, nomeCliente);
    if (!idConta) return;

    this.carregando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    this.gerenteService.aprovarConta(idConta)
      .pipe(
        finalize(() => { this.carregando = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (resposta) => {
          this.mensagemSucesso = `A conta de ${nomeCliente} foi ativada com sucesso!`;
          this.carregarPendencias();
        },
        error: (err) => {
          this.mensagemErro = 'Falha ao tentar aprovar a conta do cliente.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  logoutGerente(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']); 
  }
}
