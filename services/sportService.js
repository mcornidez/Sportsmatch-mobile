import { API_URL } from '@env';

export const getSports = async () => {
    try {
        const response = await fetch(`${API_URL}/sports`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sports = await response.json();
        return sports;
    } catch (error) {
        console.error("Failed to fetch sports:", error);
        throw error;
    }
};
