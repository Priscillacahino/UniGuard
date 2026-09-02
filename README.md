## 🛡️ Guardião UFPB

https://uniguardvercelapp.vercel.app/


O **Guardião UFPB** é um projeto em desenvolvimento com o objetivo de contribuir para a segurança de estudantes e servidores dentro do campus da Universidade Federal da Paraíba.

Na primeira utilização, o usuário realiza sua identificação e autoriza o acesso à localização do dispositivo. A partir dessa autorização, o sistema pode utilizar a geolocalização para identificar a presença do usuário dentro da área do campus.

Em uma situação de emergência, o usuário pode acionar o **botão SOS**, enviando um alerta para a equipe de segurança da universidade juntamente com sua última localização disponível.

O projeto também prevê a identificação de situações em que o acesso à localização seja interrompido inesperadamente, permitindo que a equipe responsável tenha como referência o último ponto registrado pelo sistema.

Para a equipe de segurança, foi pensado um painel específico para acompanhamento dos alertas e identificação da última localização conhecida do usuário, auxiliando em uma resposta mais rápida durante uma possível ocorrência.


### 🎯 Objetivo

Utilizar tecnologia e geolocalização como apoio à segurança no ambiente universitário, criando uma forma simples e rápida de solicitar ajuda e facilitar a localização do estudante ou servidor em situações de risco.

### 📝 Resumo das Etapas Chave do Sistema

O **Guardião UFPB** opera por meio de um ciclo integrado de proteção comunitária, resposta tática rápida e preservação probatória, estruturado em **7 fases principais**:

1. **Acesso, Identificação e Autorizações**
   - **Ator:** Discente, Docente ou Servidor Técnico-Administrativo.
   - **Operação:** Autenticação via credenciais institucionais SIGAA/UFPB (`@academicos.ufpb.br` ou `@ufpb.br`), cadastro de contatos de confiança para notificação de emergência e concessão das permissões de geolocalização e câmera. Suporte a fluxo de redefinição de senha e seleção do campus de atuação (João Pessoa, Areia, Bananeiras, Litoral Norte ou Mangabeira).

2. **Monitoramento Georreferenciado Preventivo & Zonas Seguras**
   - **Ator:** Módulo de Telemetria GPS & Algoritmo de Geofencing.
   - **Operação:** Rastreamento do rastro de deslocamento (*breadcrumbs*) e identificação contínua de proximidade com **Zonas Seguras** (guaritas, postos da segurança universitária, bibliotecas centrais e prédios administrativos iluminados). Fixação automática da *Última Localização Conhecida* em caso de queda de sinal ou bateria fraca.

3. **Gatilho de Emergência (Botão de Pânico SOS Inteligente)**
   - **Ator:** Vítima ou Usuário em Situação de Risco.
   - **Operação:** Disparo imediato com toque único ou trava de segurança de 2 segundos quando em Zonas Seguras (evitando falsos acionamentos em áreas de grande fluxo). Opção de categorização rápida do incidente (ameaça física, perseguição, emergência médica, assédio ou iluminação deficiente).

4. **Captura Fotográfica Autorizada & Carimbo Forense**
   - **Ator:** Câmera do Dispositivo & Sensores Locais.
   - **Operação:** No instante do acionamento, a câmera do aparelho captura uma foto instantânea do entorno/ocorrência. A imagem recebe um selo digital inviolável com: número de protocolo único, coordenadas geográficas (latitude/longitude), data/hora sincronizada e nível de bateria do dispositivo. Em paralelo, é disparado SMS automático aos contatos de emergência cadastrados.

5. **Transmissão Tática & Alerta Prioritário na Central**
   - **Ator:** Rede de Comunicação & Central de Segurança UFPB.
   - **Operação:** O chamado é transmitido com prioridade máxima para a tela de comando dos operadores de segurança do campus correspondente, acionando alarme sonoro, mapa tático em tempo real, visualização da foto e telemetria da vítima.

6. **Despacho Operacional & Resgate no Local**
   - **Ator:** Viaturas, Motopatrulhas e Vigilantes Patrimoniais.
   - **Operação:** A viatura ou patrulha mais próxima é despachada com a melhor rota viária até as coordenadas do chamado. O operador e os agentes em campo monitoram o status do atendimento (*Despachado* ➔ *A Caminho* ➔ *No Local* ➔ *Atendido*), com linha direta de contato com a vítima e com órgãos externos (Polícia Militar 190 e SAMU 192, se necessário).

7. **Auditoria Forense & Inteligência Preventiva**
   - **Ator:** Comissão de Segurança Universitária e Gestão de Campi.
   - **Operação:** Arquivamento do histórico do chamado com protocolo e logs inalteráveis, viabilizando a exportação de relatórios para inquéritos e a geração de mapas de calor para subsidiar reforços na iluminação pública e na ronda preventiva dos campi.




> [!CAUTION]
> **Aviso Importante:** Atualmente, o Guardião UFPB é um protótipo conceitual. Os dados e localizações apresentados são simulados e não representam um sistema oficial da UFPB.










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

