import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../constants";
import { createReservation } from "../services/reservationService";

const FieldReservation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [loading, setLoading] = useState(false);

    const { eventId, fieldId, slotId, clubName, clubLocation,
        clubAddress, fieldName, date, slotStart, slotDuration, capacity, cost, description } = route.params;

    const handleReservation = async () => {
        setLoading(true);
        try {
            console.log("📡 Enviando reserva con los siguientes datos:");
            console.log("Event ID:", eventId);
            console.log("Field ID:", fieldId);
            console.log("Slot ID:", slotId); // Verifica que el slot ID sea correcto

            await createReservation({ eventId, fieldId, slotId });

            Alert.alert("Reserva solicitada", "Tu reserva ha sido solicitada con éxito.", [
                { text: "OK", onPress: () => navigation.navigate("Inicio") }
            ]);
        } catch (error) {
            console.error("❌ Error creando reserva:", error);
            Alert.alert("Error", "No se pudo completar la reserva. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.subTitle}>Estás solicitando una reserva para</Text>
                <Text style={styles.clubName}>{clubName}</Text>

                {/* Detalles de la reserva */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailLabel}>Ubicación:</Text>
                    <Text style={styles.detailValue}>{clubLocation}</Text>

                    <Text style={styles.detailLabel}>Dirección:</Text>
                    <Text style={styles.detailValue}>{clubAddress}</Text>

                    <Text style={styles.detailLabel}>Cancha:</Text>
                    <Text style={styles.detailValue}>{fieldName}</Text>

                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>{date}</Text>

                    <Text style={styles.detailLabel}>Hora:</Text>
                    <Text style={styles.detailValue}>{slotStart} hs</Text>

                    <Text style={styles.detailLabel}>Duración:</Text>
                    <Text style={styles.detailValue}>{slotDuration} min</Text>

                    <Text style={styles.detailLabel}>Capacidad:</Text>
                    <Text style={styles.detailValue}>{capacity} jugadores</Text>

                    <Text style={styles.detailLabel}>Descripción:</Text>
                    <Text style={styles.detailValue}>{description}</Text>

                    <Text style={styles.detailLabel}>Costo:</Text>
                    <Text style={styles.detailValue}>${cost}</Text>
                </View>

                {/* Botón de reserva */}
                <TouchableOpacity style={styles.reserveButton} onPress={handleReservation} disabled={loading}>
                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Solicitar reserva</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default FieldReservation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary10,
        alignItems: "center",
    },
    scrollContainer: {
        paddingVertical: 20,
        width: 300,
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 10,
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
        padding: 20,
        borderRadius: 12,
        width: "100%",
        alignSelf: "center",
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
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
    },
    reserveButton: {
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
});
