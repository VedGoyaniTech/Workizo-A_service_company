import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BookingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']  # type: ignore
        self.group_name = f"booking_{self.booking_id}"

        # Join booking group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        # Leave booking group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def booking_update(self, event):
        # Send update details to client
        await self.send(text_data=json.dumps(event["data"]))
