import { btoa } from "react-native-quick-base64";
import { API_URL } from '@env';

const getBasicToken = (email, password) => {
  const credentials = email + ":" + password;
  return btoa(credentials);
};

const login = async (email, password) => {
  let config = {
    headers: { "c-basic-auth": getBasicToken(email, password) },
  };

  const response = await fetch(`${API_URL}/auth`, config);
  const body = response.status !== 204 ? await response.json() : null;

  if (!response.ok) {
    return { success: false, error: body?.message || "EMAIL_NOT_FOUND" };
  }

  const token = response.headers.get("c-api-key");
  if (!token) {
    return { success: false, error: "TOKEN_NOT_FOUND" };
  }

  return { success: true, token, user: body?.user };
};

const register = async (data) => {

  try {
    const response = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 201) {
      return { ok: true };
    }

    let json;
    try {
      json = await response.json();
    } catch (error) {
      console.error("⚠️ No se pudo parsear JSON:", error);
      return { status: response.status, message: "Error al parsear respuesta JSON" };
    }

    return {
      status: response.status,
      internalStatus: json?.internalStatus || "UNKNOWN",
      message: json?.message || "Error desconocido",
    };
  } catch (error) {
    console.error("❌ Error en fetch de register:", error);
    return { status: 500, message: "Error de conexión con el servidor" };
  }
};

export { login, register };