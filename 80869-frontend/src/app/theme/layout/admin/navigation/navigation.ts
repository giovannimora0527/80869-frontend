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
        icon: 'feather icon-user-check',
        classes: 'nav-item'
      },
      {
        id: 'citas',
        title: 'Gestión de Citas',
        type: 'item',
        url: '/inicio/citas',
        icon: 'feather icon-calendar',
        classes: 'nav-item'
      },
      {
        id: 'recetas',
        title: 'Gestión de Recetas',
        type: 'item',
        url: '/inicio/recetas',
        icon: 'feather icon-file-text',
        classes: 'nav-item'
      },
      {
        id: 'medicamentos',
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        icon: 'feather icon-file-text',
        classes: 'nav-item'
      }
    ,
 {
        id: 'especializacion', 
        title: 'Gestión de Especializaciones',
        type: 'item',
        url: '/inicio/especializacion',
        icon: 'feather icon-package', 
        classes: 'nav-item'
      },
       {
        id: 'HC', 
        title: 'Gestión de Historia Clínica',
        type: 'item',
        url: '/inicio/historia-clinica',
        icon: 'feather icon-package', 
        classes: 'nav-item'
      }

      
    ]
  },

];