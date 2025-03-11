import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";

const ReservationDetail = () => {
    const navigation = useNavigation();

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            {/* 🔹 Header Personalizado */}

            <Text style={styles.subTitle}>Reserva confirmada para</Text>
            <Text style={styles.clubName}>Megatlon</Text>

            {/* Detalles de la reserva */}
            <View style={styles.detailsContainer}>
                <Text style={styles.detailLabel}>Ubicación:</Text>
                <Text style={styles.detailValue}>Juana Manso 295, CABA</Text>

                <Text style={styles.detailLabel}>Cancha:</Text>
                <Text style={styles.detailValue}>Cancha Fútbol 11</Text>

                <Text style={styles.detailLabel}>Fecha y hora:</Text>
                <Text style={styles.detailValue}>8/3/2025 a las 12:30 hs</Text>

                <Text style={styles.detailLabel}>Duración:</Text>
                <Text style={styles.detailValue}>90 min</Text>

                <Text style={styles.detailLabel}>Capacidad:</Text>
                <Text style={styles.detailValue}>11 jugadores</Text>

                <Text style={styles.detailLabel}>Descripción:</Text>
                <Text style={styles.detailValue}>Césped sintético</Text>

                <Text style={styles.detailLabel}>Costo:</Text>
                <Text style={styles.detailValue}>$1000</Text>

                {/* Estado de la reserva */}
                <Text style={styles.statusLabel}>Estado de la reserva:</Text>
                <Text style={styles.statusValue}>Aceptada</Text>

                <Text style={styles.statusLabel}>Estado del pago:</Text>
                <Text style={styles.statusValue}>Pago aceptado</Text>
                <Text style={styles.detailValue}>Aceptado el 06/03/2025</Text>

                <Text style={styles.noteText}>
                    Recordá que si cancelas con 24hs de anticipación, se te devolverá la seña.
                </Text>
            </View>
        </View>
    );
};

export default ReservationDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary10,
        padding: 40,
        alignItems: "center",
        paddingTop: 100,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.white,
    },
    subTitle: {
        fontSize: 16,
        color: COLORS.darkGray,
        marginBottom: 10,
    },
    clubName: {
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 10,
    },
    detailsContainer: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 8,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
        marginTop: 8,
    },
    detailValue: {
        fontSize: 16,
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
        marginTop: 10,
    },
    statusValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "green",
        marginBottom: 8,
    },
    backButtonContainer: {
        marginTop: 20,
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 18,
        color: COLORS.white,
        fontWeight: "bold",
    },
    noteText: {
        fontSize: 14,
        color: COLORS.darkGray,
        fontStyle: "italic",
        marginTop: 5,
        textAlign: "center",
    }
});
