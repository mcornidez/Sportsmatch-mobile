import { API_URL } from '@env';
import * as SecureStore from "expo-secure-store";

export const getClubById = async (clubId) => {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }

    if (!clubId) {
        console.error("❌ Error en getClubById: clubId es undefined o null.");
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/clubs?clubId=${clubId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP al obtener club: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Error en getClubById(${clubId}):`, error);
        return null;
    }
};

