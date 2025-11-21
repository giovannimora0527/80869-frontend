# 📚 Índice General - Documentación de Base de Datos

## 🎯 Sistema de Gestión Clínica - Módulo de Auditoría y Seguridad

**Fecha:** 2025-11-19  
**Versión:** 1.0  
**Base de Datos:** MySQL 8.0+  
**Proyecto:** Examen Final - Programación Web

---

## 📑 Contenido de la Documentación

### 🚀 Inicio Rápido

1. **[INSTRUCCIONES_USO.md](./INSTRUCCIONES_USO.md)** ⭐ **EMPEZAR AQUÍ**
   - Instalación en 5 minutos
   - Checklist post-instalación
   - Comandos de verificación
   - Troubleshooting básico
   - Próximos pasos

---

### 📜 Scripts SQL

2. **[migration_parcial.sql](./migration_parcial.sql)** 🔧 **SCRIPT PRINCIPAL**
   - Migración completa de base de datos
   - Creación de tablas nuevas:
     - `auditoria_log`
     - `password_reset_token`
     - `password_temporal`
     - `sistema_configuracion`
   - Modificación de tabla `usuario`
   - Procedimientos almacenados (4)
   - Vistas (2)
   - Triggers automáticos (1)
   - Datos de configuración iniciales
   - **Ejecutar primero**

3. **[consultas_utiles.sql](./consultas_utiles.sql)** 📊 **CONSULTAS DE REFERENCIA**
   - 100+ consultas SQL útiles
   - Consultas de auditoría
   - Consultas de seguridad y bloqueos
   - Consultas de recuperación de contraseña
   - Estadísticas y reportes
   - Operaciones de mantenimiento
   - Consultas para endpoints del frontend
   - **Para desarrollo y debugging**

4. **[test_funcionalidad.sql](./test_funcionalidad.sql)** ✅ **SUITE DE PRUEBAS**
   - 15 tests automatizados
   - Verificación de instalación
   - Test de control de intentos fallidos
   - Test de login exitoso
   - Test de recuperación de contraseña
   - Test de vistas y triggers
   - **Ejecutar después de la migración**

---

### 📖 Documentación Detallada

5. **[README_DATABASE.md](./README_DATABASE.md)** 📘 **DOCUMENTACIÓN COMPLETA**
   - Descripción general del sistema
   - Estructura detallada de todas las tablas:
     - `usuario` (modificaciones)
     - `auditoria_log` (nueva)
     - `password_reset_token` (nueva)
     - `password_temporal` (nueva)
     - `sistema_configuracion` (nueva)
   - Procedimientos almacenados:
     - `sp_registrar_intento_fallido`
     - `sp_registrar_login_exitoso`
     - `sp_verificar_bloqueo_usuario`
     - `sp_limpiar_logs_antiguos`
   - Vistas útiles:
     - `v_auditoria_detalle`
     - `v_usuarios_bloqueados`
   - Triggers:
     - `trg_usuario_after_update`
   - Flujos de negocio
   - Consultas de monitoreo
   - Mantenimiento
   - **Referencia completa**

6. **[DIAGRAMA_BD.md](./DIAGRAMA_BD.md)** 📊 **DIAGRAMAS Y MODELADO**
   - Diagrama Entidad-Relación (ASCII art)
   - Modelo de datos completo
   - Relaciones y Foreign Keys
   - Flujo de login con control de intentos
   - Flujo de recuperación de contraseña
   - Índices de base de datos
   - Tipos de datos JSON
   - Convenciones de nomenclatura
   - Estimación de volumen de datos
   - **Para documentación del parcial**

---

### 💻 Guías de Integración

