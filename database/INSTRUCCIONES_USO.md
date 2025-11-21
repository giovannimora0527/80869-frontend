# 📚 Instrucciones de Uso - Base de Datos Clínica

## 🎯 Resumen Ejecutivo

Este paquete contiene todo lo necesario para implementar los requerimientos de **auditoría y seguridad** del examen final de Programación Web en tu base de datos MySQL.

---

## 📦 Archivos Incluidos

```
database/
├── migration_parcial.sql          # Script principal de migración
├── consultas_utiles.sql           # Consultas de referencia
├── test_funcionalidad.sql         # Script de pruebas
├── README_DATABASE.md             # Documentación completa
├── DIAGRAMA_BD.md                 # Diagramas y modelado
└── INSTRUCCIONES_USO.md           # Este archivo
```

---

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Backup de Seguridad

```bash
# Crear backup de tu base de datos actual
mysqldump -u root -p clinica > backup_clinica_$(date +%Y%m%d_%H%M%S).sql
```

### Paso 2: Ejecutar Migración

**Opción A: MySQL Workbench (Recomendado)**
1. Abrir MySQL Workbench
2. Conectarse a tu servidor local
3. Abrir archivo `migration_parcial.sql`
4. Ejecutar todo el script: `Ctrl + Shift + Enter`
5. Verificar que no haya errores en la salida

**Opción B: Línea de Comandos**
```bash
mysql -u root -p clinica < migration_parcial.sql
```

### Paso 3: Verificar Instalación

```bash
mysql -u root -p clinica < test_funcionalidad.sql
```

Si todos los tests muestran `✓`, la instalación fue exitosa.

---

## ✅ Checklist Post-Instalación

- [ ] Script de migración ejecutado sin errores
- [ ] Tabla `auditoria_log` creada
- [ ] Tabla `password_reset_token` creada
- [ ] Tabla `password_temporal` creada
- [ ] Tabla `sistema_configuracion` creada con 10 registros
- [ ] Tabla `usuario` tiene nuevas columnas (email, intentos_fallidos, etc.)
- [ ] 4 procedimientos almacenados creados
- [ ] 2 vistas creadas
- [ ] 1 trigger creado
- [ ] Tests ejecutados correctamente

---

## 🎓 Requerimientos del Parcial Cubiertos

### ✅ 1. Recuperación de Contraseña

**Implementado:**
- Tabla `password_temporal` para contraseñas temporales
- Tabla `password_reset_token` para tokens de recuperación
- Logs de auditoría para intentos válidos e inválidos
- Campo `email` en usuario para envío de correos
- Campo `requiere_cambio_password` para forzar cambio

**Flujo:**
1. Usuario ingresa username
2. Sistema busca en BD
3. Si NO existe → Log de auditoría (usuario_id = NULL)
4. Si existe → Genera contraseña temporal + envía email
5. Retorna SIEMPRE el mismo mensaje (seguridad)

**SQL de ejemplo:**
```sql
-- Buscar usuario
SELECT id, email FROM usuario WHERE username = 'usuario1';

-- Crear contraseña temporal
INSERT INTO password_temporal (usuario_id, password_temporal_hash, fecha_creacion, fecha_expiracion)
VALUES (1, SHA2('TempPass123', 256), NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR));

-- Registrar en log
INSERT INTO auditoria_log (tipo_evento, usuario_id, username, ip_address, descripcion, nivel, modulo)
VALUES ('PASSWORD_RECOVERY_SUCCESS', 1, 'usuario1', '192.168.1.100', 'Recuperación exitosa', 'INFO', 'AUTH');
```

---

### ✅ 2. Control de Intentos de Login

**Implementado:**
- Contador `intentos_fallidos` en usuario
- Campo `bloqueado_hasta` con timestamp
- Campo `ip_ultimo_acceso` para trazabilidad
- Configuración parametrizable (MAX_INTENTOS_LOGIN = 3, TIEMPO_BLOQUEO_MINUTOS = 5)
- Procedimiento `sp_registrar_intento_fallido`
- Procedimiento `sp_verificar_bloqueo_usuario`
- Logs automáticos de bloqueos

**Flujo:**
1. Login fallido → Incrementa contador
2. Si contador >= 3 → Bloquea por 5 minutos
3. Cada evento se registra en `auditoria_log`
4. Login exitoso → Resetea contador

