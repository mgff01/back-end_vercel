import os
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.utils.deconstruct import deconstructible

@deconstructible
class DatabaseStorage(Storage):
    def __init__(self, option=None):
        pass

    def _open(self, name, mode='rb'):
        from app.models import DatabaseFile
        try:
            normalized_name = name.replace('\\', '/')
            db_file = DatabaseFile.objects.get(name=normalized_name)
            return ContentFile(db_file.content, name=name)
        except DatabaseFile.DoesNotExist:
            raise FileNotFoundError(f"File not found: {name}")

    def _save(self, name, content):
        from app.models import DatabaseFile
        normalized_name = name.replace('\\', '/')
        content_bytes = content.read()
        db_file, created = DatabaseFile.objects.update_or_create(
            name=normalized_name,
            defaults={'content': content_bytes}
        )
        return normalized_name

    def exists(self, name):
        from app.models import DatabaseFile
        normalized_name = name.replace('\\', '/')
        return DatabaseFile.objects.filter(name=normalized_name).exists()

    def url(self, name):
        normalized_name = name.replace('\\', '/')
        return f"/media/{normalized_name}"

    def size(self, name):
        from app.models import DatabaseFile
        normalized_name = name.replace('\\', '/')
        try:
            return len(DatabaseFile.objects.get(name=normalized_name).content)
        except DatabaseFile.DoesNotExist:
            return 0
