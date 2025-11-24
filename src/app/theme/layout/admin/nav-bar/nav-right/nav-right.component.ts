// angular import
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

// third-party
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  // inyección de router usando la API inject
  private router = inject(Router);

  // constructor
  constructor() {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  logout(): void {
    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Está seguro que desea cerrar la sesión actual?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar token (y cualquier otra info de sesión que quieras)
        localStorage.removeItem('token');
        // Si en el futuro guardas más cosas de sesión, podrías usar:
        // localStorage.clear();

        // Redirigir al login
        this.router.navigate(['/login']);
      }
    });
  }
}
