-- ============================================================
-- UniGuard - Banco de Dados MySQL 8+
-- Projeto acadêmico de segurança universitária georreferenciada
-- ============================================================

CREATE DATABASE IF NOT EXISTS uniguard
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE uniguard;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS vw_alertas_ativos;
DROP VIEW IF EXISTS vw_heatmap_ocorrencias;
DROP VIEW IF EXISTS vw_tempo_resposta;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS alert_status_history;
DROP TABLE IF EXISTS dispatches;
DROP TABLE IF EXISTS patrol_units;
DROP TABLE IF EXISTS security_agents;
DROP TABLE IF EXISTS alert_evidence;
DROP TABLE IF EXISTS location_history;
DROP TABLE IF EXISTS emergency_alerts;
DROP TABLE IF EXISTS incident_categories;
DROP TABLE IF EXISTS trusted_contacts;
DROP TABLE IF EXISTS safe_points;
DROP TABLE IF EXISTS user_devices;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS campuses;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. CAMPI
-- ============================================================
CREATE TABLE campuses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state CHAR(2) NOT NULL DEFAULT 'PB',
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    geofence_radius_m INT UNSIGNED NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. USUÁRIOS
-- ============================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    institutional_id VARCHAR(50) NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    document_number VARCHAR(30) NULL,
    phone VARCHAR(25) NULL,
    role ENUM('estudante','docente','tecnico_administrativo','seguranca','administrador')
         NOT NULL DEFAULT 'estudante',
    department VARCHAR(120) NULL,
    campus_id BIGINT UNSIGNED NULL,
    password_hash VARCHAR(255) NULL,
    status ENUM('ativo','inativo','bloqueado') NOT NULL DEFAULT 'ativo',
    consent_location BOOLEAN NOT NULL DEFAULT FALSE,
    consent_camera BOOLEAN NOT NULL DEFAULT FALSE,
    consent_sms BOOLEAN NOT NULL DEFAULT FALSE,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_campus
      FOREIGN KEY (campus_id) REFERENCES campuses(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_campus (campus_id)
) ENGINE=InnoDB;

-- ============================================================
-- 3. DISPOSITIVOS
-- ============================================================
CREATE TABLE user_devices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    device_uuid VARCHAR(80) NOT NULL UNIQUE,
    platform ENUM('android','ios','web') NOT NULL DEFAULT 'android',
    model VARCHAR(120) NULL,
    push_token VARCHAR(255) NULL,
    last_seen_at DATETIME NULL,
    battery_percent TINYINT UNSIGNED NULL,
    network_status ENUM('online','offline','instavel','desconhecido') DEFAULT 'desconhecido',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_devices_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_devices_user (user_id),
    INDEX idx_devices_last_seen (last_seen_at)
) ENGINE=InnoDB;

-- ============================================================
-- 4. CONTATOS DE CONFIANÇA
-- ============================================================
CREATE TABLE trusted_contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    relationship VARCHAR(80) NULL,
    priority TINYINT UNSIGNED NOT NULL DEFAULT 1,
    receives_sms BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contacts_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_contacts_user_priority (user_id, priority)
) ENGINE=InnoDB;

