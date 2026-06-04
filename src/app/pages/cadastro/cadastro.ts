import { Component,ChangeDetectorRef } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, CommonModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {

  formCadastro = {
    nome: '',
    dataNascimento: '',
    email: '',
    senha: '',
    cpf: '',
    logradouro: '',
    numero: null as number | null,
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    codPais: 55, 
    codArea: null as number | null,
    numeroTelefone: null as number | null
  };

  fotoSelecionada: File | null = null;
  carregando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  /**
   * Evento disparado quando o usuário escolhe um arquivo de imagem
   */
  onFileSelected(event: any): void {
    const arquivo: File = event.target.files[0];
    if (arquivo) {
      this.fotoSelecionada = arquivo;
    }
  }

  executarCadastro(): void {
    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    // 1. Instancia o FormData necessário para o Multipart do Spring
    const formData = new FormData();

    // 2. Transfere todos os campos de texto do nosso objeto para o FormData
    Object.keys(this.formCadastro).forEach(key => {
      const valor = (this.formCadastro as any)[key];
      if (valor !== null && valor !== undefined) {
        formData.append(key, valor.toString());
      }
    });

    // 3. Adiciona o arquivo da foto se ele tiver sido selecionado
    if (this.fotoSelecionada) {
      formData.append('foto', this.fotoSelecionada, this.fotoSelecionada.name);
    }

    // 4. Dispara a requisição para a API (Spring Boot / Docker)
    this.clienteService.cadastrarCliente(formData).subscribe({
      next: (resposta) => {
        this.carregando = false;
        this.mensagemSucesso = 'Conta criada com sucesso! Redirecionando para o login...';
        this.cdr.detectChanges();
        // Espera 3 segundos para o usuário ler a mensagem de sucesso e manda para o login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = err.error || 'Ocorreu um erro ao tentar criar a conta.';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}
