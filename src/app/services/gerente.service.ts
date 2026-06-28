import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContaPendenteDTO, PerfilGerenteCompletoDTO} from '../models/perfil.model';

@Injectable({
  providedIn: 'root',
})
export class GerenteService {
  private readonly API_URL = 'http://localhost:8080/api/gerente';

  constructor(private http: HttpClient) { }

  obterPerfilCompleto(idUsuario: number): Observable<PerfilGerenteCompletoDTO> {
    return this.http.get<PerfilGerenteCompletoDTO>(`${this.API_URL}/${idUsuario}`);
  }
  obterContasPendentes(): Observable<ContaPendenteDTO[]> {
    return this.http.get<ContaPendenteDTO[]>(`${this.API_URL}/contas-pendentes`);
  }

  aprovarConta(idConta: number): Observable<string> {
    return this.http.put(`${this.API_URL}/aprovar-conta/${idConta}`, {}, { responseType: 'text' });
  }

  reprovarConta(idConta: number): Observable<string> {
    return this.http.put(`${this.API_URL}/reprovar-conta/${idConta}`, {}, { responseType: 'text' });
  }
}
