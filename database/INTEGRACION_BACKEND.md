# 🔌 Guía de Integración Backend - Java/Spring Boot

## 📋 Ejemplos de Código para IntelliJ IDEA

Esta guía proporciona ejemplos de código Java para integrar la base de datos con tu backend.

---

## 🗂️ Estructura de Clases Sugerida

```
src/main/java/com/clinica/
├── controller/
│   ├── AuthController.java
│   ├── AuditoriaController.java
│   └── PasswordRecoveryController.java
├── service/
│   ├── AuthService.java
│   ├── AuditoriaService.java
│   └── PasswordRecoveryService.java
├── repository/
│   ├── UsuarioRepository.java
│   ├── AuditoriaLogRepository.java
│   └── PasswordResetTokenRepository.java
├── model/
│   ├── Usuario.java
│   ├── AuditoriaLog.java
│   ├── PasswordResetToken.java
│   └── PasswordTemporal.java
└── dto/
    ├── LoginRequest.java
    ├── LoginResponse.java
    ├── PasswordRecoveryRequest.java
    └── AuditoriaLogDTO.java
```

---

## 📦 1. Modelos (Entities)

### Usuario.java

```java
package com.clinica.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
@Data
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(unique = true)
    private String email;
    
    private String rol;
    
    @Column(name = "intentos_fallidos")
    private Integer intentosFallidos = 0;
    
    @Column(name = "fecha_ultimo_intento")
    private LocalDateTime fechaUltimoIntento;
    
    @Column(name = "bloqueado_hasta")
    private LocalDateTime bloqueadoHasta;
    
    @Column(name = "ip_ultimo_acceso", length = 45)
    private String ipUltimoAcceso;
    
    @Column(name = "fecha_ultimo_acceso_exitoso")
    private LocalDateTime fechaUltimoAccesoExitoso;
    
    @Column(name = "requiere_cambio_password")
    private Boolean requiereCambioPassword = false;
    
    private Boolean activo = true;
    
    @Column(name = "numerodocumento")
    private String numeroDocumento;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
    
    /**
     * Verifica si el usuario está actualmente bloqueado
     */
    public boolean estaBloqueado() {
        return bloqueadoHasta != null && bloqueadoHasta.isAfter(LocalDateTime.now());
    }
}
```

### AuditoriaLog.java

```java
package com.clinica.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    @Column(name = "tipo_evento", nullable = false, length = 50)
    private String tipoEvento;
    
    @Column(name = "usuario_id")
    private Long usuarioId;
    
    @Column(length = 255)
    private String username;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "datos_adicionales", columnDefinition = "JSON")
    private String datosAdicionales;
    
    @Column(length = 20)
    private String nivel = "INFO";
    
    @Column(length = 50)
    private String modulo;
    
    @PrePersist
    protected void onCreate() {
        fechaHora = LocalDateTime.now();
    }
}
```

### PasswordResetToken.java

```java
package com.clinica.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_token")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;
    
    private Boolean usado = false;
    
    @Column(name = "fecha_uso")
    private LocalDateTime fechaUso;
    
    @Column(name = "ip_solicitud", length = 45)
    private String ipSolicitud;
    
    @PrePersist
    protected void onCreate() {
        if (token == null) {
            token = UUID.randomUUID().toString();
        }
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
        if (fechaExpiracion == null) {
            fechaExpiracion = LocalDateTime.now().plusHours(1);
        }
    }
    
    /**
     * Verifica si el token es válido
     */
    public boolean esValido() {
        return !usado && fechaExpiracion.isAfter(LocalDateTime.now());
    }
}
```

---

## 🔧 2. Servicios

### AuthService.java

