-- ============================================================================
-- CONSULTAS ÚTILES Y EJEMPLOS - SISTEMA CLÍNICA
-- Archivo de consultas de referencia para desarrollo y testing
-- ============================================================================

USE `clinica`;

-- ============================================================================
-- 1. CONSULTAS DE AUDITORÍA
-- ============================================================================

-- Todos los logs del día actual
SELECT * FROM v_auditoria_detalle 
WHERE DATE(fecha_hora) = CURDATE()
ORDER BY fecha_hora DESC;

-- Logs de las últimas 24 horas
SELECT * FROM auditoria_log 
WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY fecha_hora DESC;

-- Logs por tipo de evento
SELECT 
    tipo_evento,
    COUNT(*) as total,
    MAX(fecha_hora) as ultimo_evento
FROM auditoria_log
GROUP BY tipo_evento
ORDER BY total DESC;

-- Logs por nivel (INFO, WARNING, ERROR, CRITICAL)
SELECT 
    nivel,
    COUNT(*) as total,
    MAX(fecha_hora) as ultimo_evento
FROM auditoria_log
GROUP BY nivel
ORDER BY 
    FIELD(nivel, 'CRITICAL', 'ERROR', 'WARNING', 'INFO');

-- Logs de un usuario específico
SELECT * FROM v_auditoria_detalle 
WHERE username = 'usuario1'
ORDER BY fecha_hora DESC;

-- Actividad por módulo
SELECT 
    modulo,
    COUNT(*) as eventos,
    MAX(fecha_hora) as ultima_actividad
FROM auditoria_log
GROUP BY modulo
ORDER BY eventos DESC;

-- Eventos críticos y errores
SELECT * FROM auditoria_log 
WHERE nivel IN ('ERROR', 'CRITICAL')
ORDER BY fecha_hora DESC;

-- Resumen de eventos por día
SELECT 
    DATE(fecha_hora) as fecha,
    COUNT(*) as total_eventos,
    SUM(CASE WHEN tipo_evento = 'LOGIN_EXITOSO' THEN 1 ELSE 0 END) as logins_exitosos,
    SUM(CASE WHEN tipo_evento = 'LOGIN_FALLIDO' THEN 1 ELSE 0 END) as logins_fallidos,
    SUM(CASE WHEN tipo_evento = 'USUARIO_BLOQUEADO' THEN 1 ELSE 0 END) as usuarios_bloqueados
FROM auditoria_log
WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(fecha_hora)
ORDER BY fecha DESC;

-- ============================================================================
-- 2. CONSULTAS DE SEGURIDAD Y BLOQUEOS
-- ============================================================================

-- Usuarios actualmente bloqueados
SELECT 
    username,
    email,
    intentos_fallidos,
    bloqueado_hasta,
    TIMESTAMPDIFF(MINUTE, NOW(), bloqueado_hasta) as minutos_restantes
FROM usuario
WHERE bloqueado_hasta > NOW()
ORDER BY bloqueado_hasta DESC;

-- Todos los usuarios con intentos fallidos
SELECT * FROM v_usuarios_bloqueados;

-- Historial de bloqueos
SELECT * FROM auditoria_log 
WHERE tipo_evento = 'USUARIO_BLOQUEADO'
ORDER BY fecha_hora DESC;

-- Intentos fallidos por IP
SELECT 
    ip_address,
    COUNT(*) as intentos_fallidos,
    MAX(fecha_hora) as ultimo_intento,
    GROUP_CONCAT(DISTINCT username SEPARATOR ', ') as usuarios_intentados
FROM auditoria_log
WHERE tipo_evento = 'LOGIN_FALLIDO'
    AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY ip_address
HAVING intentos_fallidos >= 3
ORDER BY intentos_fallidos DESC;

-- Usuarios que nunca han iniciado sesión
SELECT 
    u.id,
    u.username,
    u.email,
    u.fecha_creacion
FROM usuario u
WHERE u.fecha_ultimo_acceso_exitoso IS NULL
ORDER BY u.fecha_creacion DESC;

