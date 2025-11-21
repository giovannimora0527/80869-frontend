# Diagrama de Base de Datos - Sistema Clínica

## 📊 Modelo Entidad-Relación

### Tablas Principales del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TABLAS DE SEGURIDAD Y AUDITORÍA                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│       USUARIO            │
├──────────────────────────┤
│ PK id                    │
│    username              │
│    password_hash         │
│    email                 │◄──────────┐
│    rol                   │           │
│    intentos_fallidos     │           │
│    fecha_ultimo_intento  │           │
│    bloqueado_hasta       │           │
│    ip_ultimo_acceso      │           │
│    fecha_ultimo_acceso_  │           │
│      exitoso             │           │
│    requiere_cambio_      │           │
│      password            │           │
│    activo                │           │
│    numerodocumento       │           │
│    fecha_creacion        │           │
│    fecha_modificacion    │           │
└──────────────────────────┘           │
         │                             │
         │ 1                           │
         │                             │
         │ *                           │
         ▼                             │
┌──────────────────────────┐           │
│   AUDITORIA_LOG          │           │
├──────────────────────────┤           │
│ PK id                    │           │
│ FK usuario_id (nullable) │           │
│    fecha_hora            │           │
│    tipo_evento           │           │
│    username              │           │
│    ip_address            │           │
│    descripcion           │           │
│    datos_adicionales     │           │
│      (JSON)              │           │
│    nivel                 │           │
│    modulo                │           │
└──────────────────────────┘           │
                                       │
         │ 1                           │
         │                             │
         │                             │
         │ *                           │
         ▼                             │
┌──────────────────────────┐           │
│ PASSWORD_RESET_TOKEN     │           │
├──────────────────────────┤           │
│ PK id                    │           │
│ FK usuario_id            │───────────┘
│    token                 │
│    fecha_creacion        │
│    fecha_expiracion      │
│    usado                 │
│    fecha_uso             │
│    ip_solicitud          │
└──────────────────────────┘

         │ 1
         │
         │
         │ *
         ▼
┌──────────────────────────┐
│   PASSWORD_TEMPORAL      │
├──────────────────────────┤
│ PK id                    │
│ FK usuario_id            │───────────┐
│    password_temporal_    │           │
│      hash                │           │
│    fecha_creacion        │           │
│    fecha_expiracion      │           │
│    usado                 │           │
│    fecha_uso             │           │
└──────────────────────────┘           │
                                       │
                                       │
┌──────────────────────────┐           │
│ SISTEMA_CONFIGURACION    │           │
├──────────────────────────┤           │
│ PK id                    │           │
│    clave                 │           │
│    valor                 │           │
│    descripcion           │           │
│    tipo_dato             │           │
│    categoria             │           │
│    fecha_creacion        │           │
│    fecha_modificacion    │           │
└──────────────────────────┘           │
                                       │
                                       └───────────┐
┌─────────────────────────────────────────────────┐│
│              TABLAS DEL DOMINIO CLÍNICO         ││
└─────────────────────────────────────────────────┘│
                                                   │
┌──────────────────────────┐                      │
│       PACIENTE           │                      │
├──────────────────────────┤                      │
│ PK id                    │                      │
│ FK usuario_id (nullable) │──────────────────────┘
│    tipo_documento        │
│    numero_documento      │
│    nombres               │
│    apellidos             │
│    fecha_nacimiento      │
│    genero                │
│    telefono              │
│    direccion             │
└──────────────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌──────────────────────────┐
│    HISTORIA_MEDICA       │
├──────────────────────────┤
│ PK id                    │
│ FK paciente_id           │
│    fecha_creacion        │
└──────────────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌──────────────────────────┐
│  ANOTACION_HISTORIA      │
├──────────────────────────┤
│ PK id                    │
│ FK historia_id           │
│ FK medico_id             │
│    fecha                 │
│    descripcion           │
└──────────────────────────┘


┌──────────────────────────┐
│         MEDICO           │
├──────────────────────────┤
│ PK id                    │
│ FK especializacion_id    │
│    tipo_documento        │
│    numero_documento      │
│    nombres               │
│    apellidos             │
│    telefono              │
│    registro_profesional  │
└──────────────────────────┘
         │
         │ *
         │
         │ *
         ▼
┌──────────────────────────┐
│   ESPECIALIZACION        │
├──────────────────────────┤
│ PK id                    │
│    nombre                │
│    descripcion           │
│    codigo_               │
│      especializacion     │
└──────────────────────────┘


┌──────────────────────────┐
│         CITA             │
├──────────────────────────┤
│ PK id                    │
│ FK paciente_id           │
│ FK medico_id             │
│    fecha_hora            │
│    estado                │
│    motivo                │
└──────────────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌──────────────────────────┐
│         RECETA           │
├──────────────────────────┤
│ PK id                    │
│ FK cita_id               │
│ FK medicamento_id        │
│    dosis                 │
│    indicaciones          │
│    fecha_creacion_       │
│      registro            │
└──────────────────────────┘