```java
package com.clinica.service;

import com.clinica.model.Usuario;
import com.clinica.model.AuditoriaLog;
import com.clinica.repository.UsuarioRepository;
import com.clinica.repository.AuditoriaLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaLogRepository auditoriaLogRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.security.max-intentos-login:3}")
    private int maxIntentosLogin;
    
    @Value("${app.security.tiempo-bloqueo-minutos:5}")
    private int tiempoBloqueoMinutos;
    
    /**
     * Verifica las credenciales y maneja el proceso de login
     */
    @Transactional
    public Usuario login(String username, String password, String ipAddress) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> {
                registrarLoginFallido(null, username, ipAddress, "Usuario no existe");
                return new RuntimeException("Credenciales inválidas");
            });
        
        // Verificar si está bloqueado
        if (usuario.estaBloqueado()) {
            registrarAuditoria(
                "LOGIN_BLOQUEADO",
                usuario.getId(),
                username,
                ipAddress,
                "Intento de login con usuario bloqueado hasta: " + usuario.getBloqueadoHasta(),
                "WARNING",
                "AUTH"
            );
            throw new RuntimeException("Usuario bloqueado hasta: " + usuario.getBloqueadoHasta());
        }
        
        // Verificar contraseña
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            registrarIntentoFallido(usuario, ipAddress);
            throw new RuntimeException("Credenciales inválidas");
        }
        
        // Login exitoso
        registrarLoginExitoso(usuario, ipAddress);
        return usuario;
    }
    
    /**
     * Registra un intento fallido y bloquea si es necesario
     */
    @Transactional
    public void registrarIntentoFallido(Usuario usuario, String ipAddress) {
        usuario.setIntentosFallidos(usuario.getIntentosFallidos() + 1);
        usuario.setFechaUltimoIntento(LocalDateTime.now());
        usuario.setIpUltimoAcceso(ipAddress);
        
        if (usuario.getIntentosFallidos() >= maxIntentosLogin) {
            // Bloquear usuario
            usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(tiempoBloqueoMinutos));
            
            registrarAuditoria(
                "USUARIO_BLOQUEADO",
                usuario.getId(),
                usuario.getUsername(),
                ipAddress,
                String.format("Usuario bloqueado por %d intentos fallidos", usuario.getIntentosFallidos()),
                "WARNING",
                "AUTH"
            );
        } else {
            registrarAuditoria(
                "LOGIN_FALLIDO",
                usuario.getId(),
                usuario.getUsername(),
                ipAddress,
                String.format("Intento de login fallido (%d/%d)", usuario.getIntentosFallidos(), maxIntentosLogin),
                "WARNING",
                "AUTH"
            );
        }
        
        usuarioRepository.save(usuario);
    }
    
    /**
     * Registra un login exitoso y resetea intentos
     */
    @Transactional
    public void registrarLoginExitoso(Usuario usuario, String ipAddress) {
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuario.setFechaUltimoAccesoExitoso(LocalDateTime.now());
        usuario.setIpUltimoAcceso(ipAddress);
        
        usuarioRepository.save(usuario);
        
        registrarAuditoria(
            "LOGIN_EXITOSO",
            usuario.getId(),
            usuario.getUsername(),
            ipAddress,
            "Login exitoso",
            "INFO",
            "AUTH"
        );
    }
    
    /**
     * Registra login fallido sin usuario (usuario no existe)
     */
    @Transactional
    public void registrarLoginFallido(Long usuarioId, String username, String ipAddress, String descripcion) {
        registrarAuditoria(
            "LOGIN_FALLIDO",
            usuarioId,
            username,
            ipAddress,
            descripcion,
            "WARNING",
            "AUTH"
        );
    }
    
    /**
     * Método genérico para registrar en auditoría
     */
    @Transactional
    public void registrarAuditoria(
        String tipoEvento,
        Long usuarioId,
        String username,
        String ipAddress,
        String descripcion,
        String nivel,
        String modulo
    ) {
        AuditoriaLog log = AuditoriaLog.builder()
            .tipoEvento(tipoEvento)
            .usuarioId(usuarioId)
            .username(username)
            .ipAddress(ipAddress)
            .descripcion(descripcion)
            .nivel(nivel)
            .modulo(modulo)
            .fechaHora(LocalDateTime.now())
            .build();
        
        auditoriaLogRepository.save(log);
    }
}
```

### PasswordRecoveryService.java