**SQL de ejemplo:**
```sql
-- Verificar si está bloqueado
CALL sp_verificar_bloqueo_usuario('usuario1', @bloqueado, @hasta);
SELECT @bloqueado, @hasta;

-- Registrar intento fallido
CALL sp_registrar_intento_fallido('usuario1', '192.168.1.100');

-- Registrar login exitoso
CALL sp_registrar_login_exitoso(1, 'usuario1', '192.168.1.100');
```

---

### ✅ 3. Visualización de Logs (Para el Frontend)

**Implementado:**
- Tabla `auditoria_log` con todos los campos necesarios
- Vista `v_auditoria_detalle` con información completa
- Índices para búsquedas rápidas
- Soporte para filtros por fecha, usuario, tipo de evento, nivel

**Endpoint sugerido para Angular:**
```typescript
// GET /api/auditoria/logs?page=0&size=10&fechaDesde=2025-11-01&tipoEvento=LOGIN_FALLIDO
```

**SQL para el backend:**
```sql
-- Consulta con filtros y paginación
SELECT 
    a.id,
    a.fecha_hora,
    a.tipo_evento,
    a.username,
    u.email,
    u.rol,
    a.ip_address,
    a.descripcion,
    a.nivel,
    a.modulo
FROM auditoria_log a
LEFT JOIN usuario u ON a.usuario_id = u.id
WHERE 
    a.fecha_hora >= ? 
    AND a.fecha_hora <= ?
    AND (? IS NULL OR a.tipo_evento = ?)
    AND (? IS NULL OR a.username LIKE ?)
    AND (? IS NULL OR a.nivel = ?)
ORDER BY a.fecha_hora DESC
LIMIT ? OFFSET ?;
```

---

## 🔧 Configuración del Sistema

### Parámetros Modificables

Editar en la tabla `sistema_configuracion`:

```sql
-- Cambiar máximo de intentos a 5
UPDATE sistema_configuracion 
SET valor = '5' 
WHERE clave = 'MAX_INTENTOS_LOGIN';

-- Cambiar tiempo de bloqueo a 10 minutos
UPDATE sistema_configuracion 
SET valor = '10' 
WHERE clave = 'TIEMPO_BLOQUEO_MINUTOS';

-- Ver todas las configuraciones
SELECT * FROM sistema_configuracion ORDER BY categoria, clave;
```

---

## 📊 Consultas Útiles para Desarrollo

### Consultar Logs de Auditoría

```sql
-- Logs del día actual
SELECT * FROM v_auditoria_detalle 
WHERE DATE(fecha_hora) = CURDATE()
ORDER BY fecha_hora DESC;

-- Intentos fallidos de login
SELECT * FROM auditoria_log 
WHERE tipo_evento = 'LOGIN_FALLIDO'
ORDER BY fecha_hora DESC
LIMIT 50;

-- Usuarios bloqueados
SELECT * FROM v_usuarios_bloqueados;

-- Filtrar por usuario
SELECT * FROM v_auditoria_detalle 
WHERE username = 'usuario1'
ORDER BY fecha_hora DESC;

-- Filtrar por rango de fechas
SELECT * FROM auditoria_log 
WHERE fecha_hora BETWEEN '2025-11-01' AND '2025-11-30'
ORDER BY fecha_hora DESC;

-- Estadísticas del día
SELECT 
    tipo_evento,
    COUNT(*) as total
FROM auditoria_log
WHERE DATE(fecha_hora) = CURDATE()
GROUP BY tipo_evento
ORDER BY total DESC;
```

---

## 🛠️ Operaciones Comunes

### Desbloquear Usuario Manualmente

```sql
UPDATE usuario 
SET intentos_fallidos = 0, 
    bloqueado_hasta = NULL 
WHERE username = 'usuario1';
```

### Agregar Email a Usuarios Existentes

```sql
UPDATE usuario 
SET email = 'correo@ejemplo.com' 
WHERE username = 'usuario1';
```

### Limpiar Logs Antiguos

```sql
-- Manual
DELETE FROM auditoria_log 
WHERE fecha_hora < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Automático (usa configuración)
CALL sp_limpiar_logs_antiguos();
```

### Ver Usuarios Bloqueados

```sql
SELECT 
    username,
    email,
    intentos_fallidos,
    bloqueado_hasta,
    TIMESTAMPDIFF(MINUTE, NOW(), bloqueado_hasta) as minutos_restantes
FROM usuario
WHERE bloqueado_hasta > NOW();
```

---

## 🔗 Integración con Backend (Spring Boot / Java)