7. **[INTEGRACION_BACKEND.md](./INTEGRACION_BACKEND.md)** ☕ **CÓDIGO JAVA/SPRING BOOT**
   - Modelos (Entities):
     - `Usuario.java`
     - `AuditoriaLog.java`
     - `PasswordResetToken.java`
     - `PasswordTemporal.java`
   - Servicios:
     - `AuthService.java`
     - `PasswordRecoveryService.java`
     - `AuditoriaService.java`
   - Controladores REST:
     - `AuthController.java`
     - `PasswordRecoveryController.java`
     - `AuditoriaController.java`
   - DTOs y configuración
   - **Para IntelliJ IDEA / Spring Boot**

---

## 🎓 Requerimientos del Parcial Implementados

### ✅ 1. Recuperación de Contraseña (20 puntos)

**Archivos relevantes:**
- `migration_parcial.sql` → Tablas `password_reset_token`, `password_temporal`
- `README_DATABASE.md` → Sección de recuperación de contraseña
- `DIAGRAMA_BD.md` → Flujo de recuperación
- `INTEGRACION_BACKEND.md` → `PasswordRecoveryService.java`

**Características:**
- ✅ Tabla para tokens de recuperación
- ✅ Tabla para contraseñas temporales
- ✅ Logs de auditoría para usuarios inexistentes
- ✅ No se muestran mensajes de error explícitos
- ✅ Envío de contraseña temporal por email
- ✅ Registro de fecha, hora y descripción del error

---

### ✅ 2. Control de Intentos de Login (25 puntos)

**Archivos relevantes:**
- `migration_parcial.sql` → Modificaciones en `usuario`, procedimientos
- `consultas_utiles.sql` → Consultas de bloqueos
- `test_funcionalidad.sql` → Tests de bloqueo
- `INTEGRACION_BACKEND.md` → `AuthService.java`

**Características:**
- ✅ Campo `intentos_fallidos` en usuario
- ✅ Campo `bloqueado_hasta` con timestamp
- ✅ Campo `ip_ultimo_acceso` para trazabilidad
- ✅ Bloqueo automático después de 3 intentos
- ✅ Tiempo de bloqueo parametrizable (5 minutos)
- ✅ Procedimientos almacenados para automatización
- ✅ Logs completos de auditoría

---

### ✅ 3. Documentación y Modelado (20 puntos)

**Archivos relevantes:**
- `README_DATABASE.md` → Documentación completa
- `DIAGRAMA_BD.md` → Diagramas UML/ER
- Todos los archivos `.sql` → Comentarios técnicos

**Incluye:**
- ✅ Código SQL documentado con comentarios
- ✅ Diagrama de clases (Entidad-Relación)
- ✅ Diagrama de flujos de proceso
- ✅ Arquitectura del sistema
- ✅ Más de 5 páginas de documentación

---

### ✅ 4. Docker y Despliegue (15 puntos)

**Nota:** Los scripts de BD están listos para contenedores.

Ejemplo de Dockerfile para MySQL:
```dockerfile
FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=clinica

COPY migration_parcial.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
```

---

### ✅ 5. Visualización de Logs (20 puntos)

**Archivos relevantes:**
- `migration_parcial.sql` → Tabla `auditoria_log`, vistas
- `consultas_utiles.sql` → Sección 7 (consultas para frontend)
- `INTEGRACION_BACKEND.md` → `AuditoriaController.java`

**Características:**
- ✅ Tabla `auditoria_log` con paginación
- ✅ Vista `v_auditoria_detalle` optimizada
- ✅ Filtros por fecha, usuario, tipo de evento
- ✅ Índices para búsquedas rápidas
- ✅ Endpoints REST documentados

**Ejemplo de endpoint:**
```
GET /api/auditoria/logs?page=0&size=10&fechaDesde=2025-11-01&tipoEvento=LOGIN_FALLIDO
```

---

## 🗺️ Guía de Navegación por Tarea

### Si necesitas...

#### **Instalar la base de datos:**
1. `INSTRUCCIONES_USO.md` → Sección "Instalación Rápida"
2. Ejecutar `migration_parcial.sql`
3. Ejecutar `test_funcionalidad.sql`

