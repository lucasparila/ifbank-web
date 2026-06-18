import { Injectable } from '@angular/core';
import { LoginResponseDTO, PerfilCompletoDTO } from '../models/perfil.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly API_URL = 'http://localhost:8080/api';
  constructor(private http: HttpClient) {}

  obterPerfilCompleto(idUsuario: number): Observable<PerfilCompletoDTO> {
    return this.http.get<PerfilCompletoDTO>(`${this.API_URL}/clientes/${idUsuario}`);
  }

  efetuarLogin(credenciais: { email: string, senha: string }): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(`${this.API_URL}/login`, credenciais);
  }

  cadastrarCliente(formData: FormData): Observable<string> {
    console.log(formData);
    console.log(`Enviando dados para cadastro: ${this.API_URL}/clientes`);
    return this.http.post(`${this.API_URL}/clientes`, formData, { responseType: 'text' });
  }

  atualizarPerfil(idUsuario: number, formData: FormData): Observable<PerfilCompletoDTO> {
    return this.http.put<PerfilCompletoDTO>(`${this.API_URL}/clientes/${idUsuario}`, formData);
  }

  esqueciSenha(email: string): Observable<string> {
    return this.http.post(`${this.API_URL}/auth/esqueci-senha`, { email }, { responseType: 'text' });
  }

  resetarSenha(token: string, novaSenha: string): Observable<string> {
    return this.http.post(`${this.API_URL}/auth/resetar-senha`, { token, novaSenha }, { responseType: 'text' });
  }
}
