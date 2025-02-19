
export const getSports = async () => {
    try {
        const response = await fetch('http://192.168.1.18:3000/sports');
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
