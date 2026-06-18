import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-resetar-senha',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './resetar-senha.html',
  styleUrl: './resetar-senha.css'
})
export class ResetarSenha implements OnInit {
  novaSenha = '';
  confirmarSenha = '';
  token = '';
  carregando = false;
  mensagem = '';
  sucesso = false;

  constructor(
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.mensagem = 'Token inválido ou expirado.';
    }
  }

  resetar() {
    if (this.novaSenha !== this.confirmarSenha) {
      this.sucesso = false;
      this.mensagem = 'As senhas não coincidem.';
      return;
    }

    this.carregando = true;
    this.mensagem = '';

    this.clienteService.resetarSenha(this.token, this.novaSenha).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = 'Senha redefinida com sucesso!';
        this.carregando = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.sucesso = false;
        this.mensagem = err.error || 'Erro ao redefinir senha. Tente novamente.';
        this.carregando = false;
      }
    });
  }
}
