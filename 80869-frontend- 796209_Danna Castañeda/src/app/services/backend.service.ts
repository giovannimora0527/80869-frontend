import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/**
 * Servicio para interactuar con el backend mediante peticiones HTTP.
 * Proporciona métodos genéricos para realizar operaciones GET, POST, PUT y envío de archivos.
 *
 * @remarks
 * Este servicio utiliza el token almacenado en localStorage para autenticar las peticiones.
 *
 * @example
 * backendService.get('http://localhost:8000/clinica', '', 'usuarios');
 */
export class BackendService {
  constructor(private http: HttpClient) {}

  /**
   * Construye los encabezados HTTP, incluyendo el token de autenticación si está disponible.
   */
  construirHeader() {
    const tokenRecuperado = localStorage.getItem('token');
    if (tokenRecuperado && tokenRecuperado !== '') {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        Authorization: `Bearer ${tokenRecuperado}`,
      });
    } else {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      });
    }
  }

  /**
   * Método GET genérico
   * @param urlApi URL base de la API (por ejemplo, http://localhost:8000/clinica)
   * @param endpoint Endpoint específico (puede estar vacío)
   * @param service Servicio o recurso (por ejemplo, 'usuarios')
   * @param routerParams Parámetros opcionales de la ruta
   * @returns Observable<T> respuesta del servidor
   */
  get<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    routerParams?: HttpParams
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });

    // ✅ Nueva lógica: si endpoint está vacío, no duplica las barras
    const finalUrl = endpoint
      ? `${urlApi}/${endpoint}/${service}`
      : `${urlApi}/${service}`;

    console.log('📡 Petición GET →', finalUrl); // (Depuración opcional)
    return this.http.get<T>(finalUrl, {
      params: routerParams,
      headers: headers,
      withCredentials: true,
    });
  }

  /**
   * Método genérico POST
   */
  post<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    data: any
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });

    const finalUrl = endpoint
      ? `${urlApi}/${endpoint}/${service}`
      : `${urlApi}/${service}`;

    return this.http.post<T>(finalUrl, data, {
      headers: headers,
      withCredentials: true,
    });
  }

  /**
   * Método genérico PUT
   */
  put<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    data: any
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });

    const finalUrl = endpoint
      ? `${urlApi}/${endpoint}/${service}`
      : `${urlApi}/${service}`;

    return this.http.put<T>(finalUrl, data, { headers: headers });
  }

  /**
   * Método POST para enviar archivos
   */
  postFile<T>(
    urlApi: string,
    endpoint: string,
    service: string,
    data: any
  ): Observable<T> {
    const tokenRecuperado = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      mimeType: 'multipart/form-data',
      Authorization: tokenRecuperado ? `Bearer ${tokenRecuperado}` : '',
    });

    const finalUrl = endpoint
      ? `${urlApi}/${endpoint}/${service}`
      : `${urlApi}/${service}`;

    return this.http.post<T>(finalUrl, data, {
      headers: headers,
      withCredentials: true,
    });
  }
}
