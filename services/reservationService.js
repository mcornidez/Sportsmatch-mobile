import { API_URL } from '@env';
import * as SecureStore from "expo-secure-store";

export const createReservation = async ({ eventId, fieldId, slotId }) => {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }
    try {
        const response = await fetch(`${API_URL}/reservations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
            body: JSON.stringify({
                eventId,
                fieldId,
                slotId
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