```java
package com.clinica.service;

import com.clinica.model.Usuario;
import com.clinica.model.PasswordResetToken;
import com.clinica.model.PasswordTemporal;
import com.clinica.repository.UsuarioRepository;
import com.clinica.repository.PasswordResetTokenRepository;
import com.clinica.repository.PasswordTemporalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordRecoveryService {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordTemporalRepository passwordTemporalRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final EmailService emailService; // Asume que tienes un servicio de email
    
    private static final String CARACTERES = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    private static final int LONGITUD_PASSWORD = 12;
    
    /**
     * Solicita recuperación de contraseña
     * IMPORTANTE: Siempre retorna el mismo mensaje por seguridad
     */
    @Transactional
    public String solicitarRecuperacion(String username, String ipAddress) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        
        if (usuarioOpt.isEmpty()) {
            // Usuario NO existe - Registrar en log pero NO mostrar error
            authService.registrarAuditoria(
                "PASSWORD_RECOVERY_FAILED",
                null,
                username,
                ipAddress,
                "Intento de recuperación con usuario inexistente",
                "WARNING",
                "AUTH"
            );
            
            // Retornar el mismo mensaje genérico
            return "Si el usuario existe, se enviará un correo con instrucciones";
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verificar que tenga email
        if (usuario.getEmail() == null || usuario.getEmail().isEmpty()) {
            authService.registrarAuditoria(
                "PASSWORD_RECOVERY_FAILED",
                usuario.getId(),
                username,
                ipAddress,
                "Usuario sin email configurado",
                "WARNING",
                "AUTH"
            );
            return "Si el usuario existe, se enviará un correo con instrucciones";
        }
        
        // Generar contraseña temporal
        String passwordTemporal = generarPasswordTemporal();
        
        // Guardar contraseña temporal en BD
        PasswordTemporal passwordTemp = PasswordTemporal.builder()
            .usuarioId(usuario.getId())
            .passwordTemporalHash(passwordEncoder.encode(passwordTemporal))
            .fechaCreacion(LocalDateTime.now())
            .fechaExpiracion(LocalDateTime.now().plusHours(24))
            .usado(false)
            .build();
        
        passwordTemporalRepository.save(passwordTemp);
        
        // Marcar que debe cambiar contraseña
        usuario.setRequiereCambioPassword(true);
        usuarioRepository.save(usuario);
        
        // Enviar email
        try {
            emailService.enviarPasswordTemporal(usuario.getEmail(), usuario.getUsername(), passwordTemporal);
            
            authService.registrarAuditoria(
                "PASSWORD_RECOVERY_SUCCESS",
                usuario.getId(),
                username,
                ipAddress,
                "Contraseña temporal enviada por email",
                "INFO",
                "AUTH"
            );
        } catch (Exception e) {
            log.error("Error al enviar email de recuperación", e);
            authService.registrarAuditoria(
                "PASSWORD_RECOVERY_ERROR",
                usuario.getId(),
                username,
                ipAddress,
                "Error al enviar email: " + e.getMessage(),
                "ERROR",
                "AUTH"
            );
        }
        
        // SIEMPRE retornar el mismo mensaje (seguridad)
        return "Si el usuario existe, se enviará un correo con instrucciones";
    }
    
    /**
     * Genera una contraseña temporal aleatoria segura
     */
    private String generarPasswordTemporal() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(LONGITUD_PASSWORD);
        
        for (int i = 0; i < LONGITUD_PASSWORD; i++) {
            int index = random.nextInt(CARACTERES.length());
            password.append(CARACTERES.charAt(index));
        }
        
        return password.toString();
    }
    
    /**
     * Valida y usa una contraseña temporal
     */
    @Transactional
    public boolean validarPasswordTemporal(String username, String passwordTemporal) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        if (usuarioOpt.isEmpty()) {
            return false;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Buscar contraseña temporal válida
        Optional<PasswordTemporal> passwordTemp = passwordTemporalRepository
            .findByUsuarioIdAndUsadoFalseAndFechaExpiracionAfter(
                usuario.getId(), 
                LocalDateTime.now()
            );
        
        if (passwordTemp.isEmpty()) {
            return false;
        }
        
        // Verificar password
        if (passwordEncoder.matches(passwordTemporal, passwordTemp.get().getPasswordTemporalHash())) {
            // Marcar como usada
            passwordTemp.get().setUsado(true);
            passwordTemp.get().setFechaUso(LocalDateTime.now());
            passwordTemporalRepository.save(passwordTemp.get());
            
            return true;
        }
        
        return false;
    }
}
```

### AuditoriaService.java

```java
package com.clinica.service;

import com.clinica.dto.AuditoriaLogDTO;
import com.clinica.dto.AuditoriaFiltroDTO;
import com.clinica.repository.AuditoriaLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditoriaService {
    
    private final AuditoriaLogRepository auditoriaLogRepository;
    
    /**
     * Consulta logs con filtros y paginación
     */
    public Page<AuditoriaLogDTO> consultarLogs(AuditoriaFiltroDTO filtro, Pageable pageable) {
        // Implementar consulta con especificaciones o query methods
        return auditoriaLogRepository.findAllWithFilters(
            filtro.getFechaDesde(),
            filtro.getFechaHasta(),
            filtro.getTipoEvento(),
            filtro.getUsername(),
            filtro.getNivel(),
            pageable
        );
    }
    
    /**
     * Obtiene estadísticas de auditoría
     */
    public Map<String, Object> obtenerEstadisticas() {
        // Total de eventos
        long totalEventos = auditoriaLogRepository.count();
        
        // Por tipo de evento
        Map<String, Long> porTipoEvento = auditoriaLogRepository.contarPorTipoEvento();
        
        // Últimas 24 horas
        Map<String, Long> ultimas24h = auditoriaLogRepository.estadisticasUltimas24Horas();
        
        return Map.of(
            "totalEventos", totalEventos,
            "porTipoEvento", porTipoEvento,
            "ultimas24Horas", ultimas24h
        );
    }
    
    /**
     * Obtiene tipos de eventos disponibles
     */
    public List<String> obtenerTiposEventos() {
        return auditoriaLogRepository.findDistinctTipoEvento();
    }
}
```

---

## 🎮 3. Controladores

### AuthController.java

