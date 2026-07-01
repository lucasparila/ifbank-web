import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContaPendenteDTO, PaginaDTO, PerfilGerenteCompletoDTO } from '../models/perfil.model';

export type StatusContaFiltro = 'PENDENTE' | 'ATIVA' | 'INATIVA' | 'REJEITADA';

@Injectable({
  providedIn: 'root',
})
export class GerenteService {
  private readonly API_URL = 'http://localhost:8080/api/gerente';

  constructor(private http: HttpClient) {}

  obterPerfilCompleto(idUsuario: number): Observable<PerfilGerenteCompletoDTO> {
    return this.http.get<PerfilGerenteCompletoDTO>(`${this.API_URL}/${idUsuario}`);
  }

  obterContasPorStatus(
    status: StatusContaFiltro,
    page: number = 0,
    size: number = 10
  ): Observable<PaginaDTO<ContaPendenteDTO>> {
    return this.http.get<PaginaDTO<ContaPendenteDTO>>(
      `${this.API_URL}/contas?status=${status}&page=${page}&size=${size}`
    );
  }

  aprovarConta(idConta: number): Observable<string> {
    return this.http.put(`${this.API_URL}/aprovar-conta/${idConta}`, {}, { responseType: 'text' });
  }

  reprovarConta(idConta: number): Observable<string> {
    return this.http.put(`${this.API_URL}/reprovar-conta/${idConta}`, {}, { responseType: 'text' });
  }
}