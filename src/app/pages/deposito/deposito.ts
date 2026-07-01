import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { MovimentacaoService } from '../../services/movimentacao.service';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-deposito',
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './deposito.html',
  styleUrl: './deposito.css',
})
export class Deposito implements OnInit {
  perfil!: PerfilCompletoDTO;
  contaId!: number;

  valor: number | null = null;
  processando = false;
  carregando = true;
  mensagem = '';
  tipoMensagem: 'success' | 'danger' = 'success';

  constructor(
    private clienteService: ClienteService,
    private movimentacaoService: MovimentacaoService,
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
        this.contaId = dados.conta!.id;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagem = 'Erro ao carregar os dados da conta.';
        this.tipoMensagem = 'danger';
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  depositar(): void {
    this.mensagem = '';

    if (!this.valor || this.valor <= 0) {
      this.mensagem = 'Informe um valor maior que zero.';
      this.tipoMensagem = 'danger';
      return;
    }

    this.processando = true;

    this.movimentacaoService.depositar({ idConta: this.contaId, valor: this.valor }).subscribe({
      next: (res) => {
        // Atualiza o saldo exibido na tela diretamente
        if (this.perfil.conta) {
          this.perfil.conta.saldo = res.saldoAtualizado;
        }
        this.mensagem = `Depósito de R$ ${Number(res.valor).toFixed(2).replace('.', ',')} realizado com sucesso!`;
        this.tipoMensagem = 'success';
        this.valor = null;
        this.processando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensagem = typeof err.error === 'string' 
          ? err.error 
          : 'Erro ao realizar depósito. Tente novamente.';
        this.tipoMensagem = 'danger';
        this.processando = false;
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']);
  }
}