-- Actividad de login por hora del día
SELECT 
    HOUR(fecha_hora) as hora,
    COUNT(*) as logins,
    SUM(CASE WHEN tipo_evento = 'LOGIN_EXITOSO' THEN 1 ELSE 0 END) as exitosos,
    SUM(CASE WHEN tipo_evento = 'LOGIN_FALLIDO' THEN 1 ELSE 0 END) as fallidos
FROM auditoria_log
WHERE tipo_evento IN ('LOGIN_EXITOSO', 'LOGIN_FALLIDO')
    AND fecha_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(fecha_hora)
ORDER BY hora;

-- ============================================================================
-- 3. CONSULTAS DE RECUPERACIÓN DE CONTRASEÑA
-- ============================================================================

-- Tokens activos de recuperación
SELECT 
    t.id,
    u.username,
    u.email,
    t.token,
    t.fecha_creacion,
    t.fecha_expiracion,
    t.usado,
    TIMESTAMPDIFF(MINUTE, NOW(), t.fecha_expiracion) as minutos_restantes
FROM password_reset_token t
JOIN usuario u ON t.usuario_id = u.id
WHERE t.usado = 0 AND t.fecha_expiracion > NOW()
ORDER BY t.fecha_creacion DESC;

-- Historial de recuperaciones de contraseña
SELECT 
    u.username,
    u.email,
    t.fecha_creacion,
    t.fecha_expiracion,
    t.usado,
    t.fecha_uso
FROM password_reset_token t
JOIN usuario u ON t.usuario_id = u.id
ORDER BY t.fecha_creacion DESC;

-- Contraseñas temporales activas
SELECT 
    p.id,
    u.username,
    u.email,
    p.fecha_creacion,
    p.fecha_expiracion,
    p.usado,
    TIMESTAMPDIFF(HOUR, NOW(), p.fecha_expiracion) as horas_restantes
FROM password_temporal p
JOIN usuario u ON p.usuario_id = u.id
WHERE p.usado = 0 AND p.fecha_expiracion > NOW()
ORDER BY p.fecha_creacion DESC;

-- Solicitudes de recuperación por usuario
SELECT 
    u.username,
    u.email,
    COUNT(t.id) as total_solicitudes,
    MAX(t.fecha_creacion) as ultima_solicitud
FROM usuario u
LEFT JOIN password_reset_token t ON u.id = t.usuario_id
GROUP BY u.id, u.username, u.email
HAVING total_solicitudes > 0
ORDER BY total_solicitudes DESC;

-- ============================================================================
-- 4. CONSULTAS DE CONFIGURACIÓN
-- ============================================================================

-- Ver toda la configuración del sistema
SELECT * FROM sistema_configuracion ORDER BY categoria, clave;

-- Configuración de seguridad
SELECT * FROM sistema_configuracion 
WHERE categoria = 'SEGURIDAD'
ORDER BY clave;

-- Configuración de email
SELECT * FROM sistema_configuracion 
WHERE categoria = 'EMAIL'
ORDER BY clave;

-- Configuración de auditoría
SELECT * FROM sistema_configuracion 
WHERE categoria = 'AUDITORIA'
ORDER BY clave;

-- ============================================================================
-- 5. CONSULTAS DE USUARIOS
-- ============================================================================

-- Usuarios activos
SELECT 
    id,
    username,
    email,
    rol,
    fecha_creacion,
    fecha_ultimo_acceso_exitoso,
    intentos_fallidos
FROM usuario
WHERE activo = 1
ORDER BY fecha_creacion DESC;

-- Usuarios inactivos
SELECT * FROM usuario 
WHERE activo = 0
ORDER BY fecha_creacion DESC;

-- Usuarios por rol
SELECT 
    rol,
    COUNT(*) as total,
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
    SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos
FROM usuario
GROUP BY rol
ORDER BY total DESC;

-- Usuarios que requieren cambio de contraseña
SELECT 
    username,
    email,
    rol,
    fecha_creacion
FROM usuario
WHERE requiere_cambio_password = 1
ORDER BY fecha_creacion DESC;

-- Último acceso de cada usuario
SELECT 
    username,
    email,
    rol,
    fecha_ultimo_acceso_exitoso,
    ip_ultimo_acceso,
    DATEDIFF(NOW(), fecha_ultimo_acceso_exitoso) as dias_sin_acceso
