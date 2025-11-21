-- ============================================================================
-- SCRIPT DE TESTING - SISTEMA CLÍNICA
-- Pruebas de funcionalidad de auditoría y seguridad
-- ============================================================================

USE `clinica`;

-- ============================================================================
-- SECCIÓN 1: PREPARACIÓN - VERIFICAR QUE TODO ESTÁ INSTALADO
-- ============================================================================

SELECT '========================================' as '';
SELECT 'VERIFICACIÓN DE INSTALACIÓN' as 'TEST';
SELECT '========================================' as '';

-- Verificar tablas
SELECT 'Verificando existencia de tablas...' as 'PASO 1';
SELECT 
    CASE 
        WHEN COUNT(*) = 5 THEN '✓ TODAS LAS TABLAS EXISTEN'
        ELSE '✗ FALTAN TABLAS'
    END as resultado
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'clinica' 
  AND TABLE_NAME IN ('auditoria_log', 'password_reset_token', 
                     'password_temporal', 'sistema_configuracion', 'usuario');

-- Verificar columnas nuevas en usuario
SELECT 'Verificando nuevas columnas en usuario...' as 'PASO 2';
SELECT 
    CASE 
        WHEN COUNT(*) >= 7 THEN '✓ COLUMNAS NUEVAS AGREGADAS'
        ELSE '✗ FALTAN COLUMNAS'
    END as resultado
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'clinica' 
  AND TABLE_NAME = 'usuario'
  AND COLUMN_NAME IN ('email', 'intentos_fallidos', 'fecha_ultimo_intento', 
                      'bloqueado_hasta', 'ip_ultimo_acceso', 
                      'fecha_ultimo_acceso_exitoso', 'requiere_cambio_password');

-- Verificar procedimientos almacenados
SELECT 'Verificando procedimientos almacenados...' as 'PASO 3';
SELECT 
    ROUTINE_NAME as procedimiento,
    '✓ Existe' as estado
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_SCHEMA = 'clinica'
  AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- Verificar vistas
SELECT 'Verificando vistas...' as 'PASO 4';
SELECT 
    TABLE_NAME as vista,
    '✓ Existe' as estado
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_SCHEMA = 'clinica'
ORDER BY TABLE_NAME;

-- ============================================================================
-- SECCIÓN 2: TEST DE CONFIGURACIÓN
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE CONFIGURACIÓN DEL SISTEMA' as 'TEST';
SELECT '========================================' as '';

-- Mostrar configuración actual
SELECT 'Configuración de seguridad:' as 'PASO 5';
SELECT clave, valor, descripcion 
FROM sistema_configuracion 
WHERE categoria = 'SEGURIDAD'
ORDER BY clave;

-- ============================================================================
-- SECCIÓN 3: TEST DE CONTROL DE INTENTOS FALLIDOS
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE CONTROL DE INTENTOS FALLIDOS' as 'TEST';
SELECT '========================================' as '';

-- Limpiar datos de prueba anteriores
DELETE FROM auditoria_log WHERE username = 'test_user';
DELETE FROM usuario WHERE username = 'test_user';

-- Crear usuario de prueba
INSERT INTO usuario (username, password_hash, email, rol, activo)
VALUES ('test_user', 'hash_test_123', 'test@clinica.com', 'user', 1);

SET @test_user_id = LAST_INSERT_ID();

SELECT CONCAT('Usuario de prueba creado con ID: ', @test_user_id) as 'PASO 6';

-- Estado inicial del usuario
SELECT 'Estado inicial del usuario:' as 'PASO 7';
SELECT 
    username,
    intentos_fallidos,
    bloqueado_hasta,
    fecha_ultimo_intento
FROM usuario 
WHERE username = 'test_user';

-- TEST 1: Primer intento fallido
SELECT 'TEST 1: Registrando primer intento fallido...' as 'PASO 8';
CALL sp_registrar_intento_fallido('test_user', '192.168.1.100');

SELECT 'Resultado después del primer intento:' as '';
SELECT 
    username,
    intentos_fallidos,
    bloqueado_hasta,
    fecha_ultimo_intento,
    CASE 
        WHEN intentos_fallidos = 1 THEN '✓ CORRECTO'
        ELSE '✗ ERROR'
    END as validacion
FROM usuario 
WHERE username = 'test_user';

-- TEST 2: Segundo intento fallido
SELECT 'TEST 2: Registrando segundo intento fallido...' as 'PASO 9';
CALL sp_registrar_intento_fallido('test_user', '192.168.1.100');