### Ejemplo de uso en tu controlador:

```java
// Registrar intento fallido
@Transactional
public void registrarIntentoFallido(String username, String ip) {
    jdbcTemplate.update(
        "CALL sp_registrar_intento_fallido(?, ?)", 
        username, ip
    );
}

// Verificar bloqueo
public boolean verificarBloqueo(String username) {
    SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
        .withProcedureName("sp_verificar_bloqueo_usuario");
    
    Map<String, Object> inParams = new HashMap<>();
    inParams.put("p_username", username);
    
    Map<String, Object> out = jdbcCall.execute(inParams);
    return (Boolean) out.get("p_bloqueado");
}

// Consultar logs con filtros
public List<AuditoriaLog> consultarLogs(
    LocalDateTime fechaDesde,
    LocalDateTime fechaHasta,
    String tipoEvento,
    String username,
    int page,
    int size
) {
    String sql = "SELECT * FROM v_auditoria_detalle WHERE ... LIMIT ? OFFSET ?";
    // ... implementación
}
```

---

## 📝 Tipos de Eventos Disponibles

| Tipo de Evento | Descripción | Nivel |
|----------------|-------------|-------|
| LOGIN_EXITOSO | Login exitoso | INFO |
| LOGIN_FALLIDO | Intento de login fallido | WARNING |
| USUARIO_BLOQUEADO | Usuario bloqueado por intentos | WARNING |
| PASSWORD_RECOVERY_REQUEST | Solicitud de recuperación | INFO |
| PASSWORD_RECOVERY_SUCCESS | Recuperación exitosa | INFO |
| PASSWORD_RECOVERY_FAILED | Recuperación fallida | WARNING |
| PASSWORD_CHANGED | Cambio de contraseña | INFO |
| ROL_CHANGED | Cambio de rol | WARNING |
| USUARIO_DESACTIVADO | Usuario desactivado | WARNING |

---

## 🐛 Troubleshooting

### Problema: "Table already exists"
**Solución:** La migración es segura. Usa `DROP TABLE IF EXISTS`.

### Problema: Usuario bloqueado permanentemente
**Solución:**
```sql
UPDATE usuario 
SET intentos_fallidos = 0, bloqueado_hasta = NULL 
WHERE username = 'usuario_afectado';
```

### Problema: No se generan logs automáticos
**Solución:** Verificar que el trigger existe:
```sql
SHOW TRIGGERS WHERE `Table` = 'usuario';
```

### Problema: Necesito más tiempo de bloqueo
**Solución:**
```sql
UPDATE sistema_configuracion 
SET valor = '15' 
WHERE clave = 'TIEMPO_BLOQUEO_MINUTOS';
```

---

## 📞 Comandos de Verificación

```sql
-- Verificar instalación completa
USE clinica;
SHOW TABLES;
DESCRIBE usuario;
SHOW PROCEDURE STATUS WHERE Db = 'clinica';
SELECT * FROM sistema_configuracion;

-- Contar registros
SELECT 
    'auditoria_log' as tabla, 
    COUNT(*) as registros 
FROM auditoria_log
UNION ALL
SELECT 'usuario', COUNT(*) FROM usuario;
```

---

## 🎯 Próximos Pasos

1. ✅ **Ejecutar migración** → `migration_parcial.sql`
2. ✅ **Ejecutar tests** → `test_funcionalidad.sql`
3. ⏭️ **Actualizar backend** → Implementar endpoints
4. ⏭️ **Actualizar frontend Angular** → Componente de logs
5. ⏭️ **Probar flujos completos** → Login, recuperación, auditoría
6. ⏭️ **Documentar** → Swagger/OpenAPI
7. ⏭️ **Docker** → Dockerfile y despliegue

---

## 📚 Documentación Adicional

- `README_DATABASE.md` - Documentación completa y detallada
- `DIAGRAMA_BD.md` - Diagramas ER y flujos de proceso
- `consultas_utiles.sql` - 100+ consultas de ejemplo
- `test_funcionalidad.sql` - Suite de pruebas completa

---

## ✉️ Soporte

Si encuentras algún error:
1. Revisa los logs de MySQL
2. Ejecuta `test_funcionalidad.sql` para diagnosticar
3. Verifica la vista `v_auditoria_detalle`

---

**Creado:** 2025-11-19  
**Versión:** 1.0  
**Compatibilidad:** MySQL 8.0+  
**Proyecto:** Sistema Clínica - Examen Final Programación Web
