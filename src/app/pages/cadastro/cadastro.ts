import { Component, ChangeDetectorRef } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {

  formCadastro = {
    nome: '',
    dataNascimento: '',
    email: '',
    senha: '',
    senhaConfirmacao: '',
    cpf: '',
    logradouro: '',
    numero: '' as string,
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    codPais: 55,
    codArea: '' as string,
    numeroTelefone: '' as string,
  };

  fotoSelecionada: File | null = null;
  carregando: boolean = false;
  buscandoCep: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ─── MÁSCARAS ────────────────────────────────────────────────

  aplicarMascaraCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
    input.value = v;
    this.formCadastro.cpf = v;
  }

  aplicarMascaraCep(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    input.value = v;
    this.formCadastro.cep = v;
    if (v.replace('-', '').length === 8) {
      this.buscarCep(v);
    }
  }

  aplicarMascaraData(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 4) v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
    input.value = v;
    this.formCadastro.dataNascimento = v;
  }

  aplicarMascaraTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 9);
    if (digits.length > 5) digits = digits.replace(/^(\d{5})(\d{0,4})/, '$1-$2');
    input.value = digits;
    this.formCadastro.numeroTelefone = digits;
  }

  aplicarMascaraDdd(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 2);
    input.value = v;
    this.formCadastro.codArea = v;
  }

  aplicarUppercaseUf(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 2);
    this.formCadastro.estado = input.value;
  }

  // ─── VIA CEP ─────────────────────────────────────────────────

  buscarCep(cep: string): void {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    this.buscandoCep = true;
    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .then(r => r.json())
      .then(data => {
        if (!data.erro) {
          this.formCadastro.logradouro = data.logradouro || '';
          this.formCadastro.bairro = data.bairro || '';
          this.formCadastro.cidade = data.localidade || '';
          this.formCadastro.estado = data.uf || '';
        }
        this.buscandoCep = false;
        this.cdr.detectChanges();
      })
      .catch(() => { this.buscandoCep = false; });
  }

  // ─── ARQUIVO ─────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (arquivo) {
      if (arquivo.size > 5 * 1024 * 1024) {
        this.mensagemErro = 'A foto deve ter no máximo 5MB.';
        return;
      }
      this.fotoSelecionada = arquivo;
    }
  }

  // ─── VALIDAÇÕES ──────────────────────────────────────────────

  private validarCpf(cpf: string): boolean {
    const c = cpf.replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += +c[i] * (10 - i);
    let r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== +c[9]) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += +c[i] * (11 - i);
    r = (soma * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === +c[10];
  }

  private validarData(data: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
    const [dia, mes, ano] = data.split('/').map(Number);
    const d = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    if (d > hoje) return false;
    if (ano < 1900 || ano > hoje.getFullYear()) return false;
    return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
  }

  private validarEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validarFormulario(): string | null {
    const f = this.formCadastro;
    if (!f.nome.trim()) return 'Informe o nome completo.';
    if (!this.validarCpf(f.cpf)) return 'CPF inválido.';
    if (!this.validarEmail(f.email)) return 'E-mail inválido.';
    if (f.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (f.senha !== f.senhaConfirmacao) return 'As senhas não coincidem.';
    if (!this.validarData(f.dataNascimento)) return 'Data de nascimento inválida.';
    if (!f.codArea || f.codArea.length < 2) return 'Informe o DDD.';
    if (!f.numeroTelefone || f.numeroTelefone.replace(/\D/g, '').length < 8) return 'Número de telefone inválido.';
    if (!f.cep || f.cep.replace(/\D/g, '').length !== 8) return 'CEP inválido.';
    if (!f.logradouro.trim()) return 'Informe o logradouro.';
    if (!f.numero.toString().trim()) return 'Informe o número do endereço.';
    if (!f.bairro.trim()) return 'Informe o bairro.';
    if (!f.cidade.trim()) return 'Informe a cidade.';
    if (!f.estado || f.estado.length !== 2) return 'Informe a UF (2 letras).';
    return null;
  }

  // ─── SUBMIT ──────────────────────────────────────────────────

  executarCadastro(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const erroValidacao = this.validarFormulario();
    if (erroValidacao) {
      this.mensagemErro = erroValidacao;
      return;
    }

    this.carregando = true;

    const formData = new FormData();

    // Campos simples (exclui senhaConfirmacao que não vai para API)
    const { senhaConfirmacao, ...dadosApi } = this.formCadastro;

    // Converte data de dd/mm/aaaa para aaaa-mm-dd (formato ISO para o backend)
    const [dia, mes, ano] = dadosApi.dataNascimento.split('/');
    dadosApi.dataNascimento = `${ano}-${mes}-${dia}`;

    // Limpa máscaras nos campos que vão para o backend
    const cpfLimpo = dadosApi.cpf.replace(/\D/g, '');
    const cepLimpo = dadosApi.cep.replace(/\D/g, '');
    const telefoneLimpo = dadosApi.numeroTelefone.replace(/\D/g, '');

    Object.keys(dadosApi).forEach(key => {
      let valor = (dadosApi as any)[key];
      if (key === 'cpf') valor = cpfLimpo;
      if (key === 'cep') valor = cepLimpo;
      if (key === 'numeroTelefone') valor = telefoneLimpo;
      if (valor !== null && valor !== undefined && valor !== '') {
        formData.append(key, valor.toString());
      }
    });

    if (this.fotoSelecionada) {
      formData.append('foto', this.fotoSelecionada, this.fotoSelecionada.name);
    }

    this.clienteService.cadastrarCliente(formData).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagemSucesso = 'Conta criada com sucesso! Redirecionando para o login...';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.carregando = false;
        this.mensagemErro = err?.error?.message || err?.error || 'Ocorreu um erro ao criar a conta. Tente novamente.';
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }
}