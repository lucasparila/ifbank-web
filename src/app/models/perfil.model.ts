export interface EnderecoDTO {
  logradouro: string;
  numero: number;
  complemento?: string; 
  bairro: string;
  cidade: string; 
  estado: string;
  cep: string;
}

export interface TelefoneDTO {
  codPais: number;
  codArea: number;
  numero: number;
}

export interface ClienteDTO {
  id: number;
  nome: string;
  dataNascimento: string; 
  dataCadastro: string;
  fotoUrl?: string;
  endereco?: EnderecoDTO;
  telefone?: TelefoneDTO;
}

export interface GerenteDTO{
  id: number;
  nome: string;
  dataNascimento: string;
}

export interface ContaDTO {
  idConta: number;
  numeroConta: string;
  saldo: number;
  dataAbertura: string;
  idStatusConta: number;
}

export interface PerfilCompletoDTO {
  idUsuario: number;
  email: string;
  cpf: string;
  perfil: string;
  cliente: ClienteDTO;
  conta?: ContaDTO;
}

export interface PerfilGerenteCompletoDTO {
  idUsuario: number;
  email: string;
  cpf: string;
  perfil: string;
  gerente: GerenteDTO;
}

export type ContaPendenteDTO = PerfilCompletoDTO;

export interface LoginResponseDTO{
    idUsuario: number;
    email: string;
    cpf: string;
    perfil: string;
}