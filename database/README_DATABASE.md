# Documentación de Base de Datos - Sistema Clínica

## 📋 Descripción General

Este documento describe las modificaciones realizadas a la base de datos MySQL para implementar los requerimientos del examen final de Programación Web, incluyendo funcionalidades de auditoría, seguridad y recuperación de contraseña.

---

## 🚀 Instrucciones de Instalación

### Paso 1: Ejecutar el Script de Migración

```bash
# Opción 1: Desde MySQL Workbench
# - Abrir MySQL Workbench
# - Conectarse a tu servidor MySQL local
# - Abrir el archivo migration_parcial.sql
# - Ejecutar todo el script (Ctrl + Shift + Enter)

# Opción 2: Desde línea de comandos
mysql -u root -p clinica < migration_parcial.sql
```

### Paso 2: Verificar la Migración

```sql
USE clinica;

-- Verificar nuevas tablas
SHOW TABLES;

-- Verificar cambios en usuario
DESCRIBE usuario;

-- Ver configuración del sistema
SELECT * FROM sistema_configuracion;

-- Ver logs de auditoría de ejemplo
SELECT * FROM auditoria_log;
```

---

## 📊 Estructura de Tablas Nuevas/Modificadas

### 1. Tabla `usuario` (Modificada)

**Nuevas columnas agregadas:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `email` | VARCHAR(255) | Email del usuario para recuperación de contraseña |
| `intentos_fallidos` | INT | Contador de intentos de login fallidos |
| `fecha_ultimo_intento` | DATETIME | Fecha del último intento fallido |
| `bloqueado_hasta` | DATETIME | Fecha hasta la cual el usuario está bloqueado |
| `ip_ultimo_acceso` | VARCHAR(45) | IP del último intento de acceso |
| `fecha_ultimo_acceso_exitoso` | DATETIME | Fecha del último login exitoso |
| `requiere_cambio_password` | TINYINT(1) | Si debe cambiar contraseña en próximo login |
| `fecha_modificacion` | TIMESTAMP | Fecha de última modificación del registro |

**Ejemplo de uso:**
```sql
-- Ver usuarios con intentos fallidos
SELECT username, email, intentos_fallidos, bloqueado_hasta 
FROM usuario 
WHERE intentos_fallidos > 0;
```

---

### 2. Tabla `auditoria_log` (Nueva)

Registra todos los eventos importantes del sistema para trazabilidad y seguridad.

**Estructura:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT | ID autoincremental |
| `fecha_hora` | DATETIME | Fecha y hora del evento |
| `tipo_evento` | VARCHAR(50) | Tipo de evento (LOGIN_EXITOSO, LOGIN_FALLIDO, etc.) |
| `usuario_id` | BIGINT | ID del usuario (puede ser NULL) |
| `username` | VARCHAR(255) | Username ingresado |
| `ip_address` | VARCHAR(45) | Dirección IP del cliente |
| `descripcion` | TEXT | Descripción detallada del evento |
| `datos_adicionales` | JSON | Información adicional en formato JSON |
| `nivel` | VARCHAR(20) | INFO, WARNING, ERROR, CRITICAL |
| `modulo` | VARCHAR(50) | Módulo que generó el log |

**Tipos de eventos soportados:**
- `LOGIN_EXITOSO` - Login exitoso
- `LOGIN_FALLIDO` - Intento de login fallido
- `USUARIO_BLOQUEADO` - Usuario bloqueado por intentos
- `PASSWORD_RECOVERY_REQUEST` - Solicitud de recuperación
- `PASSWORD_RECOVERY_SUCCESS` - Recuperación exitosa
- `PASSWORD_CHANGED` - Cambio de contraseña
- `ROL_CHANGED` - Cambio de rol
- `USUARIO_DESACTIVADO` - Usuario desactivado

**Consultas útiles:**

```sql
-- Logs de las últimas 24 horas
SELECT * FROM auditoria_log 
WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY fecha_hora DESC;

-- Intentos fallidos de login
SELECT * FROM auditoria_log 
WHERE tipo_evento = 'LOGIN_FALLIDO'
ORDER BY fecha_hora DESC
LIMIT 50;

-- Usuarios bloqueados
SELECT * FROM auditoria_log 
WHERE tipo_evento = 'USUARIO_BLOQUEADO'
ORDER BY fecha_hora DESC;

-- Filtrar por usuario específico
SELECT * FROM auditoria_log 
WHERE username = 'usuario1'
ORDER BY fecha_hora DESC;

-- Filtrar por rango de fechas
SELECT * FROM auditoria_log 
WHERE fecha_hora BETWEEN '2025-11-01' AND '2025-11-30'
ORDER BY fecha_hora DESC;
```

---

### 3. Tabla `password_reset_token` (Nueva)

