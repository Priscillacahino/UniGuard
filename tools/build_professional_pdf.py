from pathlib import Path

W, H = 960, 540
OUT = Path("UniGuard_Apresentacao_Profissional.pdf")


def pdf_escape(text: str) -> str:
    out = ""
    for value in text.encode("cp1252", errors="replace"):
        char = chr(value)
        if char in "\\()":
            out += "\\" + char
        elif 32 <= value <= 126:
            out += char
        else:
            out += "\\%03o" % value
    return out


def make_page(title, kicker, columns, subtitle=None):
    ops = [
        "0.957 0.973 0.984 rg 0 0 960 540 re f",
        "0.071 0.710 0.796 rg 58 486 110 3 re f",
    ]

    def text(x, y, size, value, bold=False, color=(0.04, 0.18, 0.30)):
        font = "/F2" if bold else "/F1"
        r, g, b = color
        ops.append(
            f"{r:.3f} {g:.3f} {b:.3f} rg BT {font} {size} Tf "
            f"{x:.1f} {y:.1f} Td ({pdf_escape(value)}) Tj ET"
        )

    text(58, 498, 9, kicker.upper(), True, (0.071, 0.710, 0.796))
    text(58, 447, 29, title, True)
    if subtitle:
        text(58, 420, 11, subtitle, False, (0.35, 0.43, 0.50))

    gap = 24
    total = 844
    column_width = (total - gap * (len(columns) - 1)) / len(columns)
    x = 58

    for heading, lines, accent in columns:
        y = 105
        height = 280
        ops.append(f"1 1 1 rg {x:.1f} {y} {column_width:.1f} {height} re f")
        ar, ag, ab = accent
        ops.append(f"{ar} {ag} {ab} rg {x:.1f} {y} {column_width:.1f} 5 re f")
        text(x + 16, y + height - 30, 13, heading, True)
        yy = y + height - 58

        for line in lines:
            words = line.split()
            chunks = []
            current = ""
            for word in words:
                if len(current) + len(word) + 1 > 68:
                    chunks.append(current)
                    current = word
                else:
                    current = (current + " " + word).strip()
            if current:
                chunks.append(current)

            for index, chunk in enumerate(chunks):
                first_bullet = index == 0 and chunk.startswith("•")
                if first_bullet:
                    text(x + 18, yy, 9, "•", True, accent)
                    text(x + 30, yy, 9, chunk[1:].strip(), False, (0.12, 0.16, 0.22))
                else:
                    indent = x + 30 if line.startswith("•") else x + 18
                    text(indent, yy, 9, chunk, False, (0.12, 0.16, 0.22))
                yy -= 16
        x += column_width + gap

    ops.append("0.88 0.91 0.94 RG 58 43 m 902 43 l S")
    text(58, 25, 7.5, "PROTÓTIPO ACADÊMICO • DADOS DEMONSTRATIVOS", False, (0.4, 0.46, 0.52))
    return "\n".join(ops) + "\n"


def cover():
    ops = ["0.04 0.18 0.30 rg 0 0 960 540 re f"]

    def text(x, y, size, value, bold=False, color=(1, 1, 1)):
        font = "/F2" if bold else "/F1"
        r, g, b = color
        ops.append(
            f"{r} {g} {b} rg BT {font} {size} Tf {x} {y} Td "
            f"({pdf_escape(value)}) Tj ET"
        )

    text(64, 452, 12, "UNIGUARD", True, (0.071, 0.710, 0.796))
    text(64, 386, 36, "Segurança universitária", True)
    text(64, 342, 36, "conectada ao cuidado", True)
    text(64, 300, 14, "Apresentação profissional atualizada • requisitos e controles", False, (0.82, 0.90, 0.95))
    ops.append("0.07 0.25 0.40 rg 64 108 832 118 re f")
    text(88, 188, 14, "Protótipo acadêmico avançado em evolução e validação", True)
    text(88, 160, 10.5, "Sem integração oficial com UFPB, SAMU ou Polícia Militar. Dados e indicadores são fictícios.", False, (0.82, 0.90, 0.95))
    text(88, 138, 10.5, "Escopo atualizado: conta verificada, isolamento institucional, auditoria, retenção e controle contra abuso.", False, (0.82, 0.90, 0.95))
    return "\n".join(ops) + "\n"


blue = (0, 0.47, 0.71)
green = (0.06, 0.62, 0.47)
orange = (0.90, 0.49, 0.13)
cyan = (0.071, 0.710, 0.796)

