import { Component,ChangeDetectorRef } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],

  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  dadosForm = {
    email: '',
    senha: ''
  };

  carregando: boolean = false;
  erroMensagem: string = '';

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }
  executarLogin(): void {
    if (!this.dadosForm.email || !this.dadosForm.senha) {
      this.erroMensagem = 'Por favor, preencha todos os campos.';
      return;
    }

    this.carregando = true;
    this.erroMensagem = '';

    this.clienteService.efetuarLogin(this.dadosForm).subscribe({

      next: (resposta) => {
        console.log('Resposta do login:', resposta);

        this.carregando = false;
        this.cdr.detectChanges();

        if (!resposta.idUsuario) {
          this.erroMensagem = 'Login realizado, mas o servidor não retornou o ID do usuário.';
            return;
          }

        localStorage.setItem('idUsuarioLogado', resposta.idUsuario.toString());

        console.log('ID salvo:', localStorage.getItem('idUsuarioLogado'));

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.carregando = false;
        this.cdr.detectChanges();
        
        if (err.status === 401) {
          this.erroMensagem = 'Senha incorreta. Tente novamente.';
        } else if (err.status === 404) {
          this.erroMensagem = 'Este e-mail não está cadastrado no sistema.';
        } else if(err.status === 403){
          this.erroMensagem = 'Sua conta está pendente de aprovação. Por favor, aguarde o contato do IFBank.';
        } else {
          this.erroMensagem = 'Erro de conexão com o servidor do IFBank.';
        }
        console.error(err);
      }
    });
  }
}