SELECT 'Resultado después del segundo intento:' as '';
SELECT 
    username,
    intentos_fallidos,
    bloqueado_hasta,
    CASE 
        WHEN intentos_fallidos = 2 THEN '✓ CORRECTO'
        ELSE '✗ ERROR'
    END as validacion
FROM usuario 
WHERE username = 'test_user';

-- TEST 3: Tercer intento fallido (debe bloquear)
SELECT 'TEST 3: Registrando tercer intento fallido (debe bloquear)...' as 'PASO 10';
CALL sp_registrar_intento_fallido('test_user', '192.168.1.100');

SELECT 'Resultado después del tercer intento:' as '';
SELECT 
    username,
    intentos_fallidos,
    bloqueado_hasta,
    TIMESTAMPDIFF(MINUTE, NOW(), bloqueado_hasta) as minutos_bloqueado,
    CASE 
        WHEN intentos_fallidos >= 3 AND bloqueado_hasta > NOW() 
        THEN '✓ USUARIO BLOQUEADO CORRECTAMENTE'
        ELSE '✗ ERROR EN BLOQUEO'
    END as validacion
FROM usuario 
WHERE username = 'test_user';

-- Verificar logs de auditoría
SELECT 'Logs de auditoría generados:' as 'PASO 11';
SELECT 
    tipo_evento,
    username,
    descripcion,
    nivel,
    fecha_hora
FROM auditoria_log 
WHERE username = 'test_user'
ORDER BY fecha_hora;

-- TEST 4: Verificar procedimiento de verificación de bloqueo
SELECT 'TEST 4: Verificando procedimiento de verificación...' as 'PASO 12';
CALL sp_verificar_bloqueo_usuario('test_user', @esta_bloqueado, @bloqueado_hasta);

SELECT 
    @esta_bloqueado as usuario_bloqueado,
    @bloqueado_hasta as bloqueado_hasta,
    CASE 
        WHEN @esta_bloqueado = 1 THEN '✓ VERIFICACIÓN CORRECTA'
        ELSE '✗ ERROR EN VERIFICACIÓN'
    END as validacion;

-- ============================================================================
-- SECCIÓN 4: TEST DE LOGIN EXITOSO (RESETEO DE INTENTOS)
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE LOGIN EXITOSO' as 'TEST';
SELECT '========================================' as '';

-- Primero desbloquear manualmente para poder probar
UPDATE usuario 
SET bloqueado_hasta = NULL 
WHERE username = 'test_user';

SELECT 'TEST 5: Registrando login exitoso...' as 'PASO 13';
CALL sp_registrar_login_exitoso(@test_user_id, 'test_user', '192.168.1.100');

SELECT 'Resultado después de login exitoso:' as '';
SELECT 
    username,
    intentos_fallidos,
    bloqueado_hasta,
    fecha_ultimo_acceso_exitoso,
    CASE 
        WHEN intentos_fallidos = 0 AND bloqueado_hasta IS NULL 
        THEN '✓ RESETEO CORRECTO'
        ELSE '✗ ERROR EN RESETEO'
    END as validacion
FROM usuario 
WHERE username = 'test_user';

-- Verificar log de login exitoso
SELECT 'Log de login exitoso:' as '';
SELECT 
    tipo_evento,
    descripcion,
    fecha_hora
FROM auditoria_log 
WHERE username = 'test_user' 
  AND tipo_evento = 'LOGIN_EXITOSO'
ORDER BY fecha_hora DESC
LIMIT 1;

-- ============================================================================
-- SECCIÓN 5: TEST DE USUARIO INEXISTENTE
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE USUARIO INEXISTENTE' as 'TEST';
SELECT '========================================' as '';

SELECT 'TEST 6: Intentando login con usuario inexistente...' as 'PASO 14';
CALL sp_registrar_intento_fallido('usuario_que_no_existe', '192.168.1.200');

SELECT 'Verificando log con usuario_id NULL:' as '';
SELECT 
    tipo_evento,
    usuario_id,
    username,
    descripcion,
    CASE 
        WHEN usuario_id IS NULL THEN '✓ LOG CORRECTO (usuario_id = NULL)'
        ELSE '✗ ERROR EN LOG'
    END as validacion
FROM auditoria_log 
WHERE username = 'usuario_que_no_existe'
ORDER BY fecha_hora DESC
LIMIT 1;

-- ============================================================================
-- SECCIÓN 6: TEST DE RECOVERY DE CONTRASEÑA
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE RECUPERACIÓN DE CONTRASEÑA' as 'TEST';
SELECT '========================================' as '';

