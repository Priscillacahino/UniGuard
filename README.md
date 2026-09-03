# 🛡️ UniGuard — Gestão de Segurança Universitária Georreferenciada

> ⚠️ **Aviso Importante:** O UniGuard é um **protótipo conceitual acadêmico**. Todos os dados, mapas e localizações apresentados são simulados e a plataforma **não** possui integração oficial com o sistema corporativo ou com a Superintendência de Segurança da UFPB.
> 

O **UniGuard** é uma plataforma de segurança preventiva projetada para apoiar discentes, docentes e servidores técnicos-administrativos dentro dos campi da **Universidade Federal da Paraíba (UFPB)**. O sistema utiliza geolocalização e automação digital para otimizar o tempo de resposta das equipes de vigilância patrimonial em situações de vulnerabilidade ou risco eminente.


🔗 **Acesse o Protótipo:** [uniguardvercelapp.vercel.app](https://uniguardvercelapp.vercel.app/)

---

## 🎯 Objetivo Estratégico
Empregar tecnologia de geofencing e telemetria móvel para criar um canal ágil de comunicação entre a comunidade acadêmica e a central de operações, acelerando o despacho de patrulhas e mitigando incidentes nos turnos de maior criticidade.

---

## ⚙️ Arquitetura Funcional (Ciclo em 7 Etapas)

O ecossistema opera através de um fluxo cíclico integrado que conecta a ponta (usuário) à base operacional (central de monitoramento):

### 1. Autenticação e Seleção de Contexto
* **Identificação Institucional:** Fluxo projetado para integração com credenciais `@academicos.ufpb.br` ou `@ufpb.br`.
* **Configuração de Escopo:** O usuário seleciona seu campus base:
  * 📍 Campus I (João Pessoa)
  * 📍 Campus II (Areia)
  * 📍 Campus III (Bananeiras)
  * 📍 Campus IV (Litoral Norte)
  * 📍 Unidade Mangabeira

### 2. Telemetria e Monitoramento de Proximidade (*Geofencing*)
* **Rastro de Deslocamento:** Registro contínuo de coordenadas (*breadcrumbs*) em segundo plano.
* **Mapeamento de Áreas Seguras:** Algoritmo calcula a distância do usuário em relação a pontos estratégicos (guaritas, blocos iluminados e secretarias).
* **Salvaguarda Faltosa:** Fixação automática da *Última Localização Conhecida (Last Known Location)* caso ocorra perda súbita de rede ou desligamento por bateria fraca.

### 3. Acionamento de Vetor de Pânico (Botão SOS)
* **Gatilho Inteligente:** Disparo simplificado por toque único ou trava de segurança antierro de 2 segundos.
* **Categorização Dinâmica de Incidentes:**
  * 🚨 Ameaça Física / Perseguição
  * 🩺 Emergência Médica
  * 👤 Assédio / Importunação
  * 💡 Alerta de Infraestrutura (Área sem iluminação)

### 4. Carimbo Forense e Comunicação de Emergência
* **Captura de Mídia Ambental:** Acionamento automático da câmera para registro fotográfico do entorno.
* **Metadados Invioláveis:** Aplicação de marca d'água digital com ID do protocolo, latitude/longitude exatas, carimbo de data/hora (timestamp) e status de energia.
* **Notificação Externa:** Envio imediato de alertas via SMS para a lista de contatos de confiança previamente cadastrados.

### 5. Centralização Tática e Triagem de Alarmes
* **Painel da Central de Segurança:** Telas operacionais recebem os chamados em regime de prioridade absoluta.
* **Disparo Sonoro:** Alarmes visuais e auditivos piscam no painel do operador exibindo o mapa tático integrado, a telemetria atual da vítima e a foto capturada.

### 6. Logística de Despacho e Resgate de Campo
* **Roteamento de Viaturas:** Cálculo do trajeto viário mais rápido para motocicletas e viaturas da guarda até o ponto do chamado.
* **Ciclo de Vida do Atendimento:**


* **Pontes Externas:** Linha direta para acionamento automatizado do SAMU (192) ou Polícia Militar (190).

### 7. Auditoria e Inteligência de Segurança Pública
* **Registros de Log Históricos:** Banco de dados imutável para posterior exportação de relatórios que podem apoiar inquéritos oficiais.
* **Mapas de Calor (Heatmaps):** Agrupamento estatístico de ocorrências para subsidiar decisões de engenharia urbana no campus (ex: reforço de iluminação e mudança nas rotas de rondas a pé).

---

## 🛠️ Stack Tecnológica

O projeto foi inicializado utilizando uma arquitetura moderna focada em performance de execução e tipagem estática:

*   **Linguagem Core:** [TypeScript](https://typescriptlang.org) (Garantia de segurança em tempo de compilação)
*   **Ambiente de Construção:** [Vite](https://vitejs.dev) & [Bun](https://bun.sh) (Gerenciamento ultra-rápido de pacotes)
*   **Hospedagem & CI/CD:** [Vercel](https://vercel.com)

---

## 👥 Autoria e Desenvolvimento

O desenvolvimento deste ecossistema conceitual foi planejado e executado por:

*   **Priscilla Cahino** — *Concepção, Arquitetura e Desenvolvimento*

---
Desenvolvido com fins estritamente acadêmicos para a comunidade da **Universidade Federal da Paraíba**. 🛡️




## 🔀 Fluxograma Operacional

```mermaid
flowchart TD
    %% Nós de Início e Autenticação
    Start([Discente / Usuário no Campus]) --> Auth[1. Login Institucional SIGAA / UFPB]
    Auth --> Perms[Autoriza Localização GPS & Câmera]
    Perms --> CampusSelect[Seleciona Campus: JP, Areia, Bananeiras, LN, Mangabeira]

    %% Monitoramento Preventivo
    CampusSelect --> Monitor[2. Telemetria GPS em Segundo Plano]
    Monitor --> SafeCheck{Está em Zona Segura?}
    SafeCheck -- Sim --> SafeMode[Modo Preventivo: Trava de 2s contra falsos alertas]
    SafeCheck -- Não --> NormalMode[Modo Risco Elevado: Disparo Imediato]

    %% Rotas Preventivas
    NormalMode -.-> SafeRoute[Opção: Traçar Rota Iluminada até Guarita mais Próxima]

    %% Acionamento do SOS
    SafeMode --> Trigger[3. Acionamento do Botão de Pânico SOS]
    NormalMode --> Trigger

    %% Captura e Evidência
    Trigger --> Capture[4. Captura Instantânea da Foto da Câmera]
    Capture --> Stamp[Carimbo Forense: Protocolo, Lat/Lng, Data/Hora e Bateria]
    Stamp --> SMS[Envio de SMS com Link de Localização aos Contatos]

    %% Transmissão e Central
    Stamp --> Transmit[5. Transmissão Prioritária para a Central UFPB]
    Transmit --> SoundAlert[Sirene Sonora & Notificação no Painel de Segurança]
    Transmit --> MapPlot[Plotagem no Mapa Tático com Rastro GPS]

    %% Despacho e Resgate
    MapPlot --> Dispatch[6. Despacho da Viatura / Ronda Mais Próxima]
    Dispatch --> StatusUpdate{Status do Resgate}
    StatusUpdate -->|A Caminho| EnRoute[Equipe em Deslocamento com Rota Otimizada]
    EnRoute -->|No Local| OnScene[Abordagem, Apoio à Vítima e Neutralização do Risco]
    OnScene --> Resolved[Resgate Concluído / Vítima em Segurança]

    %% Auditoria e Relatório
    Resolved --> Audit[7. Arquivamento Seguro & Relatório de Ocorrência]
    Audit --> Heatmap[Alimentação de Dados para Reforço de Iluminação e Ronda]
    Heatmap --> End([Ocorrência Finalizada])

    %% Estilos Visuais
    classDef primary fill:#003d71,stroke:#002444,stroke-width:2px,color:#fff;
    classDef emergency fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff;
    classDef safe fill:#059669,stroke:#047857,stroke-width:2px,color:#fff;
    classDef info fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef dark fill:#334155,stroke:#1e293b,stroke-width:2px,color:#fff;

    class Auth,Perms,CampusSelect primary;
    class Trigger,Capture,Stamp,Transmit,SoundAlert emergency;
    class SafeCheck,SafeMode,SafeRoute,Resolved safe;
    class Dispatch,EnRoute,OnScene info;
    class Audit,Heatmap dark;

