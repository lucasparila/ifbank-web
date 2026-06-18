// NOVO ARQUIVO: src/app/services/extrato.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovimentacaoPageDTO, ExtratoFiltros } from '../models/extrato.model';

@Injectable({
  providedIn: 'root',
})
export class ExtratoService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  buscarExtrato(
    idConta: number,
    pagina: number = 0,
    tamanho: number = 10,
    filtros: Partial<ExtratoFiltros> = {}
  ): Observable<MovimentacaoPageDTO> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamanho', tamanho.toString())
      .set('ordenacao', filtros.ordenacao ?? 'dataMovimento')
      .set('direcao', filtros.direcao ?? 'DESC');

    if (filtros.nome && filtros.nome.trim() !== '') {
      params = params.set('nome', filtros.nome.trim());
    }
    if (filtros.valor != null) {
      params = params.set('valor', filtros.valor.toString());
    }

    return this.http.get<MovimentacaoPageDTO>(
      `${this.API_URL}/movimentacoes/${idConta}/extrato`,
      { params }
    );
  }
}