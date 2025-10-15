export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Inicio',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'usuario',
        title: 'Gestión de Usuarios',
        type: 'item',
        url: '/inicio/usuario',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'medico',
        title: 'Gestión de Medicos',
        type: 'item',
        url: '/inicio/medico',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
        id: 'paciente',
        title: 'Gestión de Pacientes',
        type: 'item',
        url: '/inicio/paciente',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
        id: 'medicamento',
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamento',
        icon: 'feather icon-package',
        classes: 'nav-item'
      },
      {
        id: 'cita',
        title: 'Gestión de Citas',
        type: 'item',
        url: '/inicio/cita',
        icon: 'feather icon-calendar',
        classes: 'nav-item'
      },
      {
        id: 'receta',
        title: 'Fórmulas Médicas',
        type: 'item',
        url: '/inicio/receta',
        icon: 'feather icon-file-text',
        classes: 'nav-item'
      },
      {
        id: 'historia',
        title: 'Historias Médicas',
        type: 'item',
        url: '/inicio/historia',
        icon: 'feather icon-folder',
        classes: 'nav-item'
      },
      {
        id: 'especializacion',
        title: 'Especialidades Médicas',
        type: 'item',
        url: '/inicio/especializacion',
        icon: 'feather icon-award',
        classes: 'nav-item'
      }
    ]
  },
  /* ---------- Nuevos menus aqui -------------  */
];
