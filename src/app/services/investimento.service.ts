import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InvestimentoDTO,
  AplicarInvestimentoDTO,
  ResgateDTO,
  ResumoInvestimentoDTO,
  TipoInvestimentoDTO,
} from '../models/investimento.model';

@Injectable({
  providedIn: 'root',
})
export class InvestimentoService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  listarTipos(): Observable<TipoInvestimentoDTO[]> {
    return this.http.get<TipoInvestimentoDTO[]>(`${this.API_URL}/investimentos/tipos`);
  }

  listarInvestimentos(idConta: number): Observable<InvestimentoDTO[]> {
    return this.http.get<InvestimentoDTO[]>(`${this.API_URL}/investimentos/${idConta}`);
  }

  obterResumo(idConta: number): Observable<ResumoInvestimentoDTO> {
    return this.http.get<ResumoInvestimentoDTO>(`${this.API_URL}/investimentos/${idConta}/resumo`);
  }

  aplicarInvestimento(dados: AplicarInvestimentoDTO): Observable<InvestimentoDTO> {
    return this.http.post<InvestimentoDTO>(`${this.API_URL}/investimentos/aplicar`, dados);
  }

  resgatar(dados: ResgateDTO): Observable<string> {
    return this.http.post(
      `${this.API_URL}/investimentos/resgatar/${dados.id}`,
      { idConta: dados.idConta },
      { responseType: 'text' }
    );
  }
}