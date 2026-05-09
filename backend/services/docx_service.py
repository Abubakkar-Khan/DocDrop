"""
DOCX Service — Word document text extraction and validation
"""
import os
from docx import Document as DocxDocument


def extract_text(file_path: str) -> str:
    """
    Extract all paragraph text from a .docx file.

    Args:
        file_path: Path to the .docx file

    Returns:
        str: Concatenated text from all paragraphs
    """
    doc = DocxDocument(file_path)
    paragraphs = []
    for para in doc.paragraphs:
        text = para.text.strip()
        if text:
            paragraphs.append(text)
    return "\n".join(paragraphs)


def validate_docx(filename: str) -> bool:
    """
    Validate that a filename has a .docx extension.

    Args:
        filename: The original filename

    Returns:
        bool: True if valid .docx file
    """
    if not filename:
        return False
    return filename.lower().endswith(".docx")
