import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css'
})
export class EsqueciSenha implements OnDestroy {

  // Controle de etapas: 1=email | 2=código | 3=nova senha | 4=sucesso
  etapa = 1;

  email = '';
  digitos: string[] = ['', '', '', '', '', ''];
  novaSenha = '';
  confirmarSenha = '';
  tokenConfirmado = '';

  carregando = false;
  verificando = false;
  salvando = false;

  mensagemErro = '';
  reenvioCarregando = false;
  reenvioContagem = 0;
  contagemRedirect = 5;

  private reenvioInterval: any;
  private redirectInterval: any;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ─── ETAPA 1 ─────────────────────────────────────────────────────────────

  enviarCodigo(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.clienteService.esqueciSenha(this.email).subscribe({
      next: () => {
        this.carregando = false;
        this.etapa = 2;
        this.cdr.detectChanges();
        this.iniciarContagemReenvio();
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = err?.error || 'Erro ao enviar o código. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  reenviar(): void {
    this.reenvioCarregando = true;
    this.mensagemErro = '';
    this.clienteService.esqueciSenha(this.email).subscribe({
      next: () => {
        this.reenvioCarregando = false;
        this.digitos = ['', '', '', '', '', ''];
        this.cdr.detectChanges();
        this.iniciarContagemReenvio();
      },
      error: () => {
        this.reenvioCarregando = false;
        this.cdr.detectChanges();
        this.iniciarContagemReenvio();
      }
    });
  }

  // ─── ETAPA 2: OTP ────────────────────────────────────────────────────────

  get codigoCompleto(): string {
    return this.digitos.join('');
  }

  onDigito(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    input.value = val;
    this.digitos[index] = val;
    if (val && index < 5) {
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digitos[index] && index > 0) {
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const nums = text.replace(/\D/g, '').slice(0, 6).split('');
    nums.forEach((n, i) => { this.digitos[i] = n; });
    const lastIndex = Math.min(nums.length, 5);
    (document.getElementById(`otp-${lastIndex}`) as HTMLInputElement)?.focus();
  }

  verificarCodigo(): void {
    if (this.codigoCompleto.length < 6) return;
    this.tokenConfirmado = this.codigoCompleto;
    this.etapa = 3;
    this.mensagemErro = '';
    this.cdr.detectChanges();
  }

  // ─── ETAPA 3 ─────────────────────────────────────────────────────────────

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

  redefinirSenha(): void {
    if (this.novaSenha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem.';
      return;
    }
    this.salvando = true;
    this.mensagemErro = '';

    this.clienteService.resetarSenha(this.tokenConfirmado, this.novaSenha).subscribe({
      next: () => {
        this.salvando = false;
        this.etapa = 4;
        this.cdr.detectChanges();
        this.iniciarRedirect();
      },
      error: (err) => {
        this.salvando = false;
        const msg = err?.error || '';
        if (msg.toLowerCase().includes('inválido') || msg.toLowerCase().includes('expirado')) {
          this.mensagemErro = msg + ' Solicite um novo código.';
          this.etapa = 2;
          this.digitos = ['', '', '', '', '', ''];
        } else {
          this.mensagemErro = msg || 'Erro ao redefinir senha. Tente novamente.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // ─── UTILITÁRIOS ─────────────────────────────────────────────────────────

  private iniciarContagemReenvio(): void {
    clearInterval(this.reenvioInterval);
    this.reenvioContagem = 60;
    this.reenvioInterval = setInterval(() => {
      this.reenvioContagem--;
      if (this.reenvioContagem <= 0) clearInterval(this.reenvioInterval);
      this.cdr.detectChanges();
    }, 1000);
  }

  private iniciarRedirect(): void {
    this.redirectInterval = setInterval(() => {
      this.contagemRedirect--;
      if (this.contagemRedirect <= 0) {
        clearInterval(this.redirectInterval);
        this.router.navigate(['/login']);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.reenvioInterval);
    clearInterval(this.redirectInterval);
  }
}