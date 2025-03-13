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
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }

    try {
        const response = await fetch(`${API_URL}/reservations/${reservationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
        });

        if (response.status === 204) {
            return true;
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error("Error cancelando la reserva:", error);
        throw error;
    }
};