┌──────────────────────────┐
│      MEDICAMENTO         │
├──────────────────────────┤
│ PK id                    │
│    nombre                │
│    descripcion           │
│    presentacion          │
└──────────────────────────┘
         │
         │ 1
         │
         │ *
         ▼
┌──────────────────────────┐
│ INVENTARIO_MEDICAMENTO   │
├──────────────────────────┤
│ PK id                    │
│ FK medicamento_id        │
│    cantidad              │
│    fecha_ingreso         │
│    fecha_vencimiento     │
│    lote                  │
└──────────────────────────┘
```

---

## 🔐 Diagrama de Flujo de Seguridad

### Flujo de Login con Control de Intentos

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PROCESO DE LOGIN                               │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ Usuario ingresa  │
    │ credenciales     │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Buscar usuario por       │
    │ username                 │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ ¿Usuario existe?         │
    └────────┬─────────────────┘
             │
        NO   │   SÍ
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐   ┌──────────────────┐
│Registrar│   │ ¿Está bloqueado? │
│en LOG   │   └────────┬─────────┘
│         │            │
│tipo:    │       NO   │   SÍ
│LOGIN_   │   ┌────────┴────────┐
│FALLIDO  │   │                 │
│         │   ▼                 ▼
│usuario_ │ ┌─────────┐   ┌─────────────┐
│id: NULL │ │Validar  │   │ Retornar    │
└─────────┘ │password │   │ error       │
            └────┬────┘   │ "Usuario    │
                 │        │  bloqueado  │
            NO   │   SÍ   │  hasta..."  │
        ┌────────┴──────┐ │             │
        │               │ │ Registrar   │
        ▼               ▼ │ en LOG      │
 ┌─────────────┐ ┌──────────────┐      │
 │ Incrementar │ │ Resetear     │      │
 │ intentos    │ │ intentos a 0 │      │
 │ fallidos    │ │              │      │
 └──────┬──────┘ │ Actualizar   │      │
        │        │ fecha acceso │      │
        │        │              │      │
        ▼        │ Registrar    │      │
 ┌─────────────┐ │ LOGIN_EXITOSO│      │
 │ ¿Superó max │ │              │      │
 │ intentos?   │ │ Generar JWT  │      │
 └──────┬──────┘ │              │      │
        │        └──────────────┘      │
   NO   │   SÍ                         │
 ┌──────┴──────┐                       │
 │             │                       │
 ▼             ▼                       │
┌───────┐ ┌──────────────┐            │
│Regis- │ │ Bloquear por │            │
│trar   │ │ N minutos    │            │
│LOGIN_ │ │              │            │
│FALLIDO│ │ Registrar    │            │
│       │ │ USUARIO_     │            │
│Retornar│ │ BLOQUEADO   │            │
│error  │ │              │            │
└───────┘ │ Retornar     │            │
          │ error        │            │
          └──────────────┘            │
                                      │
                                      ▼
                              ┌─────────────┐
                              │ Todos los   │
                              │ eventos se  │
                              │ registran en│
                              │ auditoria_  │
                              │ log         │
                              └─────────────┘
```

---

## 🔄 Diagrama de Flujo de Recuperación de Contraseña

```
┌─────────────────────────────────────────────────────────────────────┐
│              PROCESO DE RECUPERACIÓN DE CONTRASEÑA                  │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │ Usuario ingresa  │
    │ username         │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Buscar usuario por       │
    │ username                 │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ ¿Usuario existe?         │
    └────────┬─────────────────┘
             │
        NO   │   SÍ
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐   ┌─────────────────┐
│ Registrar   │   │ Generar         │
│ en LOG      │   │ contraseña      │
│             │   │ temporal        │
│ tipo:       │   │ aleatoria       │
│ PASSWORD_   │   └────────┬────────┘
│ RECOVERY_   │            │
│ FAILED      │            ▼
│             │   ┌─────────────────┐
│ descripción:│   │ Hashear         │
│ "Usuario    │   │ contraseña      │
│  no existe" │   │ temporal        │
│             │   └────────┬────────┘
│ usuario_id: │            │
│ NULL        │            ▼
│             │   ┌─────────────────┐
│ ⚠️ NO       │   │ Guardar en      │
│ mostrar     │   │ password_       │
│ error al    │   │ temporal        │
│ usuario     │   │                 │
└─────────────┘   │ fecha_expiracion│
                  │ = NOW() + 24h   │
      │           └────────┬────────┘
      │                    │
      │                    ▼
      │           ┌─────────────────┐
      │           │ Enviar email    │
      │           │ con contraseña  │
      │           │ temporal        │
      │           └────────┬────────┘
      │                    │
      │                    ▼
      │           ┌─────────────────┐
      │           │ Registrar en    │
      │           │ LOG             │
      │           │                 │
      │           │ tipo:           │
      │           │ PASSWORD_       │
      │           │ RECOVERY_       │
      │           │ SUCCESS         │
      │           │                 │
      │           │ Marcar          │
      │           │ requiere_cambio_│
      │           │ password = 1    │
      │           └────────┬────────┘
      │                    │
      └────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Retornar        │
                  │ mensaje         │
                  │ GENÉRICO        │
                  │                 │
                  │ "Si el usuario  │
                  │  existe, se     │
                  │  enviará un     │
                  │  email..."      │
                  └─────────────────┘
```