```java
package com.clinica.controller;

import com.clinica.dto.LoginRequest;
import com.clinica.dto.LoginResponse;
import com.clinica.model.Usuario;
import com.clinica.service.AuthService;
import com.clinica.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(
        @RequestBody LoginRequest request,
        HttpServletRequest httpRequest
    ) {
        try {
            String ipAddress = obtenerIPCliente(httpRequest);
            
            Usuario usuario = authService.login(
                request.getUsername(),
                request.getPassword(),
                ipAddress
            );
            
            // Generar JWT
            String token = jwtTokenProvider.generateToken(usuario);
            
            LoginResponse response = LoginResponse.builder()
                .token(token)
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtiene la IP del cliente
     */
    private String obtenerIPCliente(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
```

### PasswordRecoveryController.java

```java
package com.clinica.controller;

import com.clinica.dto.PasswordRecoveryRequest;
import com.clinica.service.PasswordRecoveryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/password-recovery")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PasswordRecoveryController {
    
    private final PasswordRecoveryService passwordRecoveryService;
    
    @PostMapping("/request")
    public ResponseEntity<?> solicitarRecuperacion(
        @RequestBody PasswordRecoveryRequest request,
        HttpServletRequest httpRequest
    ) {
        String ipAddress = obtenerIPCliente(httpRequest);
        
        String mensaje = passwordRecoveryService.solicitarRecuperacion(
            request.getUsername(),
            ipAddress
        );
        
        // SIEMPRE retornar 200 OK con mensaje genérico (seguridad)
        return ResponseEntity.ok(Map.of("mensaje", mensaje));
    }
    
    private String obtenerIPCliente(HttpServletRequest request) {
        // ... mismo código que en AuthController
    }
}
```

### AuditoriaController.java

```java
package com.clinica.controller;

import com.clinica.dto.AuditoriaLogDTO;
import com.clinica.dto.AuditoriaFiltroDTO;
import com.clinica.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuditoriaController {
    
    private final AuditoriaService auditoriaService;
    
    /**
     * Endpoint para consultar logs con filtros
     * GET /api/auditoria/logs?page=0&size=10&tipoEvento=LOGIN_FALLIDO&username=usuario1
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<AuditoriaLogDTO>> consultarLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) LocalDateTime fechaDesde,
        @RequestParam(required = false) LocalDateTime fechaHasta,
        @RequestParam(required = false) String tipoEvento,
        @RequestParam(required = false) String username,
        @RequestParam(required = false) String nivel
    ) {
        AuditoriaFiltroDTO filtro = AuditoriaFiltroDTO.builder()
            .fechaDesde(fechaDesde)
            .fechaHasta(fechaHasta)
            .tipoEvento(tipoEvento)
            .username(username)
            .nivel(nivel)
            .build();
        
        PageRequest pageable = PageRequest.of(
            page, 
            size, 
            Sort.by("fechaHora").descending()
        );
        
        Page<AuditoriaLogDTO> logs = auditoriaService.consultarLogs(filtro, pageable);
        
        return ResponseEntity.ok(logs);
    }
    
    /**
     * Obtiene estadísticas generales
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        return ResponseEntity.ok(auditoriaService.obtenerEstadisticas());
    }
    
    /**
     * Obtiene lista de tipos de eventos
     */
    @GetMapping("/tipos-evento")
    public ResponseEntity<List<String>> obtenerTiposEventos() {
        return ResponseEntity.ok(auditoriaService.obtenerTiposEventos());
    }
}
```

---

## 📄 4. DTOs

### LoginRequest.java

```java
package com.clinica.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
```

### AuditoriaLogDTO.java

```java
package com.clinica.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class AuditoriaLogDTO {
    private Long id;
    private LocalDateTime fechaHora;
    private String tipoEvento;
    private String username;
    private String email;
    private String rol;
    private String ipAddress;
    private String descripcion;
    private String nivel;
    private String modulo;
}
```

---

## ⚙️ 5. Configuración (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/clinica?useSSL=false&serverTimezone=UTC
    username: root
    password: tu_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

app:
  security:
    max-intentos-login: 3
    tiempo-bloqueo-minutos: 5
    jwt-secret: tu_secret_key_super_segura_cambiar_en_produccion
    jwt-expiration-ms: 86400000  # 24 horas
```

---

## 📝 Notas Importantes

1. **Seguridad:** Nunca revelar si un usuario existe o no en recuperación de contraseña
2. **Logs:** Siempre registrar en `auditoria_log` incluso para usuarios inexistentes
3. **IP Address:** Capturar correctamente considerando proxies y balanceadores
4. **Transacciones:** Usar `@Transactional` para garantizar consistencia
5. **Passwords:** Usar BCrypt o similar para hashear contraseñas

---

¿Necesitas más ejemplos de código o ayuda con alguna parte específica de la integración?