pages = [
    cover(),
    make_page(
        "Fluxo atual da solução",
        "Visão do produto",
        [
            ("Usuário", ["• Autenticação por e-mail e senha", "• E-mail verificado", "• Vínculo institucional ativo", "• Localização mediante permissão", "• SOS com categoria e evidência opcional"], cyan),
            ("Plataforma", ["• Firebase Auth, Firestore e Storage", "• Isolamento por institutionId", "• Regras por perfil e vínculo", "• Registro de recebimento e auditoria", "• Evidência sem sobrescrita"], blue),
            ("Central", ["• Operador ativo da mesma instituição", "• Visualização e triagem", "• Atualização de status", "• Histórico e encerramento auditável"], green),
        ],
        "Do acesso autorizado ao encerramento da ocorrência.",
    ),
    make_page(
        "Controles incorporados",
        "Confiança e governança",
        [
            ("Já implementado", ["• Sem identidade anônima para alertas institucionais", "• Conta verificada e vínculo ativo antes do SOS", "• Isolamento entre instituições", "• Auditoria append-only de eventos relevantes", "• Evidências imutáveis no Storage", "• Dados médicos e medicalNotes bloqueados", "• Limites locais contra excesso de alertas"], green),
            ("Antes do piloto", ["• Ativar TTL remoto no Firestore", "• Configurar ciclo de vida do Storage", "• Habilitar App Check e rate limit confiável", "• Executar testes negativos de isolamento", "• Validar Android → Firebase → Central ponta a ponta", "• Formalizar operação e responsabilidades institucionais"], orange),
        ],
        "A versão anterior do PDF precisava ser atualizada nesta parte.",
    ),
    make_page(
        "Requisitos funcionais",
        "RF01–RF12",
        [
            ("RF01–RF06", ["RF01  Cadastrar/autenticar por e-mail e senha.", "RF02  Exigir e-mail verificado e vínculo ativo.", "RF03  Associar usuário à instituição/campus autorizado.", "RF04  Obter localização mediante permissão.", "RF05  Criar SOS com categoria, data/hora e localização.", "RF06  Anexar evidência fotográfica quando autorizada."], blue),
            ("RF07–RF12", ["RF07  Exibir alertas ao operador da mesma instituição.", "RF08  Registrar recebimento, visualização e mudanças de status.", "RF09  Permitir acompanhamento e histórico do alerta.", "RF10  Registrar eventos de auditoria.", "RF11  Bloquear criação abusiva/repetitiva de alertas.", "RF12  Limpar dados temporários locais conforme retenção."], cyan),
        ],
        "Funções consolidadas a partir do código e da documentação atual.",
    ),
    make_page(
        "Requisitos não funcionais",
        "RNF01–RNF10",
        [
            ("RNF01–RNF05", ["RNF01  Acesso controlado por perfil, conta e instituição.", "RNF02  Minimização de dados; sem prontuário médico.", "RNF03  Auditoria append-only e rastreável.", "RNF04  Retenção: alertas 90d; auditoria 365d.", "RNF05  Evidências 30d; temporários locais 7d."], green),
            ("RNF06–RNF10", ["RNF06  Evidência não pode ser sobrescrita pelo cliente.", "RNF07  Nenhum acesso cruzado entre instituições.", "RNF08  Modo demonstrativo local independente do Firebase.", "RNF09  UX com permissões necessárias e confirmação clara.", "RNF10  MySQL futuro somente via API/backend seguro."], blue),
        ],
        "Segurança, privacidade, integridade, rastreabilidade e arquitetura.",
    ),
    make_page(
        "Regras de negócio",
        "RN01–RN12",
        [
            ("RN01–RN06", ["RN01  E-mail deve estar verificado para operar.", "RN02  Membership ativa e institutionId são obrigatórios.", "RN03  Operador atua somente na própria instituição.", "RN04  Máximo de 1 alerta ativo por usuário.", "RN05  Máximo de 3 alertas em 30 minutos.", "RN06  Intervalo mínimo de 60s entre novos alertas."], orange),
            ("RN07–RN12", ["RN07  Evidência enviada não pode ser substituída.", "RN08  medicalNotes e dados clínicos são proibidos.", "RN09  Auditoria registra ator, alerta, instituição e horário.", "RN10  Exclusão antecipada exige processo administrativo auditável.", "RN11  Legado sem institutionId/retentionExpiresAt deve ser migrado ou isolado.", "RN12  Em validação pública, utilizar apenas dados fictícios."], green),
        ],
        "Regras aplicadas ao fluxo de autorização, alerta, dados e auditoria.",
    ),
]

objects = []


def add_bytes(data):
    objects.append(data)
    return len(objects)


def add_string(value):
    return add_bytes(value.encode("ascii"))


font_regular = add_string("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
font_bold = add_string("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
content_ids = []
for page_data in pages:
    encoded = page_data.encode("ascii")
    content_ids.append(add_bytes(f"<< /Length {len(encoded)} >>\nstream\n".encode() + encoded + b"endstream"))

pages_id = len(objects) + 1
objects.append(b"")
page_ids = []
for content_id in content_ids:
    page_ids.append(
        add_string(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {W} {H}] "
            f"/Resources << /Font << /F1 {font_regular} 0 R /F2 {font_bold} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )
    )

objects[pages_id - 1] = (
    f"<< /Type /Pages /Count {len(page_ids)} /Kids [ "
    + " ".join(f"{page_id} 0 R" for page_id in page_ids)
    + " ] >>"
).encode("ascii")
catalog_id = add_string(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

pdf = bytearray(b"%PDF-1.4\n%ASCII\n")
offsets = [0]
for index, obj in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf += f"{index} 0 obj\n".encode() + obj + b"\nendobj\n"

xref = len(pdf)
pdf += f"xref\n0 {len(objects) + 1}\n".encode()
pdf += b"0000000000 65535 f \n"
for offset in offsets[1:]:
    pdf += f"{offset:010d} 00000 n \n".encode()
pdf += (
    f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
    f"startxref\n{xref}\n%%EOF\n"
).encode()

OUT.write_bytes(pdf)
print(f"Gerado: {OUT} ({len(pdf)} bytes, {len(pages)} páginas)")
