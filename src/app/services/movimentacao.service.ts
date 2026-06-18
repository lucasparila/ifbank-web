import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MovimentacaoRequestDTO,
  MovimentacaoResponseDTO,
  TransferenciaRequestDTO,
} from '../models/movimentacao.model';

@Injectable({
  providedIn: 'root',
})
export class MovimentacaoService {
  private readonly API_URL = 'http://localhost:8080/api/movimentacoes';

  constructor(private http: HttpClient) {}

  depositar(dados: MovimentacaoRequestDTO): Observable<MovimentacaoResponseDTO> {
    return this.http.post<MovimentacaoResponseDTO>(`${this.API_URL}/deposito`, dados);
  }

  sacar(dados: MovimentacaoRequestDTO): Observable<MovimentacaoResponseDTO> {
    return this.http.post<MovimentacaoResponseDTO>(`${this.API_URL}/saque`, dados);
  }

  transferir(dados: TransferenciaRequestDTO): Observable<MovimentacaoResponseDTO> {
    return this.http.post<MovimentacaoResponseDTO>(`${this.API_URL}/transferencia`, dados);
  }

  listarPorConta(idConta: number): Observable<MovimentacaoResponseDTO[]> {
    return this.http.get<MovimentacaoResponseDTO[]>(`${this.API_URL}/${idConta}`);
  }
}