Almacena tokens para recuperación de contraseña.

**Estructura:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT | ID autoincremental |
| `usuario_id` | BIGINT | ID del usuario |
| `token` | VARCHAR(255) | Token único (UUID) |
| `fecha_creacion` | DATETIME | Fecha de creación |
| `fecha_expiracion` | DATETIME | Fecha de expiración (1 hora) |
| `usado` | TINYINT(1) | Si ya fue utilizado |
| `fecha_uso` | DATETIME | Fecha de uso |
| `ip_solicitud` | VARCHAR(45) | IP de la solicitud |

**Ejemplo de uso:**
```sql
-- Verificar tokens activos
SELECT * FROM password_reset_token 
WHERE usado = 0 AND fecha_expiracion > NOW();

-- Invalidar tokens vencidos
UPDATE password_reset_token 
SET usado = 1 
WHERE fecha_expiracion < NOW() AND usado = 0;
```

---

### 4. Tabla `password_temporal` (Nueva)

Almacena contraseñas temporales enviadas por email.

**Estructura:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | BIGINT | ID autoincremental |
| `usuario_id` | BIGINT | ID del usuario |
| `password_temporal_hash` | VARCHAR(255) | Hash de la contraseña temporal |
| `fecha_creacion` | DATETIME | Fecha de creación |
| `fecha_expiracion` | DATETIME | Expiración (24 horas) |
| `usado` | TINYINT(1) | Si fue usada |
| `fecha_uso` | DATETIME | Fecha de uso |

---

### 5. Tabla `sistema_configuracion` (Nueva)

Parámetros configurables del sistema.

**Configuraciones predefinidas:**

| Clave | Valor | Descripción |
|-------|-------|-------------|
| `MAX_INTENTOS_LOGIN` | 3 | Intentos antes de bloquear |
| `TIEMPO_BLOQUEO_MINUTOS` | 5 | Minutos de bloqueo |
| `TOKEN_EXPIRACION_HORAS` | 1 | Expiración de token |
| `PASSWORD_TEMPORAL_EXPIRACION_HORAS` | 24 | Expiración de password temporal |
| `DIAS_RETENCION_LOGS` | 90 | Días de retención de logs |

**Modificar configuración:**
```sql
UPDATE sistema_configuracion 
SET valor = '10' 
WHERE clave = 'TIEMPO_BLOQUEO_MINUTOS';
```

---

## 🔧 Procedimientos Almacenados

### 1. `sp_registrar_intento_fallido`

Registra un intento de login fallido y bloquea al usuario si excede el límite.

**Uso:**
```sql
CALL sp_registrar_intento_fallido('usuario1', '192.168.1.100');
```

**Funcionalidad:**
- Incrementa contador de intentos fallidos
- Registra IP y fecha del intento
- Bloquea usuario si supera MAX_INTENTOS_LOGIN
- Registra evento en auditoria_log

---

### 2. `sp_registrar_login_exitoso`

Registra un login exitoso y resetea el contador de intentos.

**Uso:**
```sql
CALL sp_registrar_login_exitoso(1, 'usuario1', '192.168.1.100');
```

**Funcionalidad:**
- Resetea intentos_fallidos a 0
- Elimina bloqueo si existe
- Actualiza fecha de último acceso exitoso
- Registra evento en auditoria_log

---

### 3. `sp_verificar_bloqueo_usuario`

Verifica si un usuario está bloqueado.

**Uso:**
```sql
CALL sp_verificar_bloqueo_usuario('usuario1', @bloqueado, @bloqueado_hasta);
SELECT @bloqueado, @bloqueado_hasta;
```

---

### 4. `sp_limpiar_logs_antiguos`

Limpia logs de auditoría antiguos según configuración.

**Uso:**
```sql
-- Elimina logs más antiguos que DIAS_RETENCION_LOGS
CALL sp_limpiar_logs_antiguos();
```

---

## 👁️ Vistas Útiles

### 1. `v_auditoria_detalle`

Vista completa de logs con información del usuario.

```sql
SELECT * FROM v_auditoria_detalle 
WHERE fecha_hora >= CURDATE()
ORDER BY fecha_hora DESC;
```

---

### 2. `v_usuarios_bloqueados`

Monitoreo de usuarios bloqueados o con intentos fallidos.

```sql
SELECT * FROM v_usuarios_bloqueados;
```

---

## 🔐 Flujo de Recuperación de Contraseña

### Diagrama de Flujo:

```
1. Usuario solicita recuperación de contraseña
   ↓
2. Sistema verifica si username existe
   ↓
   SI NO EXISTE → Registrar en auditoria_log (sin mostrar error al usuario)
   ↓
   SI EXISTE → Continuar
   ↓
3. Generar contraseña temporal aleatoria
   ↓
4. Hashear contraseña temporal
   ↓
5. Guardar en password_temporal
   ↓
6. Enviar contraseña temporal por email
   ↓
7. Registrar evento en auditoria_log
   ↓
8. Retornar mensaje genérico (siempre el mismo, exista o no el usuario)
```

