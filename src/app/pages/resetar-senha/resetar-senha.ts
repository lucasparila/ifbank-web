import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class ResetarSenha implements OnInit, OnDestroy {

  novaSenha = '';
  confirmarSenha = '';
  token = '';
  carregando = false;
  mensagemErro = '';
  redefinido = false;
  contagemRedirect = 5;

  private redirectInterval: any;

  constructor(
    private clienteService: ClienteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  get forcaSenha(): { pct: number; cor: string; label: string } {
    const s = this.novaSenha;
    if (!s) return { pct: 0, cor: '#dee2e6', label: '' };
    let score = 0;
    if (s.length >= 6) score++;
    if (s.length >= 10) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[0-9]/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;

    if (score <= 1) return { pct: 25,  cor: '#dc3545', label: 'Fraca' };
    if (score === 2) return { pct: 50,  cor: '#fd7e14', label: 'Regular' };
    if (score === 3) return { pct: 75,  cor: '#ffc107', label: 'Boa' };
    return               { pct: 100, cor: '#198754', label: 'Forte' };
  }

  resetar(): void {
    if (this.novaSenha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem.';
      return;
    }
    if (this.novaSenha.length < 6) {
      this.mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';

    this.clienteService.resetarSenha(this.token, this.novaSenha).subscribe({
      next: () => {
        this.carregando = false;
        this.redefinido = true;
        this.iniciarRedirect();
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = err?.error?.message || err?.error || 'Erro ao redefinir senha. O link pode ter expirado.';
      }
    });
  }

  private iniciarRedirect(): void {
    this.redirectInterval = setInterval(() => {
      this.contagemRedirect--;
      if (this.contagemRedirect <= 0) {
        clearInterval(this.redirectInterval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.redirectInterval);
  }
}