-- Simular creación de token de recuperación
SELECT 'TEST 7: Creando token de recuperación...' as 'PASO 15';

INSERT INTO password_reset_token (usuario_id, token, fecha_creacion, fecha_expiracion, ip_solicitud)
VALUES (
    @test_user_id,
    UUID(),
    NOW(),
    DATE_ADD(NOW(), INTERVAL 1 HOUR),
    '192.168.1.100'
);

SET @token_id = LAST_INSERT_ID();

SELECT 'Token de recuperación creado:' as '';
SELECT 
    t.id,
    u.username,
    t.token,
    t.fecha_expiracion,
    TIMESTAMPDIFF(MINUTE, NOW(), t.fecha_expiracion) as minutos_valido,
    t.usado,
    CASE 
        WHEN t.usado = 0 AND t.fecha_expiracion > NOW() 
        THEN '✓ TOKEN VÁLIDO'
        ELSE '✗ TOKEN INVÁLIDO'
    END as validacion
FROM password_reset_token t
JOIN usuario u ON t.usuario_id = u.id
WHERE t.id = @token_id;

-- Simular creación de contraseña temporal
SELECT 'TEST 8: Creando contraseña temporal...' as 'PASO 16';

INSERT INTO password_temporal (usuario_id, password_temporal_hash, fecha_creacion, fecha_expiracion)
VALUES (
    @test_user_id,
    SHA2('temp_pass_123', 256),
    NOW(),
    DATE_ADD(NOW(), INTERVAL 24 HOUR)
);

SET @temp_pass_id = LAST_INSERT_ID();

SELECT 'Contraseña temporal creada:' as '';
SELECT 
    p.id,
    u.username,
    p.fecha_expiracion,
    TIMESTAMPDIFF(HOUR, NOW(), p.fecha_expiracion) as horas_validas,
    p.usado,
    CASE 
        WHEN p.usado = 0 AND p.fecha_expiracion > NOW() 
        THEN '✓ PASSWORD TEMPORAL VÁLIDA'
        ELSE '✗ PASSWORD TEMPORAL INVÁLIDA'
    END as validacion
FROM password_temporal p
JOIN usuario u ON p.usuario_id = u.id
WHERE p.id = @temp_pass_id;

-- Simular uso del token
SELECT 'TEST 9: Marcando token como usado...' as 'PASO 17';

UPDATE password_reset_token 
SET usado = 1, fecha_uso = NOW() 
WHERE id = @token_id;

SELECT 'Token después de usar:' as '';
SELECT 
    id,
    usado,
    fecha_uso,
    CASE 
        WHEN usado = 1 AND fecha_uso IS NOT NULL 
        THEN '✓ TOKEN MARCADO COMO USADO'
        ELSE '✗ ERROR'
    END as validacion
FROM password_reset_token 
WHERE id = @token_id;

-- ============================================================================
-- SECCIÓN 7: TEST DE VISTAS
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE VISTAS' as 'TEST';
SELECT '========================================' as '';

-- Vista de auditoría detalle
SELECT 'TEST 10: Vista v_auditoria_detalle' as 'PASO 18';
SELECT 
    fecha_hora,
    tipo_evento,
    username,
    email,
    nivel
FROM v_auditoria_detalle 
WHERE username = 'test_user'
ORDER BY fecha_hora DESC
LIMIT 5;

-- Vista de usuarios bloqueados
SELECT 'TEST 11: Vista v_usuarios_bloqueados' as 'PASO 19';
SELECT * FROM v_usuarios_bloqueados
WHERE username = 'test_user';

-- ============================================================================
-- SECCIÓN 8: TEST DE TRIGGERS
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE TRIGGERS' as 'TEST';
SELECT '========================================' as '';

-- TEST 12: Cambio de contraseña (debe generar log automático)
SELECT 'TEST 12: Probando trigger de cambio de contraseña...' as 'PASO 20';

UPDATE usuario 
SET password_hash = 'nuevo_hash_456' 
WHERE username = 'test_user';

SELECT 'Log automático generado por trigger:' as '';
SELECT 
    tipo_evento,
    descripcion,
    fecha_hora,
    CASE 
        WHEN tipo_evento = 'PASSWORD_CHANGED' 
        THEN '✓ TRIGGER FUNCIONANDO'
        ELSE '✗ TRIGGER NO FUNCIONÓ'
    END as validacion
FROM auditoria_log 
WHERE tipo_evento = 'PASSWORD_CHANGED' 
  AND username = 'test_user'
ORDER BY fecha_hora DESC
LIMIT 1;

