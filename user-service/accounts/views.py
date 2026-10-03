import os
from datetime import datetime, timedelta, timezone

import jwt
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RegisterSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"id": user.id, "username": user.username, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"detail": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        expiry_minutes = int(os.getenv("JWT_EXPIRY_MINUTES", "60"))
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "username": user.username,
            "iat": now,
            "exp": now + timedelta(minutes=expiry_minutes),
        }
        token = jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")

        return Response({"access_token": token, "token_type": "Bearer"})