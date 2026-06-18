import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './esqueci-senha.html',
  styleUrl: './esqueci-senha.css'
})
export class EsqueciSenha {
  email = '';
  carregando = false;
  mensagem = '';
  sucesso = false;

  constructor(private clienteService: ClienteService) {}

  enviar() {
    this.carregando = true;
    this.mensagem = '';

    this.clienteService.esqueciSenha(this.email).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = 'E-mail de recuperação enviado! Verifique sua caixa de entrada.';
        this.carregando = false;
      },
      error: (err) => {
        this.sucesso = false;
        this.mensagem = err.error || 'Erro ao enviar e-mail. Tente novamente.';
        this.carregando = false;
      }
    });
  }
}
