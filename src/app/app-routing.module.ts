import { InventarioMedicamentoComponent } from './demo/pages/inventario-medicamento/inventario-medicamento.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsuarioComponent } from './demo/pages/usuario/usuario.component';
import { MedicoComponent } from './demo/pages/medico/medico.component';
import { PacienteComponent } from './demo/pages/paciente/paciente.component';
import { CitaComponent } from './demo/pages/cita/cita.component';
import { MedicamentoComponent } from './demo/pages/medicamentos/medicamento.component';
import { EspecializacionComponent } from './demo/pages/especializacion/especializacion.component';
import { HistoriaMedicaComponent } from './demo/pages/historia-medica/historia-medica.component';
import { RecetasComponent } from './demo/pages/recetas/recetas.component';


export const routes: Routes = [
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
     { path: 'cita', component: CitaComponent, data: { title: 'Cita' }},
     { path: 'medicamentos', component: MedicamentoComponent, data: { title: 'Medicamentos' }},
     { path: 'especializacion', component: EspecializacionComponent, data: { title: 'Especializacion' }},
     { path: 'historia-medica', component: HistoriaMedicaComponent, data: { title: 'Historia Médica' }},
     { path: 'recetas', component: RecetasComponent, data: { title: 'Recetas' } }
  ,{ path: 'inventario-medicamentos', component: InventarioMedicamentoComponent, data: { title: 'Inventario Medicamentos' } }

    ]
  },
  { path: '**', redirectTo: 'inicio' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
