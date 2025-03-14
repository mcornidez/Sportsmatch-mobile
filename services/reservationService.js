import { API_URL } from '@env';
import * as SecureStore from "expo-secure-store";

export const createReservation = async ({ eventId, fieldId, slotId }) => {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }

    try {
        const response = await fetch(`${API_URL}/reservations/event/${eventId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
            body: JSON.stringify({
                fieldId,
                slotIds: [slotId]
            }),
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creando reserva:", error);
        throw error;
    }
};

export const fetchReservationsByEvent = async (eventId) => {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }

    try {
        const response = await fetch(`${API_URL}/reservations/event/${eventId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
        });

        if (response.status === 403) {
            return [];
        }

        if (response.status === 404) {
            return [];
        }

        if (!response.ok) {
            throw new Error(`Error inesperado: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Error obteniendo la reserva:", error);
        return [];
    }
};



export const cancelReservation = async (reservationId) => {
    console.log(`📡 Iniciando solicitud DELETE para cancelar reserva con ID: ${reservationId}`);

    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        console.error("❌ Error: No se encontró el token de autenticación.");
        throw new Error("No token found, user must log in.");
    }

    try {
        console.log("🔐 Token de autenticación obtenido correctamente.");
        console.log(`📡 Enviando DELETE request a: ${API_URL}/reservations/${reservationId}`);

        const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
                "x-auth-type": 'user'
            },
        });

        console.log(`📡 Respuesta del servidor recibida con código de estado: ${response.status}`);

        if (response.status === 204) {
            console.log("✅ Reserva eliminada exitosamente en el servidor.");
            return true;
        } else {
            const errorMessage = `❌ Error HTTP: ${response.status}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("❌ Error cancelando la reserva:", error);
        throw error;
    }
};
