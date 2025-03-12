import { API_URL } from '@env';
import * as SecureStore from "expo-secure-store";

export const getPaymentsByReservationId = async (reservationId) => {
    try {
        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("No token found, user must log in.");
        }

        const response = await fetch(`${API_URL}/payments/${reservationId}`, {method: "GET",
            headers: {
            "Content-Type": "application/json",
                "c-api-key": token,
        },
        });

        if (!response.ok) {
            if (response.status === 404 || response.status === 204) {
                return [];
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error obteniendo pagos para la reserva ${reservationId}:`, error);
        return [];
    }
};
