import { API_URL } from '@env';
import * as SecureStore from "expo-secure-store";
import { DateTime } from "luxon";

export const getFields = async () => {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }
    try {
        const response = await fetch(`${API_URL}/fields`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error obteniendo canchas get fields:", error);
        return [];
    }
};

export const getFieldsWithLocation = async (location) => {
    const token = await SecureStore.getItemAsync("userToken");

    if (!token) {
        throw new Error("No token found, user must log in.");
    }

    try {
        const clubsResponse = await fetch(`${API_URL}/clubs?location=${encodeURIComponent(location)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
        });

        if (!clubsResponse.ok) {
            throw new Error(`Error HTTP al obtener clubes: ${clubsResponse.status}`);
        }

        const clubs = await clubsResponse.json();

        if (!Array.isArray(clubs) || clubs.length === 0) {
            console.warn("⚠️ No se encontraron clubes en esta ubicación.");
            return [];
        }

        const clubIds = clubs.map((club) => club.club_id);

        const fieldsRequests = clubIds.map((clubId) =>
            fetch(`${API_URL}/fields?clubId=${clubId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "c-api-key": token,
                },
            })
                .then((res) => {
                    return res.json();
                })
                .then((json) => {
                    return json;
                })
                .catch((err) => {
                    console.error(`❌ Error en fetch /fields?clubId=${clubId}:`, err);
                    return [];
                })
        );

        const fieldsResponses = await Promise.all(fieldsRequests);
        const allFields = fieldsResponses.flat(); // Aplanar el array


        return allFields;
    } catch (error) {
        console.error("❌ Error obteniendo canchas get fields with location:", error);
        return [];
    }
};

const formatToISO = (date) => {
    return DateTime.fromFormat(date, "d/M/yyyy").toFormat("yyyy-MM-dd");
};

export const getAvailableTimeslots = async (fieldId, date) => {
    try {
        if (!SecureStore) {
            console.error("❌ SecureStore no está disponible. Verifica la instalación.");
            return [];
        }

        const formattedDate = formatToISO(date);
        const token = await SecureStore.getItemAsync("userToken");

        if (!token) {
            throw new Error("No token found, user must log in.");
        }

        const url = `${API_URL}/fields/${fieldId}/availability/available?startDate=${formattedDate}&endDate=${formattedDate}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "c-api-key": token,
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error obteniendo disponibilidad de cancha ${fieldId}:`, error);
        return [];
    }
};