---

## 📈 Índices de Base de Datos

### Índices en USUARIO
```sql
- PRIMARY KEY (id)
- UNIQUE INDEX (username)
- INDEX idx_usuario_email (email)
- INDEX idx_usuario_bloqueado (bloqueado_hasta)
```

### Índices en AUDITORIA_LOG
```sql
- PRIMARY KEY (id)
- INDEX idx_fecha_hora (fecha_hora)
- INDEX idx_tipo_evento (tipo_evento)
- INDEX idx_usuario_id (usuario_id)
- INDEX idx_username (username)
- INDEX idx_nivel (nivel)
- INDEX idx_modulo (modulo)
```

### Índices en PASSWORD_RESET_TOKEN
```sql
- PRIMARY KEY (id)
- UNIQUE INDEX (token)
- INDEX idx_usuario_id (usuario_id)
- INDEX idx_fecha_expiracion (fecha_expiracion)
- INDEX idx_usado (usado)
```

---

## 🔗 Relaciones y Constraints

### Foreign Keys

1. **password_reset_token → usuario**
   - `usuario_id` REFERENCES `usuario(id)`
   - ON DELETE CASCADE
   - ON UPDATE CASCADE

2. **password_temporal → usuario**
   - `usuario_id` REFERENCES `usuario(id)`
   - ON DELETE CASCADE
   - ON UPDATE CASCADE

3. **auditoria_log → usuario**
   - `usuario_id` REFERENCES `usuario(id)` (nullable)
   - Para permitir logs de usuarios inexistentes

4. **inventario_medicamento → medicamento**
   - `medicamento_id` REFERENCES `medicamento(id)`
   - ON DELETE CASCADE
   - ON UPDATE CASCADE

5. **medico → especializacion**
   - `especializacion_id` REFERENCES `especializacion(id)`

---

## 📋 Tipos de Datos JSON

### auditoria_log.datos_adicionales (JSON)

Estructura de ejemplo:
```json
{
  "rol_anterior": "user",
  "rol_nuevo": "admin",
  "cambios": ["campo1", "campo2"],
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "navegador": "Chrome"
  }
}
```

---

## 🎯 Estrategia de Particionamiento (Opcional - Futuro)

Para tablas de alto volumen como `auditoria_log`, se puede considerar:

```sql
-- Particionamiento por rango de fechas (mensual)
ALTER TABLE auditoria_log 
PARTITION BY RANGE (YEAR(fecha_hora) * 100 + MONTH(fecha_hora)) (
    PARTITION p202511 VALUES LESS THAN (202512),
    PARTITION p202512 VALUES LESS THAN (202601),
    PARTITION p202601 VALUES LESS THAN (202602),
    ...
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

---

## 📊 Estimación de Volumen de Datos

| Tabla | Registros Iniciales | Crecimiento Mensual Estimado |
|-------|---------------------|------------------------------|
| usuario | 100 | 10-20 |
| auditoria_log | 0 | 10,000-50,000 |
| password_reset_token | 0 | 50-100 |
| password_temporal | 0 | 50-100 |
| sistema_configuracion | 10 | 1-2 |
| paciente | 1,000 | 50-100 |
| cita | 500 | 200-400 |
| medicamento | 100 | 5-10 |

**Recomendación:** Implementar limpieza automática de `auditoria_log` después de 90 días para optimizar rendimiento.

---

## 🔧 Triggers Configurados

### 1. trg_usuario_after_update
- **Evento:** AFTER UPDATE on usuario
- **Función:** Auditar cambios en contraseña, rol y estado
- **Impacto:** Registro automático en auditoria_log

---

## 📝 Convenciones de Nomenclatura

- **Tablas:** snake_case, plural (ej: `auditoria_log`)
- **Columnas:** snake_case (ej: `fecha_hora`)
- **Índices:** `idx_tabla_columna` (ej: `idx_usuario_email`)
- **Foreign Keys:** `fk_tabla_referencia` (ej: `fk_password_reset_usuario`)
- **Procedimientos:** `sp_verbo_sustantivo` (ej: `sp_registrar_login_exitoso`)
- **Vistas:** `v_descripcion` (ej: `v_auditoria_detalle`)
- **Triggers:** `trg_tabla_momento_accion` (ej: `trg_usuario_after_update`)

---

Este diagrama y documentación están actualizados al 19 de noviembre de 2025.
