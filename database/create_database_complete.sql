-- ============================================================================
-- SCRIPT COMPLETO DE BASE DE DATOS - SISTEMA CLÍNICA
-- Incluye: Todas las tablas del sistema + Auditoría + Seguridad
-- Autor: Sistema de Gestión Clínica
-- Fecha: 2025-11-21
-- ============================================================================

-- Eliminar base de datos si existe (CUIDADO: Elimina todos los datos)
DROP DATABASE IF EXISTS `clinica`;

-- Crear base de datos
CREATE DATABASE `clinica` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_0900_ai_ci;

USE `clinica`;

-- ============================================================================
-- 1. TABLA USUARIO
-- ============================================================================
CREATE TABLE `usuario` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `rol` VARCHAR(50) NOT NULL COMMENT 'ADMIN, MEDICO, PACIENTE, RECEPCIONISTA',
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Campos de seguridad
  `intentos_fallidos` INT DEFAULT 0 COMMENT 'Contador de intentos fallidos de login',
  `ultimo_intento` DATETIME NULL COMMENT 'Fecha del último intento de login',
  `bloqueado_hasta` DATETIME NULL COMMENT 'Fecha hasta la cual el usuario está bloqueado',
  `ip_ultima_conexion` VARCHAR(45) NULL COMMENT 'IP de la última conexión',
  `ultimo_acceso` DATETIME NULL COMMENT 'Fecha del último acceso exitoso',
  `password_reset_token` VARCHAR(255) NULL COMMENT 'Token de recuperación de contraseña',
  `token_expiracion` DATETIME NULL COMMENT 'Fecha de expiración del token',
  `requiere_cambio_password` TINYINT(1) DEFAULT 0 COMMENT 'Indica si debe cambiar contraseña en próximo login',
  `fecha_modificacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_usuario_email` (`email`),
  KEY `idx_usuario_bloqueado` (`bloqueado_hasta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Usuarios del sistema';

-- ============================================================================
-- 2. TABLA ESPECIALIZACION
-- ============================================================================
CREATE TABLE `especializacion` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `codigo_especializacion` VARCHAR(50) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `codigo_especializacion` (`codigo_especializacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Especialidades médicas';

-- ============================================================================
-- 3. TABLA MEDICO
-- ============================================================================
CREATE TABLE `medico` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_documento` VARCHAR(20) NOT NULL COMMENT 'CC, CE, TI, etc.',
  `numero_documento` VARCHAR(50) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NULL,
  `registro_profesional` VARCHAR(50) NULL COMMENT 'Número de registro médico',
  `especializacion_id` BIGINT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_documento` (`numero_documento`),
  KEY `fk_medico_especializacion` (`especializacion_id`),
  CONSTRAINT `fk_medico_especializacion` 
    FOREIGN KEY (`especializacion_id`) 
    REFERENCES `especializacion` (`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Médicos del sistema';

-- ============================================================================
-- 4. TABLA PACIENTE
-- ============================================================================
CREATE TABLE `paciente` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NULL COMMENT 'Relación con usuario si tiene cuenta',
  `tipo_documento` VARCHAR(20) NOT NULL,
  `numero_documento` VARCHAR(50) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `fecha_nacimiento` DATE NULL,
  `genero` VARCHAR(20) NULL COMMENT 'MASCULINO, FEMENINO, OTRO',
  `telefono` VARCHAR(20) NULL,
  `direccion` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_documento` (`numero_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Pacientes del sistema';

-- ============================================================================
-- 5. TABLA CITA
-- ============================================================================
CREATE TABLE `cita` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha_hora` DATETIME NOT NULL,
  `estado` VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' COMMENT 'PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA',
  `motivo` TEXT NULL,
  `paciente_id` INT NOT NULL,
  `medico_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cita_paciente` (`paciente_id`),
  KEY `fk_cita_medico` (`medico_id`),
  KEY `idx_cita_fecha` (`fecha_hora`),
  KEY `idx_cita_estado` (`estado`),
  CONSTRAINT `fk_cita_paciente` 
    FOREIGN KEY (`paciente_id`) 
    REFERENCES `paciente` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cita_medico` 
    FOREIGN KEY (`medico_id`) 
    REFERENCES `medico` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Citas médicas';

-- ============================================================================
-- 6. TABLA MEDICAMENTO
-- ============================================================================
CREATE TABLE `medicamento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `presentacion` VARCHAR(100) NULL COMMENT 'Tableta, Jarabe, Inyectable, etc.',
  `fecha_compra` DATE NOT NULL,
  `fecha_vence` DATE NOT NULL,
  `fecha_creacion_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion_registro` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_medicamento_vencimiento` (`fecha_vence`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Medicamentos disponibles';

-- ============================================================================
-- 7. TABLA RECETA
-- ============================================================================
CREATE TABLE `receta` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cita_id` INT NOT NULL,
  `medicamento_id` INT NOT NULL,
  `dosis` TEXT NOT NULL COMMENT 'Ejemplo: 1 tableta cada 8 horas',
  `indicaciones` TEXT NULL,
  `fecha_creacion_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion_registro` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_receta_cita` (`cita_id`),
  KEY `fk_receta_medicamento` (`medicamento_id`),
  CONSTRAINT `fk_receta_cita` 
    FOREIGN KEY (`cita_id`) 
    REFERENCES `cita` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_receta_medicamento` 
    FOREIGN KEY (`medicamento_id`) 
    REFERENCES `medicamento` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Recetas médicas';

-- ============================================================================
-- 8. TABLA SESSION (JWT)
-- ============================================================================
CREATE TABLE `session` (
  `session_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `fecha_ini_sesion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_expiracion` DATETIME NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `fk_session_usuario` (`user_id`),
  KEY `idx_session_token` (`token`(255)),
  CONSTRAINT `fk_session_usuario` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `usuario` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Sesiones activas de usuarios';

-- ============================================================================
-- 9. TABLA AUDITORIA_LOG
-- ============================================================================
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
-- 10. TABLA PASSWORD_RESET_TOKEN
-- ============================================================================
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
-- 11. TABLA PASSWORD_TEMPORAL
-- ============================================================================
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
-- 12. TABLA SISTEMA_CONFIGURACION
-- ============================================================================
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
-- INSERTAR CONFIGURACIONES INICIALES
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
-- DATOS INICIALES - ESPECIALIZACIONES
-- ============================================================================
INSERT INTO `especializacion` (`nombre`, `descripcion`, `codigo_especializacion`) VALUES
('Medicina General', 'Atención médica primaria y general', 'MG-001'),
('Pediatría', 'Especialidad médica dedicada al cuidado de niños', 'PED-001'),
('Cardiología', 'Especialidad enfocada en el sistema cardiovascular', 'CAR-001'),
('Dermatología', 'Tratamiento de enfermedades de la piel', 'DER-001'),
('Ginecología', 'Especialidad en salud femenina', 'GIN-001'),
('Traumatología', 'Tratamiento de lesiones del sistema musculoesquelético', 'TRA-001'),
('Oftalmología', 'Especialidad en salud ocular', 'OFT-001'),
('Psiquiatría', 'Tratamiento de trastornos mentales', 'PSI-001');

-- ============================================================================
-- DATOS INICIALES - USUARIOS
-- ============================================================================
-- Password para todos: password123
INSERT INTO `usuario` (`username`, `password_hash`, `email`, `rol`, `activo`, `intentos_fallidos`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@clinica.com', 'ADMIN', 1, 0),
('medico1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'medico1@clinica.com', 'MEDICO', 1, 0),
('recepcion', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'recepcion@clinica.com', 'RECEPCIONISTA', 1, 0);

-- ============================================================================
-- DATOS INICIALES - MÉDICOS
-- ============================================================================
INSERT INTO `medico` (`tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `telefono`, `registro_profesional`, `especializacion_id`) VALUES
('CC', '1234567890', 'Juan Carlos', 'Pérez López', '3001234567', 'MP-12345', 1),
('CC', '9876543210', 'María Elena', 'González Ruiz', '3107654321', 'MP-67890', 2),
('CC', '5555555555', 'Pedro Antonio', 'Martínez Silva', '3159876543', 'MP-11111', 3);

-- ============================================================================
-- DATOS INICIALES - PACIENTES
-- ============================================================================
INSERT INTO `paciente` (`tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `fecha_nacimiento`, `genero`, `telefono`, `direccion`) VALUES
('CC', '1111111111', 'Ana María', 'Rodríguez Castro', '1990-05-15', 'FEMENINO', '3201234567', 'Calle 123 #45-67'),
('TI', '2222222222', 'Carlos Eduardo', 'Sánchez Pérez', '2010-08-20', 'MASCULINO', '3107654321', 'Carrera 45 #12-34'),
('CC', '3333333333', 'Laura Patricia', 'Gómez Vargas', '1985-11-30', 'FEMENINO', '3159876543', 'Avenida 68 #23-45');

-- ============================================================================
-- DATOS INICIALES - MEDICAMENTOS
-- ============================================================================
INSERT INTO `medicamento` (`nombre`, `descripcion`, `presentacion`, `fecha_compra`, `fecha_vence`) VALUES
('Acetaminofén 500mg', 'Analgésico y antipirético', 'Tableta', '2024-01-15', '2026-01-15'),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Tableta', '2024-02-20', '2026-02-20'),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Cápsula', '2024-03-10', '2025-12-31'),
('Loratadina 10mg', 'Antihistamínico para alergias', 'Tableta', '2024-04-05', '2026-04-05');

-- ============================================================================
-- VISTAS
-- ============================================================================

-- Vista para logs de auditoría con información del usuario
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

-- Vista para citas con información completa
DROP VIEW IF EXISTS `v_citas_completas`;
CREATE VIEW `v_citas_completas` AS
SELECT 
    c.id,
    c.fecha_hora,
    c.estado,
    c.motivo,
    CONCAT(p.nombres, ' ', p.apellidos) AS paciente_nombre,
    p.numero_documento AS paciente_documento,
    p.telefono AS paciente_telefono,
    CONCAT(m.nombres, ' ', m.apellidos) AS medico_nombre,
    e.nombre AS especializacion
FROM 
    cita c
    INNER JOIN paciente p ON c.paciente_id = p.id
    INNER JOIN medico m ON c.medico_id = m.id
    LEFT JOIN especializacion e ON m.especializacion_id = e.id
ORDER BY 
    c.fecha_hora DESC;

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS
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
-- TRIGGERS
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
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT 'BASE DE DATOS CREADA EXITOSAMENTE' AS status;

SELECT 'Tablas creadas:' AS info;
SHOW TABLES;

SELECT 'Usuarios insertados:' AS info;
SELECT username, email, rol FROM usuario;

SELECT 'Especializaciones insertadas:' AS info;
SELECT nombre, codigo_especializacion FROM especializacion;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