FROM usuario
WHERE fecha_ultimo_acceso_exitoso IS NOT NULL
ORDER BY fecha_ultimo_acceso_exitoso DESC;

-- ============================================================================
-- 6. ESTADÍSTICAS Y REPORTES
-- ============================================================================

-- Resumen general de auditoría
SELECT 
    COUNT(*) as total_eventos,
    COUNT(DISTINCT DATE(fecha_hora)) as dias_con_actividad,
    MIN(fecha_hora) as primer_evento,
    MAX(fecha_hora) as ultimo_evento,
    COUNT(DISTINCT usuario_id) as usuarios_unicos,
    COUNT(DISTINCT ip_address) as ips_unicas
FROM auditoria_log;

-- Top 10 usuarios más activos
SELECT 
    username,
    COUNT(*) as eventos,
    MAX(fecha_hora) as ultima_actividad
FROM auditoria_log
WHERE usuario_id IS NOT NULL
GROUP BY username
ORDER BY eventos DESC
LIMIT 10;

-- Top 10 IPs con más actividad
SELECT 
    ip_address,
    COUNT(*) as eventos,
    COUNT(DISTINCT username) as usuarios_diferentes,
    MAX(fecha_hora) as ultima_actividad
FROM auditoria_log
WHERE ip_address IS NOT NULL
GROUP BY ip_address
ORDER BY eventos DESC
LIMIT 10;

-- Eventos por día de la semana
SELECT 
    DAYNAME(fecha_hora) as dia_semana,
    DAYOFWEEK(fecha_hora) as num_dia,
    COUNT(*) as eventos
FROM auditoria_log
GROUP BY DAYNAME(fecha_hora), DAYOFWEEK(fecha_hora)
ORDER BY num_dia;

