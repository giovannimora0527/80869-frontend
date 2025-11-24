import packageInfo from '../../package.json';

export const environment = {
  production: false,
  appVersion: '1.0.0',
  // 👇 agrega esta línea
  apiUrl: 'http://localhost:8000/clinica/v1'
};

/*export const environment = {
  appVersion: packageInfo.version,
  production: false,  
  apiUrl: 'http://localhost:8000/clinica/v1'
};**/
