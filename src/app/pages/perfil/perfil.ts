import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { PerfilCompletoDTO } from '../../models/perfil.model';
import { ClienteService } from '../../services/cliente.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-perfil',
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  perfil!: PerfilCompletoDTO;
  carregando = true;
  erroMensagem = '';

  constructor(private clienteService: ClienteService,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef
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
      this.changeDetectorRef.detectChanges(); 

      console.log('Perfil atribuído:', this.perfil);
      console.log('Carregando:', this.carregando);
    },
    error: (err) => {
      this.erroMensagem = 'Não foi possível carregar os dados do perfil.';
      this.carregando = false;
      this.changeDetectorRef.detectChanges(); 
      console.error(err);
    }
  });

  }
}