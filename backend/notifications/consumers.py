import json
from channels.generic.websocket import AsyncWebsocketConsumer

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_worker_category_id(user):
    try:
        # Re-fetch user in db context to avoid stale cache/lazy load issues
        u = User.objects.get(id=user.id)
        profile = getattr(u, 'worker_profile', None)
        if profile and profile.service_category:
            return profile.service_category.id
    except Exception:
        pass
    return None

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        if self.user and self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            # If user is worker, join category group
            if self.user.role == 'worker':
                category_id = await get_worker_category_id(self.user)
                if category_id:
                    self.category_group = f"category_{category_id}"
                    await self.channel_layer.group_add(
                        self.category_group,
                        self.channel_name
                    )
                    
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
        if hasattr(self, "category_group"):
            await self.channel_layer.group_discard(
                self.category_group,
                self.channel_name
            )

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event["data"]))

