"""
Conserta tags Jinja ({{ ... }} e {% ... %}) que o Word fragmentou em varios
"runs" dentro de word/document.xml, impedindo o docxtpl de renderiza-las.

Estrategia: para cada span de tag, remove as marcacoes XML internas e colapsa
os espacos, deixando a tag inteira dentro de um unico run. Faz backup antes.
"""
import re
import shutil
import sys
import zipfile
from pathlib import Path

DOCX = Path(sys.argv[1]) if len(sys.argv) > 1 else None
if not DOCX or not DOCX.exists():
    raise SystemExit(f"Arquivo nao encontrado: {DOCX}")

backup = DOCX.with_suffix(DOCX.suffix + ".bak")
if not backup.exists():
    shutil.copy2(DOCX, backup)
    print(f"Backup criado: {backup.name}")
else:
    print(f"Backup ja existe: {backup.name}")

# Le o XML principal
with zipfile.ZipFile(DOCX, "r") as z:
    names = z.namelist()
    xml = z.read("word/document.xml").decode("utf-8")


def clean_span(m):
    span = m.group(0)
    # remove qualquer marcacao XML interna (<...>) e colapsa espacos
    text = re.sub(r"<[^>]*>", "", span)
    text = re.sub(r"\s+", " ", text).strip()
    return text


tags_before = re.findall(r"\{\{.*?\}\}|\{%.*?%\}", xml, flags=re.DOTALL)
xml_fixed = re.sub(r"\{\{.*?\}\}|\{%.*?%\}", clean_span, xml, flags=re.DOTALL)
tags_after = sorted(set(re.findall(r"\{\{.*?\}\}|\{%.*?%\}", xml_fixed)))

print(f"\nSpans de tag encontrados: {len(tags_before)}")
print("Tags LIMPAS depois do conserto:")
for t in tags_after:
    print(f"   {t}")

# Reescreve o docx preservando todas as outras entradas do zip
tmp = DOCX.with_suffix(".tmp.docx")
with zipfile.ZipFile(DOCX, "r") as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "word/document.xml":
            data = xml_fixed.encode("utf-8")
        zout.writestr(item, data)
tmp.replace(DOCX)
print(f"\n{DOCX.name} reescrito.")

# Verificacao: o docxtpl consegue renderizar?
from docxtpl import DocxTemplate

doc = DocxTemplate(str(DOCX))
varnames = doc.get_undeclared_template_variables()
print(f"\nVariaveis que o docxtpl reconhece ({len(varnames)}):")
for v in sorted(varnames):
    print(f"   {v}")

contexto = {v: "TESTE" for v in varnames}
import io
buf = io.BytesIO()
doc.render(contexto)
doc.save(buf)
print(f"\nOK: render() executou sem erro. Documento gerado com {buf.tell()} bytes.")