---

## 🛡️ Flujo de Control de Intentos de Login

### Diagrama de Flujo:

```
1. Usuario intenta login
   ↓
2. Verificar si usuario está bloqueado
   ↓
   SI ESTÁ BLOQUEADO → Retornar error + registrar en auditoria_log
   ↓
   SI NO ESTÁ BLOQUEADO → Continuar
   ↓
3. Validar credenciales
   ↓
   SI SON CORRECTAS → sp_registrar_login_exitoso()
   ↓
   SI SON INCORRECTAS → sp_registrar_intento_fallido()
   ↓
4. Si intentos >= MAX_INTENTOS_LOGIN
   ↓
5. Bloquear usuario por TIEMPO_BLOQUEO_MINUTOS
   ↓
6. Registrar bloqueo en auditoria_log
```

---

## 📝 Triggers Automáticos

### 1. `trg_usuario_after_update`

Se ejecuta automáticamente después de actualizar un usuario.

**Registra en auditoría:**
- Cambios de contraseña
- Cambios de rol
- Desactivación de usuarios

---

## 🧪 Datos de Prueba

El script incluye datos de prueba insertados automáticamente:

```sql
-- 3 usuarios con emails configurados
-- 4 registros de auditoría de ejemplo
-- 10 parámetros de configuración del sistema
```

---

## 📊 Consultas de Monitoreo

### Dashboard de Seguridad

```sql
-- Resumen de actividad de las últimas 24 horas
SELECT 
    tipo_evento,
    COUNT(*) as cantidad,
    MAX(fecha_hora) as ultimo_evento
FROM auditoria_log
WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY tipo_evento
ORDER BY cantidad DESC;

-- Usuarios con más intentos fallidos
SELECT 
    username,
    email,
    intentos_fallidos,
    fecha_ultimo_intento,
    bloqueado_hasta
FROM usuario
WHERE intentos_fallidos > 0
ORDER BY intentos_fallidos DESC;

-- IPs con más intentos fallidos
SELECT 
    ip_address,
    COUNT(*) as intentos,
    MAX(fecha_hora) as ultimo_intento
FROM auditoria_log
WHERE tipo_evento = 'LOGIN_FALLIDO'
    AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY ip_address
ORDER BY intentos DESC;
```

---

## 🔄 Mantenimiento

### Limpieza Periódica

```sql
-- Ejecutar semanalmente
CALL sp_limpiar_logs_antiguos();

-- Limpiar tokens vencidos
DELETE FROM password_reset_token 
WHERE fecha_expiracion < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Limpiar contraseñas temporales vencidas
DELETE FROM password_temporal 
WHERE fecha_expiracion < DATE_SUB(NOW(), INTERVAL 7 DAY);
```

---

## 🐛 Troubleshooting

### Problema: Usuario bloqueado permanentemente

```sql
-- Desbloquear manualmente
UPDATE usuario 
SET intentos_fallidos = 0, bloqueado_hasta = NULL 
WHERE username = 'usuario1';
```

### Problema: Necesito ver todos los eventos de un usuario

```sql
SELECT * FROM v_auditoria_detalle 
WHERE username = 'usuario1'
ORDER BY fecha_hora DESC;
```

### Problema: Limpiar todos los logs de auditoría

```sql
-- ⚠️ PRECAUCIÓN: Esto elimina TODOS los logs
TRUNCATE TABLE auditoria_log;
```

---

## 📚 Referencias

- **Motor de BD:** MySQL 8.0.43
- **Codificación:** utf8mb4
- **Collation:** utf8mb4_0900_ai_ci
- **Motor de Storage:** InnoDB

---

## ✅ Checklist de Implementación

- [x] Tabla de auditoría creada
- [x] Tabla de tokens de recuperación creada
- [x] Tabla de contraseñas temporales creada
- [x] Tabla de configuración del sistema creada
- [x] Usuario modificado con campos de seguridad
- [x] Procedimientos almacenados implementados
- [x] Vistas de consulta creadas
- [x] Triggers automáticos configurados
- [x] Índices de rendimiento agregados
- [x] Datos de prueba insertados

---

## 📞 Soporte

Para dudas o problemas con la base de datos, revisar:
1. Los logs de MySQL en caso de errores
2. La vista `v_auditoria_detalle` para trazabilidad
3. La tabla `sistema_configuracion` para parámetros

---

**Fecha de creación:** 2025-11-19  
**Versión:** 1.0  
**Autor:** Sistema de Gestión Clínica
