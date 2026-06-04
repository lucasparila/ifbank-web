import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import { ClienteService } from '../../services/cliente.service';
import { Router } from '@angular/router';
import{RouterLink} from '@angular/router';
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
  ) { }

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
      }
    });
  }

  logout(): void {
    localStorage.removeItem('idUsuarioLogado');
    this.router.navigate(['/login']);
  } 
}