#### **Implementar recuperación de contraseña:**
1. `README_DATABASE.md` → Sección "Recuperación de Contraseña"
2. `DIAGRAMA_BD.md` → Flujo de recuperación
3. `INTEGRACION_BACKEND.md` → `PasswordRecoveryService.java`
4. Implementar endpoint en backend
5. Crear componente en Angular

#### **Implementar control de intentos:**
1. `README_DATABASE.md` → Sección "Control de Intentos"
2. `test_funcionalidad.sql` → Tests de bloqueo
3. `INTEGRACION_BACKEND.md` → `AuthService.java`
4. Modificar servicio de login

#### **Crear vista de auditoría en Angular:**
1. `consultas_utiles.sql` → Sección 7 (endpoints)
2. `INTEGRACION_BACKEND.md` → `AuditoriaController.java`
3. Implementar servicio en Angular
4. Crear componente con tabla y filtros

#### **Documentar para el parcial:**
1. `README_DATABASE.md` → Documentación completa
2. `DIAGRAMA_BD.md` → Diagramas UML/ER
3. Generar PDF con ambos archivos
4. Agregar capturas de pantalla

#### **Consultar ejemplos SQL:**
1. `consultas_utiles.sql` → 100+ consultas organizadas
2. Copiar y adaptar según necesites

---

## 📊 Estructura de Archivos

```
database/
│
├── 📄 INDEX.md                          ← ESTE ARCHIVO
│
├── 🚀 INSTRUCCIONES_USO.md              ← EMPEZAR AQUÍ
│
├── 📘 README_DATABASE.md                ← Documentación completa
│
├── 📊 DIAGRAMA_BD.md                    ← Diagramas y modelado
│
├── ☕ INTEGRACION_BACKEND.md            ← Código Java/Spring
│
├── 🔧 migration_parcial.sql             ← Script principal (EJECUTAR PRIMERO)
│
├── 📊 consultas_utiles.sql              ← Consultas de referencia
│
└── ✅ test_funcionalidad.sql            ← Tests (EJECUTAR DESPUÉS)
```

---

## ⚡ Flujo de Trabajo Recomendado

### Fase 1: Setup (30 minutos)
1. ✅ Leer `INSTRUCCIONES_USO.md`
2. ✅ Hacer backup de BD actual
3. ✅ Ejecutar `migration_parcial.sql`
4. ✅ Ejecutar `test_funcionalidad.sql`
5. ✅ Verificar que todos los tests pasen

### Fase 2: Backend (2-3 horas)
1. ✅ Revisar `INTEGRACION_BACKEND.md`
2. ✅ Copiar modelos (Entities)
3. ✅ Implementar servicios
4. ✅ Crear controladores REST
5. ✅ Probar endpoints con Postman

### Fase 3: Frontend Angular (2-3 horas)
1. ✅ Crear servicio de autenticación
2. ✅ Modificar componente de login
3. ✅ Crear componente de recuperación
4. ✅ Crear componente de auditoría (tabla con filtros)
5. ✅ Probar flujos completos

### Fase 4: Documentación (1-2 horas)
1. ✅ Copiar `README_DATABASE.md` y `DIAGRAMA_BD.md` a Word/PDF
2. ✅ Agregar capturas de pantalla
3. ✅ Documentar Swagger/OpenAPI
4. ✅ Crear diagramas adicionales si es necesario

### Fase 5: Docker (1 hora)
1. ✅ Crear Dockerfile
2. ✅ Build de imagen
3. ✅ Ejecutar contenedor
4. ✅ Probar funcionamiento

---

## 🎯 Checklist Final para Entregar

### Base de Datos
- [ ] `migration_parcial.sql` ejecutado exitosamente
- [ ] Todos los tests pasando (`test_funcionalidad.sql`)
- [ ] Usuarios de prueba con emails configurados
- [ ] Configuración del sistema verificada