-- TEST 13: Cambio de rol (debe generar log automático)
SELECT 'TEST 13: Probando trigger de cambio de rol...' as 'PASO 21';

UPDATE usuario 
SET rol = 'admin' 
WHERE username = 'test_user';

SELECT 'Log automático generado por trigger:' as '';
SELECT 
    tipo_evento,
    descripcion,
    datos_adicionales,
    CASE 
        WHEN tipo_evento = 'ROL_CHANGED' 
        THEN '✓ TRIGGER FUNCIONANDO'
        ELSE '✗ TRIGGER NO FUNCIONÓ'
    END as validacion
FROM auditoria_log 
WHERE tipo_evento = 'ROL_CHANGED' 
  AND username = 'test_user'
ORDER BY fecha_hora DESC
LIMIT 1;

-- TEST 14: Desactivación de usuario (debe generar log automático)
SELECT 'TEST 14: Probando trigger de desactivación...' as 'PASO 22';

UPDATE usuario 
SET activo = 0 
WHERE username = 'test_user';

SELECT 'Log automático generado por trigger:' as '';
SELECT 
    tipo_evento,
    descripcion,
    CASE 
        WHEN tipo_evento = 'USUARIO_DESACTIVADO' 
        THEN '✓ TRIGGER FUNCIONANDO'
        ELSE '✗ TRIGGER NO FUNCIONÓ'
    END as validacion
FROM auditoria_log 
WHERE tipo_evento = 'USUARIO_DESACTIVADO' 
  AND username = 'test_user'
ORDER BY fecha_hora DESC
LIMIT 1;

-- ============================================================================
-- SECCIÓN 9: TEST DE LIMPIEZA
-- ============================================================================

SELECT '========================================' as '';
SELECT 'TEST DE LIMPIEZA DE LOGS' as 'TEST';
SELECT '========================================' as '';

-- Contar logs antes de limpieza
SELECT 'TEST 15: Probando limpieza de logs antiguos...' as 'PASO 23';

SELECT COUNT(*) as logs_antes_limpieza 
FROM auditoria_log;

-- Ejecutar limpieza
CALL sp_limpiar_logs_antiguos();

SELECT COUNT(*) as logs_despues_limpieza 
FROM auditoria_log;

-- ============================================================================
-- SECCIÓN 10: RESUMEN DE PRUEBAS
-- ============================================================================

SELECT '========================================' as '';
SELECT 'RESUMEN DE PRUEBAS' as 'RESUMEN';
SELECT '========================================' as '';

-- Contar eventos por tipo
SELECT 
    tipo_evento,
    COUNT(*) as cantidad
FROM auditoria_log
WHERE username = 'test_user'
GROUP BY tipo_evento
ORDER BY cantidad DESC;

-- Estadísticas del usuario de prueba
SELECT 'Estadísticas del usuario de prueba:' as '';
SELECT 
    username,
    email,
    rol,
    activo,
    intentos_fallidos,
    fecha_ultimo_acceso_exitoso,
    bloqueado_hasta
FROM usuario 
WHERE username = 'test_user';

-- Total de logs generados
SELECT 
    'Total de logs generados en todas las pruebas' as descripcion,
    COUNT(*) as cantidad
FROM auditoria_log 
WHERE username IN ('test_user', 'usuario_que_no_existe');

-- ============================================================================
-- SECCIÓN 11: LIMPIEZA DE DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================

SELECT '========================================' as '';
SELECT '¿Desea limpiar los datos de prueba?' as 'LIMPIEZA';
SELECT 'Ejecute las siguientes líneas manualmente si desea limpiar:' as '';
SELECT '========================================' as '';

/*
-- DESCOMENTE ESTAS LÍNEAS PARA LIMPIAR DATOS DE PRUEBA:

DELETE FROM password_reset_token WHERE usuario_id = @test_user_id;
DELETE FROM password_temporal WHERE usuario_id = @test_user_id;
DELETE FROM auditoria_log WHERE username IN ('test_user', 'usuario_que_no_existe');
DELETE FROM usuario WHERE username = 'test_user';

SELECT 'Datos de prueba eliminados ✓' as resultado;
*/

-- ============================================================================
-- FIN DE TESTS
-- ============================================================================

SELECT '========================================' as '';
SELECT '✓ TODOS LOS TESTS COMPLETADOS' as 'FIN';
SELECT '========================================' as '';
SELECT 'Revise los resultados arriba para verificar que todo funciona correctamente.' as 'NOTA';
SELECT 'Si todos los tests muestran ✓, la instalación es exitosa.' as '';
