import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants";
import { EVENT_STATUS } from "../constants/data";

const EventStatus = ({ status }) => {
    // Define styles based on the status code
    const getStatusStyle = () => {
        switch (status) {
            case EVENT_STATUS.RECRUITING: 
                return styles.recruiting;
            case EVENT_STATUS.IN_PROGRESS: 
                return styles.inProgress;
            case EVENT_STATUS.FINALIZED:
                return styles.finalized;
            default:
                return styles.default;
        }
    };

    // Define status text based on the status code
    const getStatusText = () => {
        switch (status) {
            case EVENT_STATUS.RECRUITING:
                return "Convocando";
            case EVENT_STATUS.IN_PROGRESS:
                return "En progreso";
            case EVENT_STATUS.FINALIZED:
                return "Finalizado";
            default:
                return "Unknown";
        }
    };

    return (
        <View style={[styles.container, getStatusStyle()]}>
            <Text style={{color: 'white', fontWeight: 600, fontSize: 16}}>{getStatusText()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 6,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    recruiting: {
        backgroundColor: COLORS.secondary, // Yellow with 50% transparency
    },
    inProgress: {
        backgroundColor: "rgba(42, 222, 130, 0.8)", // Green with 50% transparency
    },
    finalized: {
        backgroundColor: "rgba(255, 0, 0, 1 )", // Red with 50% transparency
    },
    default: {
        backgroundColor: "rgba(128, 128, 128, 0.5)", // Gray with 50% transparency
    },
});

export default EventStatus;
