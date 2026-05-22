from content_app import models
from django.contrib import admin

class ContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'is_public')
    list_filter = ('content_type', 'is_public')
    search_fields = ('title', 'description')

class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at')
    search_fields = ('title', 'description')

admin.site.register(models.Content, ContentAdmin)
admin.site.register(models.Playlist, PlaylistAdmin)