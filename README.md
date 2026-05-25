# 🚀 CI/CD Pipeline — Documentación Visual de Arquitectura & Troubleshooting

> Manual del pipeline automatizado de **Integración y Despliegue Continuo** que transporta código desde GitHub hasta el entorno local en Windows.

---

## 📁 1. Estructura del Proyecto

```text
MI-WEB-CICD-TEST/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Configuración del pipeline (YAML)
├── node_modules/               ← Dependencias Node.js (excluidas de Git)
├── index.html                  ← Frontend principal
├── styles.css                  ← Estilos de diseño
├── script.js                   ← Lógica del cliente
├── server.js                   ← Servidor backend local
├── package.json                ← Manifiesto del proyecto
├── package-lock.json           ← Bloqueo de versiones
└── README.md                   ← Este archivo
```

---

## 🗺️ 2. Flujo General del Pipeline

Recorrido completo del código desde el commit hasta el escritorio local.

```mermaid
flowchart TD
    A["💻 Cambios en código\n(VS Code local)"] -->|git push| B["☁️ Repositorio GitHub"]
    B -->|Gatilla Workflow| C["⚙️ GitHub Actions\nRunner Virtual Ubuntu"]
    C -->|Copia por SCP| D["🌐 Pasarela Serveo.net\n(Puerto 22 externo)"]
    D -->|Túnel SSH| E["🖥️ Servidor SSH Local\n(Windows OpenSSH)"]
    E -->|Escritura física| F["📂 Escritorio\nC:/Users/Angel/..."]

    style A fill:#1e293b,color:#94a3b8,stroke:#334155
    style B fill:#0f172a,color:#60a5fa,stroke:#1d4ed8
    style C fill:#0f172a,color:#a78bfa,stroke:#6d28d9
    style D fill:#0f172a,color:#34d399,stroke:#059669
    style E fill:#0f172a,color:#f59e0b,stroke:#d97706
    style F fill:#1e293b,color:#10b981,stroke:#059669
```

---

## 🔒 3. Flujo de Autenticación SSH

Cómo se valida la identidad antes de permitir la escritura en disco.

```mermaid
sequenceDiagram
    participant GH as GitHub Actions
    participant SK as Secret: SSH_KEY
    participant SE as Serveo.net
    participant WIN as Windows OpenSSH
    participant AK as authorized_keys

    GH->>SK: Obtiene clave privada del Secret
    GH->>SE: Conecta al túnel (puerto 22)
    SE->>WIN: Redirige la conexión interna
    WIN->>AK: ¿Coincide la firma de la clave?
    alt ✅ Firma válida
        AK-->>WIN: Acceso concedido
        WIN-->>GH: Canal SSH abierto
        GH->>WIN: Transfiere archivos por SCP
    else ❌ Firma inválida
        AK-->>WIN: Acceso denegado
        WIN-->>GH: Canal cerrado inmediatamente
    end
```

---

## 🧠 4. Diagnóstico de Fallas Críticas

### ❌ Falla 1 — Incompatibilidad de Protocolo SCP

El cliente `scp` moderno usa SFTP por defecto, pero el subsistema SFTP no estaba activo en Windows.

```mermaid
flowchart LR
    A["⚙️ GitHub Actions\nscp moderno"] -->|"Protocolo SFTP\n(por defecto)"| B["🖥️ Windows Terminal"]
    B --> C{{"❌ RECHAZADO\n'Subsystem request failed'"}}

    style C fill:#450a0a,color:#fca5a5,stroke:#991b1b
    style A fill:#1e293b,color:#94a3b8,stroke:#475569
    style B fill:#1e293b,color:#94a3b8,stroke:#475569

```
---

### ❌ Falla 2 — El Vacío del Puerto 22 (Timeout de 10 minutos)

El túnel existía, pero no había servidor SSH en Windows escuchando internamente.

```mermaid
flowchart TD
    A["⚙️ GitHub Actions"] --> B["🌐 Serveo.net"]
    B --> C["🔧 Git Bash\n(Túnel activo)"]
    C --> D{{"❌ CONGELADO\nPuerto 22 vacío\nNo hay servidor SSH"}}
    D -->|"Timeout 10 min"| E["🚫 Pipeline fallido"]

    style D fill:#450a0a,color:#fca5a5,stroke:#991b1b
    style E fill:#450a0a,color:#fca5a5,stroke:#991b1b

    style A fill:#1e293b,color:#94a3b8,stroke:#475569
    style B fill:#1e293b,color:#94a3b8,stroke:#475569
    style C fill:#1e293b,color:#94a3b8,stroke:#475569

```
---

### ❌ Falla 3 — Bloqueo por Cuenta Administradora

Windows OpenSSH ignora por seguridad las `authorized_keys` de usuarios del grupo Administradores.

```mermaid
flowchart TD
    A["📨 Petición SSH\nde GitHub Actions"] --> B["🛡️ Windows OpenSSH"]
    B --> C{"¿Usuario es\nAdministrador?"}
    C -->|"⚠️ SÍ — Angel"| D["📁 authorized_keys\ndel usuario"]
    D --> E{{"❌ IGNORADO\nPor política de fábrica\nde Windows"}}
    E --> F["🚫 Conexión cerrada"]

    style E fill:#450a0a,color:#fca5a5,stroke:#991b1b
    style F fill:#450a0a,color:#fca5a5,stroke:#991b1b

    style A fill:#1e293b,color:#94a3b8,stroke:#475569
    style B fill:#1e293b,color:#94a3b8,stroke:#475569
    style C fill:#1e293b,color:#f59e0b,stroke:#b45309
    style D fill:#1e293b,color:#94a3b8,stroke:#475569

```
---
