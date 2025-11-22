import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http';


@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    // Log mínimo: confirmar existencia del token en storage (no imprimir token)
    try {
      console.log('HeadersInterceptor: token present=', !!token);
    } catch (e) {
      // ignore
    }
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const clonedRequest = req.clone({ setHeaders: headers });
    return next.handle(clonedRequest);
  }

  addHeaders(request: HttpRequest<unknown>): HttpRequest<any> {
    return (request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    }));
  }
}