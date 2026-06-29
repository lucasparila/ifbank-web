import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import { ClienteService } from '../../services/cliente.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  perfil!: PerfilCompletoDTO;
  carregando = true;
  erroMensagem = '';
  modoEdicao = false;
  salvando = false;
  sucessoMensagem = '';
  fotoSelecionada: File | null = null;
  form!: FormGroup;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const idSessao = localStorage.getItem('idUsuarioLogado');
    if (!idSessao) {
      this.router.navigate(['/login']);
      return;
    }

    const idUsuarioLogado = Number(idSessao);
    this.clienteService.obterPerfilCompleto(idUsuarioLogado).subscribe({
      next: (dados) => {
        this.perfil = dados;
        this.carregando = false;
        this.iniciarForm();
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.erroMensagem = 'Não foi possível carregar os dados do perfil.';
        this.carregando = false;
        this.changeDetectorRef.detectChanges();
        console.error(err);
      }
    });
  }

  iniciarForm(): void {
    this.form = this.fb.group({
      nome: [this.perfil.cliente.nome],
      dataNascimento: [this.perfil.cliente.dataNascimento],
      logradouro: [this.perfil.cliente.endereco?.logradouro],
      numero: [this.perfil.cliente.endereco?.numero],
      complemento: [this.perfil.cliente.endereco?.complemento],
      bairro: [this.perfil.cliente.endereco?.bairro],
      cidade: [this.perfil.cliente.endereco?.cidade],
      estado: [this.perfil.cliente.endereco?.estado],
      cep: [this.perfil.cliente.endereco?.cep],
      codPais: [this.perfil.cliente.telefone?.codPais],
      codArea: [this.perfil.cliente.telefone?.codArea],
      numeroTelefone: [this.perfil.cliente.telefone?.numero],
    });
  }

  toggleEdicao(): void {
    this.modoEdicao = !this.modoEdicao;
    this.sucessoMensagem = '';
    this.erroMensagem = '';
    if (this.modoEdicao) this.iniciarForm();
  }

  onFotoSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fotoSelecionada = input.files[0];
    }
  }

  get fotoUrlCompleta(): string {
    const foto = this.perfil?.cliente?.fotoUrl;
    if (!foto) {
      return 'avatar-padrao.svg';
    }
    return foto.startsWith('http') ? foto : 'http://localhost:8080' + foto;
  }

  onImagemErro(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'avatar-padrao.svg';
  }

  salvar(): void {
    const idSessao = localStorage.getItem('idUsuarioLogado');
    if (!idSessao) return;

    const formData = new FormData();
    const valores = this.form.value;

    if (valores.nome) formData.append('nome', valores.nome);
    if (valores.dataNascimento) formData.append('dataNascimento', valores.dataNascimento);
    if (valores.logradouro) formData.append('logradouro', valores.logradouro);
    if (valores.numero) formData.append('numero', valores.numero);
    if (valores.complemento) formData.append('complemento', valores.complemento);
    if (valores.bairro) formData.append('bairro', valores.bairro);
    if (valores.cidade) formData.append('cidade', valores.cidade);
    if (valores.estado) formData.append('estado', valores.estado);
    if (valores.cep) formData.append('cep', valores.cep);
    if (valores.codPais) formData.append('codPais', valores.codPais);
    if (valores.codArea) formData.append('codArea', valores.codArea);
    if (valores.numeroTelefone) formData.append('numeroTelefone', valores.numeroTelefone);
    if (this.fotoSelecionada) formData.append('foto', this.fotoSelecionada);

    this.salvando = true;
    this.clienteService.atualizarPerfil(Number(idSessao), formData).subscribe({
      next: (perfilAtualizado) => {
        this.perfil = perfilAtualizado;
        this.salvando = false;
        this.modoEdicao = false;
        this.sucessoMensagem = 'Dados atualizados com sucesso!';
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.erroMensagem = 'Erro ao salvar os dados.';
        this.salvando = false;
        console.error(err);
      }
    });
  }
}