-- Tasa de éxito de login
SELECT 
    DATE(fecha_hora) as fecha,
    SUM(CASE WHEN tipo_evento = 'LOGIN_EXITOSO' THEN 1 ELSE 0 END) as exitosos,
    SUM(CASE WHEN tipo_evento = 'LOGIN_FALLIDO' THEN 1 ELSE 0 END) as fallidos,
    ROUND(
        (SUM(CASE WHEN tipo_evento = 'LOGIN_EXITOSO' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(SUM(CASE WHEN tipo_evento IN ('LOGIN_EXITOSO', 'LOGIN_FALLIDO') THEN 1 ELSE 0 END), 0),
        2
    ) as tasa_exito_pct
FROM auditoria_log
WHERE tipo_evento IN ('LOGIN_EXITOSO', 'LOGIN_FALLIDO')
    AND fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(fecha_hora)
ORDER BY fecha DESC;

-- ============================================================================
-- 7. CONSULTAS PARA EL FRONTEND (Endpoints)
-- ============================================================================

-- Endpoint: GET /api/auditoria/logs (con paginación)
-- Parámetros: page, size, fechaDesde, fechaHasta, tipoEvento, username, nivel
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
    -- Filtros opcionales (ejemplo con todos activos)
    a.fecha_hora >= '2025-11-01 00:00:00'
    AND a.fecha_hora <= '2025-11-30 23:59:59'
    -- AND a.tipo_evento = 'LOGIN_FALLIDO' -- opcional
    -- AND a.username LIKE '%usuario%' -- opcional
    -- AND a.nivel = 'WARNING' -- opcional
ORDER BY a.fecha_hora DESC
LIMIT 10 OFFSET 0; -- page 0, size 10

-- Endpoint: GET /api/auditoria/estadisticas
SELECT 
    COUNT(*) as total_eventos,
    SUM(CASE WHEN tipo_evento = 'LOGIN_EXITOSO' THEN 1 ELSE 0 END) as logins_exitosos,
    SUM(CASE WHEN tipo_evento = 'LOGIN_FALLIDO' THEN 1 ELSE 0 END) as logins_fallidos,
    SUM(CASE WHEN tipo_evento = 'USUARIO_BLOQUEADO' THEN 1 ELSE 0 END) as usuarios_bloqueados,
    SUM(CASE WHEN tipo_evento LIKE 'PASSWORD_RECOVERY%' THEN 1 ELSE 0 END) as recuperaciones_password,
    COUNT(DISTINCT usuario_id) as usuarios_activos,
    COUNT(DISTINCT ip_address) as ips_diferentes
FROM auditoria_log
WHERE fecha_hora >= DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Endpoint: GET /api/auditoria/tipos-evento
SELECT DISTINCT tipo_evento 
FROM auditoria_log 
ORDER BY tipo_evento;

-- Endpoint: GET /api/auditoria/niveles
SELECT DISTINCT nivel 
FROM auditoria_log 
WHERE nivel IS NOT NULL
ORDER BY FIELD(nivel, 'CRITICAL', 'ERROR', 'WARNING', 'INFO');

-- ============================================================================
-- 8. OPERACIONES DE MANTENIMIENTO
-- ============================================================================

-- Desbloquear un usuario específico
UPDATE usuario 
SET intentos_fallidos = 0, 
    bloqueado_hasta = NULL 
WHERE username = 'usuario1';

-- Desbloquear todos los usuarios con bloqueo vencido
UPDATE usuario 
SET intentos_fallidos = 0, 
    bloqueado_hasta = NULL 
WHERE bloqueado_hasta < NOW();

-- Invalidar tokens de recuperación vencidos
UPDATE password_reset_token 
SET usado = 1 
WHERE fecha_expiracion < NOW() AND usado = 0;

-- Limpiar contraseñas temporales vencidas
DELETE FROM password_temporal 
WHERE fecha_expiracion < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Limpiar tokens muy antiguos
DELETE FROM password_reset_token 
WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Actualizar configuración
UPDATE sistema_configuracion 
SET valor = '10' 
WHERE clave = 'TIEMPO_BLOQUEO_MINUTOS';

-- ============================================================================
-- 9. TESTING Y DEPURACIÓN
-- ============================================================================

-- Simular intento fallido
CALL sp_registrar_intento_fallido('usuario1', '192.168.1.100');

-- Verificar estado después del intento
SELECT 
    username,
    intentos_fallidos,
    bloqueado_hasta,
    fecha_ultimo_intento
FROM usuario 
WHERE username = 'usuario1';

-- Simular login exitoso
CALL sp_registrar_login_exitoso(1, 'usuario1', '192.168.1.100');

-- Verificar si usuario está bloqueado
CALL sp_verificar_bloqueo_usuario('usuario1', @bloqueado, @bloqueado_hasta);
SELECT 
    @bloqueado as esta_bloqueado, 
    @bloqueado_hasta as bloqueado_hasta,
    CASE 
        WHEN @bloqueado = 1 THEN TIMESTAMPDIFF(MINUTE, NOW(), @bloqueado_hasta)
        ELSE 0
    END as minutos_restantes;

-- Ver últimos 10 eventos de un usuario
SELECT * FROM v_auditoria_detalle 
WHERE username = 'usuario1'
ORDER BY fecha_hora DESC
LIMIT 10;

-- Limpiar logs de prueba
DELETE FROM auditoria_log 
WHERE descripcion LIKE '%prueba%' OR descripcion LIKE '%test%';

-- ============================================================================
-- 10. BACKUP Y RESTAURACIÓN
-- ============================================================================

-- Backup solo de logs de auditoría (comando desde terminal)
-- mysqldump -u root -p clinica auditoria_log > auditoria_backup_$(date +%Y%m%d).sql

-- Backup de tablas de seguridad (comando desde terminal)
-- mysqldump -u root -p clinica auditoria_log password_reset_token password_temporal sistema_configuracion > seguridad_backup_$(date +%Y%m%d).sql

-- Contar registros en cada tabla
SELECT 'auditoria_log' as tabla, COUNT(*) as registros FROM auditoria_log
UNION ALL
SELECT 'password_reset_token', COUNT(*) FROM password_reset_token
UNION ALL
SELECT 'password_temporal', COUNT(*) FROM password_temporal
UNION ALL
SELECT 'sistema_configuracion', COUNT(*) FROM sistema_configuracion
UNION ALL
SELECT 'usuario', COUNT(*) FROM usuario;

-- ============================================================================
-- FIN DE CONSULTAS ÚTILES
-- ============================================================================
