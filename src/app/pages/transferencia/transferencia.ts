import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { MovimentacaoService } from '../../services/movimentacao.service';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-transferencia',
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css',
})
export class Transferencia implements OnInit {
  perfil!: PerfilCompletoDTO;
  contaId!: number;

  numeroContaDestino: string = '';
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

  transferir(): void {
    this.mensagem = '';

    if (!this.numeroContaDestino || this.numeroContaDestino.trim() === '') {
      this.mensagem = 'Informe o número da conta destino.';
      this.tipoMensagem = 'danger';
      return;
    }

    if (!this.valor || this.valor <= 0) {
      this.mensagem = 'Informe um valor maior que zero.';
      this.tipoMensagem = 'danger';
      return;
    }

    if (this.perfil.conta && this.valor > this.perfil.conta.saldo) {
      this.mensagem = 'Saldo insuficiente para esta transferência.';
      this.tipoMensagem = 'danger';
      return;
    }

    this.processando = true;

    this.movimentacaoService.transferir({
      idConta: this.contaId,
      numeroContaDestino: this.numeroContaDestino.trim(),
      valor: this.valor,
    }).subscribe({
      next: (res) => {
        if (this.perfil.conta) {
          this.perfil.conta.saldo = res.saldoAtualizado;
        }
        this.mensagem = `Transferência de R$ ${Number(res.valor).toFixed(2).replace('.', ',')} realizada com sucesso!`;
        this.tipoMensagem = 'success';
        this.numeroContaDestino = '';
        this.valor = null;
        this.processando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensagem = typeof err.error === 'string'
          ? err.error
          : 'Erro ao realizar transferência. Tente novamente.';
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