### Backend
- [ ] Endpoints de login funcionando
- [ ] Control de intentos implementado
- [ ] Recuperación de contraseña funcionando
- [ ] Endpoint de auditoría con filtros
- [ ] Swagger/OpenAPI documentado

### Frontend Angular
- [ ] Login con manejo de errores
- [ ] Recuperación de contraseña
- [ ] Vista de auditoría con tabla
- [ ] Filtros por fecha, usuario, tipo
- [ ] Paginación funcionando
- [ ] SweetAlert2 para mensajes

### Documentación
- [ ] Documento de 5+ páginas
- [ ] Diagramas UML incluidos
- [ ] Capturas de pantalla
- [ ] Análisis de arquitectura
- [ ] Swagger/OpenAPI

### Docker
- [ ] Dockerfile creado
- [ ] Imagen construida
- [ ] Contenedor funcionando
- [ ] Comandos documentados

### Entrega
- [ ] Código en .zip
- [ ] Commit con mensaje descriptivo
- [ ] Push al branch `codigo_nombre`
- [ ] Documentación en PDF

---

## 📞 Soporte y Referencias

### Consultar por tema:

- **Instalación:** `INSTRUCCIONES_USO.md`
- **Tablas:** `README_DATABASE.md`
- **Consultas SQL:** `consultas_utiles.sql`
- **Diagramas:** `DIAGRAMA_BD.md`
- **Código Java:** `INTEGRACION_BACKEND.md`
- **Tests:** `test_funcionalidad.sql`

### Troubleshooting rápido:

```sql
-- Verificar instalación
USE clinica;
SHOW TABLES;

-- Ver configuración
SELECT * FROM sistema_configuracion;

-- Ver últimos logs
SELECT * FROM v_auditoria_detalle LIMIT 10;

-- Desbloquear usuario
UPDATE usuario SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE username = 'usuario1';
```

---

## 🎓 Rúbrica del Parcial

| Requerimiento | Puntos | Archivos Relevantes |
|---------------|--------|---------------------|
| Recuperación de Contraseña | 20 | `migration_parcial.sql`, `README_DATABASE.md` |
| Control de Intentos | 25 | `test_funcionalidad.sql`, `INTEGRACION_BACKEND.md` |
| Documentación y Modelado | 20 | `README_DATABASE.md`, `DIAGRAMA_BD.md` |
| Docker y Despliegue | 15 | Scripts listos para Docker |
| Visualización de Logs | 20 | `consultas_utiles.sql`, `INTEGRACION_BACKEND.md` |
| **TOTAL** | **100** | |

---

## ✨ Características Destacadas

### Seguridad
- ✅ No revela existencia de usuarios
- ✅ Bloqueo automático por intentos
- ✅ Contraseñas hasheadas
- ✅ Tokens con expiración
- ✅ Auditoría completa de eventos

### Rendimiento
- ✅ Índices optimizados
- ✅ Paginación en consultas
- ✅ Vistas preconfiguradas
- ✅ Procedimientos almacenados

### Mantenibilidad
- ✅ Código bien documentado
- ✅ Configuración parametrizable
- ✅ Limpieza automática de logs
- ✅ Convenciones consistentes

### Escalabilidad
- ✅ Preparado para Docker
- ✅ Soporte para balanceadores (IP tracking)
- ✅ Particionamiento opcional
- ✅ Retención configurable

---

## 🏆 Conclusión

Este paquete de documentación proporciona todo lo necesario para:

1. ✅ **Implementar** el módulo de auditoría y seguridad
2. ✅ **Documentar** el sistema completo
3. ✅ **Integrar** con backend y frontend
4. ✅ **Desplegar** con Docker
5. ✅ **Aprobar** el examen final

**¡Todo listo para usar!** 🚀

---

**Última actualización:** 2025-11-19  
**Versión:** 1.0  
**Autor:** Sistema de Gestión Clínica  
**Licencia:** MIT
