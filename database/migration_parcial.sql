-- ============================================================================
-- SCRIPT DE MIGRACIÓN PARA EXAMEN FINAL - PROGRAMACIÓN WEB
-- Autor: Sistema de Gestión Clínica
-- Fecha: 2025-11-19
-- Descripción: Agrega funcionalidades de auditoría, seguridad y recuperación
--              de contraseña al sistema existente
-- ============================================================================

USE `clinica`;

-- ============================================================================
-- 1. MODIFICACIONES A LA TABLA USUARIO
-- ============================================================================
-- Agregar campos necesarios para recuperación de contraseña y control de acceso

ALTER TABLE `usuario`
ADD COLUMN `email` VARCHAR(255) NULL AFTER `username`,
ADD COLUMN `intentos_fallidos` INT DEFAULT 0 COMMENT 'Contador de intentos fallidos de login',
ADD COLUMN `ultimo_intento` DATETIME NULL COMMENT 'Fecha del último intento de login',
ADD COLUMN `bloqueado_hasta` DATETIME NULL COMMENT 'Fecha hasta la cual el usuario está bloqueado',
ADD COLUMN `ip_ultima_conexion` VARCHAR(45) NULL COMMENT 'IP de la última conexión',
ADD COLUMN `ultimo_acceso` DATETIME NULL COMMENT 'Fecha del último acceso exitoso',
ADD COLUMN `password_reset_token` VARCHAR(255) NULL COMMENT 'Token de recuperación de contraseña',
ADD COLUMN `token_expiracion` DATETIME NULL COMMENT 'Fecha de expiración del token',
ADD COLUMN `requiere_cambio_password` TINYINT(1) DEFAULT 0 COMMENT 'Indica si debe cambiar contraseña en próximo login',
ADD COLUMN `fecha_modificacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuario_email ON `usuario`(`email`);
CREATE INDEX idx_usuario_username ON `usuario`(`username`);
CREATE INDEX idx_usuario_bloqueado ON `usuario`(`bloqueado_hasta`);

-- ============================================================================
-- 2. TABLA DE AUDITORÍA (LOGS DEL SISTEMA)
-- ============================================================================
-- Registra todos los eventos importantes del sistema

DROP TABLE IF EXISTS `auditoria_log`;
CREATE TABLE `auditoria_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo_evento` VARCHAR(50) NOT NULL COMMENT 'LOGIN_EXITOSO, LOGIN_FALLIDO, PASSWORD_RECOVERY, etc.',
  `usuario_id` BIGINT NULL COMMENT 'ID del usuario (puede ser NULL si el usuario no existe)',
  `username` VARCHAR(255) NULL COMMENT 'Nombre de usuario ingresado',
  `ip_address` VARCHAR(45) NULL COMMENT 'Dirección IP del cliente',
  `descripcion` TEXT NULL COMMENT 'Descripción detallada del evento',
  `datos_adicionales` JSON NULL COMMENT 'Información adicional en formato JSON',
  `nivel` VARCHAR(20) DEFAULT 'INFO' COMMENT 'INFO, WARNING, ERROR, CRITICAL',
  `modulo` VARCHAR(50) NULL COMMENT 'Módulo del sistema que generó el log',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `idx_fecha_hora` (`fecha_hora`),
  KEY `idx_tipo_evento` (`tipo_evento`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_username` (`username`),
  KEY `idx_nivel` (`nivel`),
  KEY `idx_modulo` (`modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Registro de auditoría de todos los eventos del sistema';

-- ============================================================================
-- 3. TABLA DE TOKENS DE RECUPERACIÓN DE CONTRASEÑA
-- ============================================================================
-- Almacena tokens temporales para recuperación de contraseña

DROP TABLE IF EXISTS `password_reset_token`;
CREATE TABLE `password_reset_token` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT NOT NULL,
  `token` VARCHAR(255) NOT NULL COMMENT 'Token único de recuperación',
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` DATETIME NOT NULL COMMENT 'Fecha de expiración del token (típicamente 1 hora)',
  `usado` TINYINT(1) DEFAULT 0 COMMENT 'Indica si el token ya fue utilizado',
  `fecha_uso` DATETIME NULL COMMENT 'Fecha en que se utilizó el token',
  `ip_solicitud` VARCHAR(45) NULL COMMENT 'IP desde donde se solicitó',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_fecha_expiracion` (`fecha_expiracion`),
  KEY `idx_usado` (`usado`),
  CONSTRAINT `fk_password_reset_usuario` 
    FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuario` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Tokens para recuperación de contraseña';

-- ============================================================================
-- 4. TABLA DE CONTRASEÑAS TEMPORALES
-- ============================================================================
-- Almacena contraseñas temporales enviadas por email

DROP TABLE IF EXISTS `password_temporal`;
CREATE TABLE `password_temporal` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` BIGINT NOT NULL,
  `password_temporal_hash` VARCHAR(255) NOT NULL COMMENT 'Hash de la contraseña temporal',
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` DATETIME NOT NULL COMMENT 'Fecha de expiración (24 horas típicamente)',
  `usado` TINYINT(1) DEFAULT 0 COMMENT 'Indica si ya se usó para login',
  `fecha_uso` DATETIME NULL COMMENT 'Fecha en que se usó',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_fecha_expiracion` (`fecha_expiracion`),
  CONSTRAINT `fk_password_temporal_usuario` 
    FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuario` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Contraseñas temporales para recuperación';

-- ============================================================================
-- 5. TABLA DE CONFIGURACIÓN DEL SISTEMA
-- ============================================================================
-- Parámetros configurables del sistema

DROP TABLE IF EXISTS `sistema_configuracion`;
CREATE TABLE `sistema_configuracion` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(100) NOT NULL COMMENT 'Clave de configuración',
  `valor` VARCHAR(500) NOT NULL COMMENT 'Valor de la configuración',
  `descripcion` TEXT NULL COMMENT 'Descripción del parámetro',
  `tipo_dato` VARCHAR(20) DEFAULT 'STRING' COMMENT 'STRING, INTEGER, BOOLEAN, JSON',
  `categoria` VARCHAR(50) NULL COMMENT 'Categoría de la configuración',
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `clave` (`clave`),
  KEY `idx_categoria` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Configuraciones parametrizables del sistema';

-- ============================================================================
-- 6. INSERTAR CONFIGURACIONES INICIALES DEL SISTEMA
-- ============================================================================

INSERT INTO `sistema_configuracion` (`clave`, `valor`, `descripcion`, `tipo_dato`, `categoria`) VALUES
('MAX_INTENTOS_LOGIN', '3', 'Número máximo de intentos fallidos de login antes de bloquear', 'INTEGER', 'SEGURIDAD'),
('TIEMPO_BLOQUEO_MINUTOS', '5', 'Tiempo de bloqueo en minutos después de exceder intentos', 'INTEGER', 'SEGURIDAD'),
('TOKEN_EXPIRACION_HORAS', '1', 'Tiempo de expiración del token de recuperación en horas', 'INTEGER', 'SEGURIDAD'),
('PASSWORD_TEMPORAL_EXPIRACION_HORAS', '24', 'Tiempo de expiración de contraseña temporal en horas', 'INTEGER', 'SEGURIDAD'),
('ENVIAR_EMAIL_RECUPERACION', 'true', 'Habilitar envío de emails para recuperación', 'BOOLEAN', 'EMAIL'),
('SMTP_HOST', 'smtp.gmail.com', 'Servidor SMTP para envío de emails', 'STRING', 'EMAIL'),
('SMTP_PORT', '587', 'Puerto SMTP', 'INTEGER', 'EMAIL'),
('EMAIL_FROM', 'noreply@clinica.com', 'Email remitente del sistema', 'STRING', 'EMAIL'),
('HABILITAR_AUDITORIA', 'true', 'Habilitar registro de auditoría', 'BOOLEAN', 'AUDITORIA'),
('DIAS_RETENCION_LOGS', '90', 'Días de retención de logs de auditoría', 'INTEGER', 'AUDITORIA');

-- ============================================================================
-- 7. ACTUALIZAR DATOS EXISTENTES DE USUARIOS
-- ============================================================================
-- Agregar emails a los usuarios existentes (ejemplo)

UPDATE `usuario` SET `email` = 'usuario1@clinica.com' WHERE `id` = 1;
UPDATE `usuario` SET `email` = 'usuario2@clinica.com' WHERE `id` = 2;
UPDATE `usuario` SET `email` = 'usuario3@clinica.com' WHERE `id` = 3;

-- ============================================================================
-- 8. DATOS DE PRUEBA PARA AUDITORÍA
-- ============================================================================
-- Insertar algunos logs de ejemplo para pruebas

INSERT INTO `auditoria_log` 
  (`tipo_evento`, `usuario_id`, `username`, `ip_address`, `descripcion`, `nivel`, `modulo`) 
VALUES
  ('LOGIN_EXITOSO', 1, 'usuario1', '192.168.1.100', 'Login exitoso del usuario', 'INFO', 'AUTH'),
  ('LOGIN_FALLIDO', NULL, 'usuario_inexistente', '192.168.1.101', 'Intento de login con usuario inexistente', 'WARNING', 'AUTH'),
  ('PASSWORD_RECOVERY_REQUEST', 1, 'usuario1', '192.168.1.100', 'Solicitud de recuperación de contraseña', 'INFO', 'AUTH'),
  ('USUARIO_BLOQUEADO', 2, 'usuario2', '192.168.1.102', 'Usuario bloqueado por múltiples intentos fallidos', 'WARNING', 'AUTH');

-- ============================================================================
-- 9. VISTAS ÚTILES PARA CONSULTAS
-- ============================================================================

-- Vista para consultar logs de auditoría con información del usuario
DROP VIEW IF EXISTS `v_auditoria_detalle`;
CREATE VIEW `v_auditoria_detalle` AS
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
    a.modulo,
    a.datos_adicionales
FROM 
    auditoria_log a
LEFT JOIN 
    usuario u ON a.usuario_id = u.id
ORDER BY 
    a.fecha_hora DESC;

-- Vista para monitorear usuarios bloqueados
DROP VIEW IF EXISTS `v_usuarios_bloqueados`;
CREATE VIEW `v_usuarios_bloqueados` AS
SELECT 
    id,
    username,
    email,
    intentos_fallidos,
    ultimo_intento,
    bloqueado_hasta,
    ip_ultima_conexion,
    CASE 
        WHEN bloqueado_hasta IS NULL THEN 'NO BLOQUEADO'
        WHEN bloqueado_hasta > NOW() THEN 'BLOQUEADO'
        ELSE 'BLOQUEO EXPIRADO'
    END AS estado_bloqueo
FROM 
    usuario
WHERE 
    intentos_fallidos > 0 OR bloqueado_hasta IS NOT NULL
ORDER BY 
    ultimo_intento DESC;

-- ============================================================================
-- 10. PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================================

-- Procedimiento para registrar intento de login fallido
DROP PROCEDURE IF EXISTS `sp_registrar_intento_fallido`;
DELIMITER $$
CREATE PROCEDURE `sp_registrar_intento_fallido`(
    IN p_username VARCHAR(255),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    DECLARE v_usuario_id BIGINT;
    DECLARE v_intentos INT;
    DECLARE v_max_intentos INT;
    DECLARE v_tiempo_bloqueo INT;
    
    -- Obtener configuración
    SELECT CAST(valor AS SIGNED) INTO v_max_intentos 
    FROM sistema_configuracion WHERE clave = 'MAX_INTENTOS_LOGIN';
    
    SELECT CAST(valor AS SIGNED) INTO v_tiempo_bloqueo 
    FROM sistema_configuracion WHERE clave = 'TIEMPO_BLOQUEO_MINUTOS';
    
    -- Buscar usuario
    SELECT id INTO v_usuario_id FROM usuario WHERE username = p_username;
    
    IF v_usuario_id IS NOT NULL THEN
        -- Incrementar intentos fallidos
        UPDATE usuario 
        SET 
            intentos_fallidos = intentos_fallidos + 1,
            ultimo_intento = NOW(),
            ip_ultima_conexion = p_ip_address
        WHERE id = v_usuario_id;
        
        -- Obtener intentos actuales
        SELECT intentos_fallidos INTO v_intentos 
        FROM usuario WHERE id = v_usuario_id;
        
        -- Si supera el máximo, bloquear
        IF v_intentos >= v_max_intentos THEN
            UPDATE usuario 
            SET bloqueado_hasta = DATE_ADD(NOW(), INTERVAL v_tiempo_bloqueo MINUTE)
            WHERE id = v_usuario_id;
            
            -- Registrar en auditoría
            INSERT INTO auditoria_log 
                (tipo_evento, usuario_id, username, ip_address, descripcion, nivel, modulo)
            VALUES 
                ('USUARIO_BLOQUEADO', v_usuario_id, p_username, p_ip_address, 
                 CONCAT('Usuario bloqueado por ', v_intentos, ' intentos fallidos'), 
                 'WARNING', 'AUTH');
        ELSE
            -- Registrar intento fallido
            INSERT INTO auditoria_log 
                (tipo_evento, usuario_id, username, ip_address, descripcion, nivel, modulo)
            VALUES 
                ('LOGIN_FALLIDO', v_usuario_id, p_username, p_ip_address, 
                 CONCAT('Intento de login fallido (', v_intentos, '/', v_max_intentos, ')'), 
                 'WARNING', 'AUTH');
        END IF;
    ELSE
        -- Usuario no existe - registrar en auditoría sin usuario_id
        INSERT INTO auditoria_log 
            (tipo_evento, usuario_id, username, ip_address, descripcion, nivel, modulo)
        VALUES 
            ('LOGIN_FALLIDO', NULL, p_username, p_ip_address, 
             'Intento de login con usuario inexistente', 
             'WARNING', 'AUTH');
    END IF;
END$$
DELIMITER ;

-- Procedimiento para registrar login exitoso
DROP PROCEDURE IF EXISTS `sp_registrar_login_exitoso`;
DELIMITER $$
CREATE PROCEDURE `sp_registrar_login_exitoso`(
    IN p_usuario_id BIGINT,
    IN p_username VARCHAR(255),
    IN p_ip_address VARCHAR(45)
)
BEGIN
    -- Resetear intentos fallidos y actualizar último acceso
    UPDATE usuario 
    SET 
        intentos_fallidos = 0,
        bloqueado_hasta = NULL,
        ultimo_acceso = NOW(),
        ip_ultima_conexion = p_ip_address
    WHERE id = p_usuario_id;
    
    -- Registrar en auditoría
    INSERT INTO auditoria_log 
        (tipo_evento, usuario_id, username, ip_address, descripcion, nivel, modulo)
    VALUES 
        ('LOGIN_EXITOSO', p_usuario_id, p_username, p_ip_address, 
         'Login exitoso', 'INFO', 'AUTH');
END$$
DELIMITER ;

-- Procedimiento para verificar si usuario está bloqueado
DROP PROCEDURE IF EXISTS `sp_verificar_bloqueo_usuario`;
DELIMITER $$
CREATE PROCEDURE `sp_verificar_bloqueo_usuario`(
    IN p_username VARCHAR(255),
    OUT p_bloqueado BOOLEAN,
    OUT p_bloqueado_hasta DATETIME
)
BEGIN
    SELECT 
        CASE 
            WHEN bloqueado_hasta IS NOT NULL AND bloqueado_hasta > NOW() 
            THEN TRUE 
            ELSE FALSE 
        END,
        bloqueado_hasta
    INTO p_bloqueado, p_bloqueado_hasta
    FROM usuario 
    WHERE username = p_username;
END$$
DELIMITER ;

-- Procedimiento para limpiar logs antiguos
DROP PROCEDURE IF EXISTS `sp_limpiar_logs_antiguos`;
DELIMITER $$
CREATE PROCEDURE `sp_limpiar_logs_antiguos`()
BEGIN
    DECLARE v_dias_retencion INT;
    
    -- Obtener días de retención
    SELECT CAST(valor AS SIGNED) INTO v_dias_retencion 
    FROM sistema_configuracion WHERE clave = 'DIAS_RETENCION_LOGS';
    
    -- Eliminar logs antiguos
    DELETE FROM auditoria_log 
    WHERE fecha_hora < DATE_SUB(NOW(), INTERVAL v_dias_retencion DAY);
    
    -- Registrar limpieza
    INSERT INTO auditoria_log 
        (tipo_evento, descripcion, nivel, modulo)
    VALUES 
        ('LIMPIEZA_LOGS', 
         CONCAT('Limpieza de logs anteriores a ', v_dias_retencion, ' días'), 
         'INFO', 'SISTEMA');
END$$
DELIMITER ;

-- ============================================================================
-- 11. TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================================================

-- Trigger para auditar cambios en usuarios
DROP TRIGGER IF EXISTS `trg_usuario_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_usuario_after_update`
AFTER UPDATE ON `usuario`
FOR EACH ROW
BEGIN
    -- Registrar cambio de contraseña
    IF OLD.password_hash != NEW.password_hash THEN
        INSERT INTO auditoria_log 
            (tipo_evento, usuario_id, username, descripcion, nivel, modulo)
        VALUES 
            ('PASSWORD_CHANGED', NEW.id, NEW.username, 
             'Contraseña modificada', 'INFO', 'AUTH');
    END IF;
    
    -- Registrar cambio de rol
    IF OLD.rol != NEW.rol THEN
        INSERT INTO auditoria_log 
            (tipo_evento, usuario_id, username, descripcion, nivel, modulo, datos_adicionales)
        VALUES 
            ('ROL_CHANGED', NEW.id, NEW.username, 
             CONCAT('Rol modificado de ', OLD.rol, ' a ', NEW.rol), 
             'WARNING', 'AUTH',
             JSON_OBJECT('rol_anterior', OLD.rol, 'rol_nuevo', NEW.rol));
    END IF;
    
    -- Registrar desactivación de usuario
    IF OLD.activo = 1 AND NEW.activo = 0 THEN
        INSERT INTO auditoria_log 
            (tipo_evento, usuario_id, username, descripcion, nivel, modulo)
        VALUES 
            ('USUARIO_DESACTIVADO', NEW.id, NEW.username, 
             'Usuario desactivado', 'WARNING', 'AUTH');
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- VERIFICACIÓN DE LA MIGRACIÓN
-- ============================================================================

-- Mostrar resumen de la migración
SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' AS status;

SELECT 'Tablas creadas/modificadas:' AS info;
SELECT TABLE_NAME, TABLE_COMMENT 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'clinica' 
  AND TABLE_NAME IN ('usuario', 'auditoria_log', 'password_reset_token', 
                     'password_temporal', 'sistema_configuracion')
ORDER BY TABLE_NAME;

SELECT 'Procedimientos almacenados creados:' AS info;
SHOW PROCEDURE STATUS WHERE Db = 'clinica';

SELECT 'Vistas creadas:' AS info;
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.VIEWS 
WHERE TABLE_SCHEMA = 'clinica';

-- ============================================================================
-- DATOS DE PRUEBA - USUARIO ADMIN
-- ============================================================================
-- Insertar usuario de prueba con contraseña: password123

INSERT INTO usuario (username, password_hash, email, rol, fecha_creacion, activo, intentos_fallidos)
VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
 'admin@clinica.com', 'ADMIN', NOW(), 1, 0)
ON DUPLICATE KEY UPDATE 
  email = 'admin@clinica.com',
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- ============================================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ============================================================================
