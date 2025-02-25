import { API_URL } from '@env';

export const getClubById = async (clubId) => {
    try {
        const response = await fetch(API_URL + "/clubs?clubId=" + clubId);
        if (!response.ok) throw new Error("Error obteniendo el club");
        return await response.json();
    } catch (error) {
        console.error("❌ Error en getClubById:", error);
        return { name: "Club desconocido" };
    }
};