-- ============================================================
-- 5. PONTOS SEGUROS / GUARITAS / ÁREAS ILUMINADAS
-- ============================================================
CREATE TABLE safe_points (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campus_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    type ENUM('guarita','bloco_iluminado','secretaria','posto_medico','saida','outro') NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    radius_m INT UNSIGNED NOT NULL DEFAULT 30,
    available_24h BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_safe_point_campus
      FOREIGN KEY (campus_id) REFERENCES campuses(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_safe_point_campus (campus_id),
    INDEX idx_safe_point_geo (latitude, longitude)
) ENGINE=InnoDB;

-- ============================================================
-- 6. CATEGORIAS DE INCIDENTE
-- ============================================================
CREATE TABLE incident_categories (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255) NULL,
    severity ENUM('baixa','media','alta','critica') NOT NULL DEFAULT 'alta',
    requires_medical BOOLEAN NOT NULL DEFAULT FALSE,
    requires_police BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ============================================================
-- 7. ALERTAS SOS
-- ============================================================
CREATE TABLE emergency_alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alert_uuid CHAR(36) NOT NULL UNIQUE,
    protocol_number VARCHAR(30) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    device_id BIGINT UNSIGNED NULL,
    campus_id BIGINT UNSIGNED NULL,
    category_id SMALLINT UNSIGNED NOT NULL,
    status ENUM(
        'pendente',
        'recebido',
        'em_triagem',
        'em_deslocamento',
        'no_local',
        'resolvido',
        'cancelado_usuario',
        'cancelado_central'
    ) NOT NULL DEFAULT 'pendente',
    source ENUM('android','ios','web','painel','api') NOT NULL DEFAULT 'android',
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    accuracy_m DECIMAL(8,2) NULL,
    location_name VARCHAR(255) NULL,
    inside_campus BOOLEAN NOT NULL DEFAULT FALSE,
    signal_lost BOOLEAN NOT NULL DEFAULT FALSE,
    battery_percent TINYINT UNSIGNED NULL,
    network_status VARCHAR(30) NULL,
    notes TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    received_at DATETIME(3) NULL,
    resolved_at DATETIME(3) NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
      ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_alert_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_alert_device
      FOREIGN KEY (device_id) REFERENCES user_devices(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_alert_campus
      FOREIGN KEY (campus_id) REFERENCES campuses(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_alert_category
      FOREIGN KEY (category_id) REFERENCES incident_categories(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_alert_status_created (status, created_at),
    INDEX idx_alert_user_created (user_id, created_at),
    INDEX idx_alert_campus_created (campus_id, created_at),
    INDEX idx_alert_geo (latitude, longitude)
) ENGINE=InnoDB;

-- ============================================================
-- 8. HISTÓRICO DE LOCALIZAÇÃO / BREADCRUMBS
-- ============================================================
CREATE TABLE location_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    device_id BIGINT UNSIGNED NULL,
    alert_id BIGINT UNSIGNED NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    accuracy_m DECIMAL(8,2) NULL,
    speed_mps DECIMAL(8,2) NULL,
    battery_percent TINYINT UNSIGNED NULL,
    is_last_known BOOLEAN NOT NULL DEFAULT FALSE,
    captured_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_location_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_location_device
      FOREIGN KEY (device_id) REFERENCES user_devices(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_location_alert
      FOREIGN KEY (alert_id) REFERENCES emergency_alerts(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_location_user_time (user_id, captured_at),
    INDEX idx_location_alert_time (alert_id, captured_at),
    INDEX idx_location_geo (latitude, longitude)
) ENGINE=InnoDB;

-- ============================================================
-- 9. EVIDÊNCIAS
-- ============================================================
CREATE TABLE alert_evidence (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT UNSIGNED NOT NULL,
    type ENUM('foto','video','audio','documento') NOT NULL DEFAULT 'foto',
    storage_url VARCHAR(500) NOT NULL,
    file_hash_sha256 CHAR(64) NULL,
    captured_at DATETIME(3) NULL,
    uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    metadata_json JSON NULL,
    CONSTRAINT fk_evidence_alert
      FOREIGN KEY (alert_id) REFERENCES emergency_alerts(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_evidence_alert (alert_id)
) ENGINE=InnoDB;

-- ============================================================
-- 10. AGENTES DE SEGURANÇA
-- ============================================================
CREATE TABLE security_agents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    badge_number VARCHAR(40) NULL UNIQUE,
    shift ENUM('manha','tarde','noite','plantao') NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. VIATURAS / EQUIPES
-- ============================================================
CREATE TABLE patrol_units (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campus_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(40) NOT NULL UNIQUE,
    type ENUM('viatura','motocicleta','ronda_pe','bicicleta','outro') NOT NULL,
    status ENUM('disponivel','em_atendimento','indisponivel','manutencao') NOT NULL DEFAULT 'disponivel',
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_patrol_campus
      FOREIGN KEY (campus_id) REFERENCES campuses(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    INDEX idx_patrol_campus_status (campus_id, status)
) ENGINE=InnoDB;

-- ============================================================
-- 12. DESPACHOS
-- ============================================================
CREATE TABLE dispatches (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT UNSIGNED NOT NULL,
    patrol_unit_id BIGINT UNSIGNED NULL,
    assigned_agent_id BIGINT UNSIGNED NULL,
    assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    en_route_at DATETIME(3) NULL,
    arrived_at DATETIME(3) NULL,
    completed_at DATETIME(3) NULL,
    status ENUM('atribuido','a_caminho','no_local','concluido','cancelado')
      NOT NULL DEFAULT 'atribuido',
    notes TEXT NULL,
    CONSTRAINT fk_dispatch_alert
      FOREIGN KEY (alert_id) REFERENCES emergency_alerts(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_dispatch_unit
      FOREIGN KEY (patrol_unit_id) REFERENCES patrol_units(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_dispatch_agent
      FOREIGN KEY (assigned_agent_id) REFERENCES security_agents(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_dispatch_alert (alert_id),
    INDEX idx_dispatch_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 13. HISTÓRICO DE STATUS
-- ============================================================
CREATE TABLE alert_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT UNSIGNED NOT NULL,
    old_status VARCHAR(40) NULL,
    new_status VARCHAR(40) NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    notes VARCHAR(500) NULL,
    changed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_status_alert
      FOREIGN KEY (alert_id) REFERENCES emergency_alerts(id)
      ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_status_user
      FOREIGN KEY (changed_by_user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_status_alert_time (alert_id, changed_at)
) ENGINE=InnoDB;

-- ============================================================
-- 14. LOG DE AUDITORIA
-- ============================================================
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    action VARCHAR(80) NOT NULL,
    ip_address VARCHAR(45) NULL,
    device_info VARCHAR(255) NULL,
    details JSON NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_audit_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_time (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW vw_alertas_ativos AS
SELECT
    a.id,
    a.alert_uuid,
    a.protocol_number,
    u.full_name AS usuario,
    u.phone,
    c.name AS campus,
    ic.name AS categoria,
    ic.severity AS gravidade,
    a.status,
    a.latitude,
    a.longitude,
    a.accuracy_m,
    a.signal_lost,
    a.battery_percent,
    a.created_at,
    TIMESTAMPDIFF(SECOND, a.created_at, NOW(3)) AS segundos_em_aberto
FROM emergency_alerts a
JOIN users u ON u.id = a.user_id
LEFT JOIN campuses c ON c.id = a.campus_id
JOIN incident_categories ic ON ic.id = a.category_id
WHERE a.status NOT IN ('resolvido','cancelado_usuario','cancelado_central');

CREATE VIEW vw_tempo_resposta AS
SELECT
    a.id AS alert_id,
    a.protocol_number,
    a.created_at,
    d.assigned_at,
    d.arrived_at,
    d.completed_at,
    TIMESTAMPDIFF(SECOND, a.created_at, d.assigned_at) AS segundos_ate_despacho,
    TIMESTAMPDIFF(SECOND, a.created_at, d.arrived_at) AS segundos_ate_chegada,
    TIMESTAMPDIFF(SECOND, a.created_at, d.completed_at) AS segundos_ate_conclusao
FROM emergency_alerts a
LEFT JOIN dispatches d ON d.alert_id = a.id;

CREATE VIEW vw_heatmap_ocorrencias AS
SELECT
    campus_id,
    ROUND(latitude, 4) AS lat_bucket,
    ROUND(longitude, 4) AS lng_bucket,
    COUNT(*) AS total_ocorrencias,
    MAX(created_at) AS ultima_ocorrencia
FROM emergency_alerts
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
GROUP BY campus_id, ROUND(latitude, 4), ROUND(longitude, 4);

-- ============================================================
-- TRIGGER DE HISTÓRICO DE STATUS
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_alert_status_change
AFTER UPDATE ON emergency_alerts
FOR EACH ROW
BEGIN
    IF NOT (OLD.status <=> NEW.status) THEN
        INSERT INTO alert_status_history
            (alert_id, old_status, new_status, changed_at)
        VALUES
            (NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP(3));
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

INSERT INTO campuses
(code, name, city, state, geofence_radius_m)
VALUES
('CAMPUS_I', 'Campus I - João Pessoa', 'João Pessoa', 'PB', 2500),
('CAMPUS_II', 'Campus II - Areia', 'Areia', 'PB', 1800),
('CAMPUS_III', 'Campus III - Bananeiras', 'Bananeiras', 'PB', 1800),
('CAMPUS_IV', 'Campus IV - Litoral Norte', 'Rio Tinto/Mamanguape', 'PB', 2500),
('MANGABEIRA', 'Unidade Mangabeira', 'João Pessoa', 'PB', 800);

INSERT INTO incident_categories
(code, name, description, severity, requires_medical, requires_police)
VALUES
('ameaca_fisica', 'Ameaça física / perseguição',
 'Situação de ameaça direta, perseguição ou risco físico.', 'critica', FALSE, TRUE),
('emergencia_medica', 'Emergência médica',
 'Mal súbito, acidente ou outra situação médica urgente.', 'critica', TRUE, FALSE),
('assedio', 'Assédio / importunação',
 'Situação de assédio, importunação ou comportamento intimidatório.', 'alta', FALSE, TRUE),
('infraestrutura', 'Alerta de infraestrutura',
 'Área sem iluminação, risco estrutural ou condição insegura.', 'media', FALSE, FALSE),
('urgencia_geral', 'Urgência geral',
 'Categoria genérica usada quando o tipo do incidente ainda não foi informado.', 'alta', FALSE, FALSE);

-- ============================================================
-- EXEMPLO DE ALERTA PARA TESTE
-- ============================================================
-- Observação: use dados fictícios em ambiente acadêmico.

INSERT INTO users
(full_name, email, role, campus_id, consent_location, consent_camera, consent_sms)
VALUES
('Usuário Acadêmico de Teste', 'teste@academicos.ufpb.br', 'estudante', 1, TRUE, TRUE, TRUE);

INSERT INTO user_devices
(user_id, device_uuid, platform, model, network_status, battery_percent)
VALUES
(1, 'android-demo-uniguard-001', 'android', 'Android Emulator', 'online', 82);

INSERT INTO trusted_contacts
(user_id, name, phone, relationship, priority)
VALUES
(1, 'Contato de Emergência', '+5583999999999', 'Familiar', 1);

INSERT INTO emergency_alerts
(alert_uuid, protocol_number, user_id, device_id, campus_id, category_id,
 status, source, latitude, longitude, accuracy_m, location_name,
 inside_campus, signal_lost, battery_percent, network_status)
VALUES
(UUID(), CONCAT('SOS-', UPPER(SUBSTRING(REPLACE(UUID(),'-',''),1,8))),
 1, 1, 1, 5,
 'pendente', 'android', -7.1380000, -34.8450000, 8.50,
 'Localização simulada - Campus I', TRUE, FALSE, 82, 'online');

-- ============================================================
-- CONSULTAS ÚTEIS
-- ============================================================

-- Alertas em aberto:
-- SELECT * FROM vw_alertas_ativos ORDER BY created_at DESC;

-- Histórico de localização de um alerta:
-- SELECT * FROM location_history WHERE alert_id = 1 ORDER BY captured_at;

-- Tempo de resposta:
-- SELECT * FROM vw_tempo_resposta ORDER BY created_at DESC;

-- Base para mapa de calor:
-- SELECT * FROM vw_heatmap_ocorrencias ORDER BY total_ocorrencias DESC;
