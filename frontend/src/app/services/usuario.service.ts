import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.interface';

@Service()
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/usuarios`;

  listar() {
    return this.http.get<Usuario[]>(this.API_URL);
  }

  obtener(id: number) {
    return this.http.get<Usuario>(`${this.API_URL}/${id}`);
  }

  perfil() {
    return this.http.get<Usuario>(`${this.API_URL}/me`);
  }
}
