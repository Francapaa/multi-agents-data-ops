import io
import logging
import os

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {".docx", ".pdf", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class UnsupportedFormatError(ValueError):
    ...


class FileTooLargeError(ValueError):
    ...


def parse_file(file_bytes: bytes, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise UnsupportedFormatError(
            f"Unsupported file format '{ext}'. Supported: {', '.join(SUPPORTED_EXTENSIONS)}"
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise FileTooLargeError(
            f"File too large ({len(file_bytes)} bytes). Max: {MAX_FILE_SIZE} bytes"
        )

    if ext == ".docx":
        return _parse_docx(file_bytes)
    elif ext == ".pdf":
        return _parse_pdf(file_bytes)
    else:
        return file_bytes.decode("utf-8", errors="replace")


def _parse_docx(file_bytes: bytes) -> str:
    from docx import Document

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)


def _parse_pdf(file_bytes: bytes) -> str:
    import fitz

    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        text = page.get_text().strip()
        if text:
            pages.append(text)
    doc.close()
    return "\n\n".join(pages)
