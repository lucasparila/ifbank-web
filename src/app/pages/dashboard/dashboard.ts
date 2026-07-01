import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import { ClienteService } from '../../services/cliente.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  perfil!: PerfilCompletoDTO;
  carregando: boolean = true;
  erroMensagem: string = '';

  constructor(
    private clienteService: ClienteService,
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
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.erroMensagem = 'Erro ao carregar os dados da sua conta bancária.';
        this.carregando = false;
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }

  get fotoUrlCompleta(): string {
    const foto = this.perfil?.cliente?.fotoUrl;
    if (!foto) {
      return 'avatar-padrao.svg';
    }
    // URL absoluta (ex: pravatar.cc, usada nos clientes de teste) -> usa direto.
    // Caminho relativo (ex: upload feito pelo próprio back-end) -> concatena o host.
    return foto.startsWith('http') ? foto : 'http://localhost:8080' + foto;
  }

  onImagemErro(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'avatar-padrao.svg';
  }

  logout(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']);
  }
}