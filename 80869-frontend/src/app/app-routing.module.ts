import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MedicoComponent } from './demo/pages/medico/medico.component';
import { PacienteComponent } from './demo/pages/paciente/paciente.component';
import { CitasComponent } from './demo/pages/citas/citas.component';
import { RecetasComponent } from './demo/pages/recetas/recetas.component'; 
import { MedicamentosComponent } from './demo/pages/medicamentos/medicamentos.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';


export const routes: Routes = [ // Exportar las rutas
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: AdminComponent,
    data: { title: 'Inicio' },
    children: [
      { path: 'usuario', component: UsuarioComponent, data: { title: 'Usuario' }},
      { path: 'medico', component: MedicoComponent, data: { title: 'Medico' }},
      { path: 'paciente', component: PacienteComponent, data: { title: 'Paciente' }},
      { path: 'citas', component: CitasComponent, data: { title: 'Citas' }},
      { path: 'recetas', component: RecetasComponent, data: { title: 'Recetas' }},
      { path: 'medicamentos', component: MedicamentosComponent, data: { title: 'Medicamentos' }},
      { path: 'especializacion', component: EspecializacionComponent, data: { title: 'Especializaciones' }}
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}