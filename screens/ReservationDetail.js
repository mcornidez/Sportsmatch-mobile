import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity, ActivityIndicator
} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import {DateTime} from "luxon";
import { getClubById } from "../services/clubService";
import { getPaymentsByReservationId } from "../services/paymentsService";
import { cancelReservation } from "../services/reservationService";
import CustomButton from "../components/CustomButton";
import * as SecureStore from "expo-secure-store";

const ReservationDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { reservationData } = route.params;

    if (!reservationData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No hay información de reserva disponible.</Text>
            </View>
        );
    }

    // Obtener datos de la reserva
    const { field, timeSlots, cost, status } = reservationData;
    const [clubAddress, setClubAddress] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(true);
    const [loadingCancel, setLoadingCancel] = useState(false);

    useEffect(() => {
        const fetchClubAddress = async () => {
            try {
                const club = await getClubById(field.clubId);
                setClubAddress(club.address || "Dirección no disponible");
            } catch (error) {
                console.error("Error obteniendo la dirección del club:", error);
                setClubAddress("Error al obtener la dirección.");
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchClubAddress();
    }, [field.clubId]);

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            try {
                const payments = await getPaymentsByReservationId(reservationData.id);
                console.log("📌 Pagos obtenidos:", payments); // 🔍 Verifica qué devuelve la API

                if (Array.isArray(payments) && payments.length === 0) {
                    setPaymentStatus("Pendiente");
                } else if (payments.length > 0) {
                    setPaymentStatus(payments[0].transactionStatus || "Desconocido");
                }
            } catch (error) {
                console.error("Error obteniendo estado del pago:", error);
                setPaymentStatus("Error al obtener el estado.");
            } finally {
                setLoadingPayment(false);
            }
        };

        fetchPaymentStatus();
    }, [reservationData.id]);

    const handlePayment = async () => {
        if (!reservationData) return;

        const token = await SecureStore.getItemAsync("userToken");

        navigation.navigate("NewPayment", {
            amount: reservationData.cost,
            reservationId: reservationData.id,
            apiKey: token,
        });
    };

    const handleCancelReservation = async () => {
        Alert.alert(
            "Confirmar cancelación",
            "¿Estás seguro de que deseas cancelar esta reserva?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Sí, cancelar",
                    onPress: async () => {
                        setLoadingCancel(true);
                        try {
                            await cancelReservation(reservationId);
                            Alert.alert("Reserva cancelada", "La reserva ha sido cancelada exitosamente.");
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("Error", "No se pudo cancelar la reserva. Inténtalo nuevamente.");
                        } finally {
                            setLoadingCancel(false);
                        }
                    },
                },
            ]
        );
    };


    // Formatear fecha y hora de la reserva
    const startTime = DateTime.fromFormat(timeSlots[0].startTime, "HH:mm:ss");
    const endTime = DateTime.fromFormat(timeSlots[0].endTime, "HH:mm:ss");
    const duration = endTime.diff(startTime, "minutes").minutes;

    const formattedDate = DateTime.fromISO(timeSlots[0].date).toFormat("dd/MM/yyyy");
    const formattedStartTime = startTime.toFormat("HH:mm");

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.clubName}>{field.clubName}</Text>

            {/* Detalles de la reserva */}
            <View style={styles.detailsContainer}>
                <Text style={styles.detailLabel}>Ubicación:</Text>
                {loadingAddress ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={styles.detailValue}>{clubAddress}</Text>
                )}

                <Text style={styles.detailLabel}>Cancha:</Text>
                <Text style={styles.detailValue}>{field.name}</Text>

                <Text style={styles.detailLabel}>Fecha y hora:</Text>
                <Text style={styles.detailValue}>{formattedDate} a las {formattedStartTime}</Text>

                <Text style={styles.detailLabel}>Duración:</Text>
                <Text style={styles.detailValue}>{duration} min</Text>

                {field.description && (
                    <>
                        <Text style={styles.detailLabel}>Descripción:</Text>
                        <Text style={styles.detailValue}>{field.description}</Text>
                    </>
                )}

                <Text style={styles.detailLabel}>Costo:</Text>
                <Text style={styles.detailValue}>${cost}</Text>


                {/* Estado de la reserva */}
                <Text style={styles.statusLabel}>Estado de la reserva:</Text>
                    <Text style={[
                        styles.statusValue,
                        status === "confirmed" ? styles.approved :
                            status === "pending" ? styles.pending :
                                status === "completed" ? styles.approved :
                                styles.rejected
                    ]}>
                        {status === "confirmed" ? "Confirmada" :
                            status === "pending" ? "Pendiente" :
                                status === "completed" ? "Completada" :
                                "Cancelada"}
                    </Text>


                {/* Estado del pago */}
                <Text style={styles.statusLabel}>Estado del pago de la seña:</Text>
                {loadingPayment ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={[
                        styles.statusValue,
                        paymentStatus === "approved" ? styles.approved :
                            paymentStatus === "rejected" ? styles.rejected :
                                styles.pending
                    ]}>
                        {paymentStatus === "approved" ? "Aprobado" :
                            paymentStatus === "rejected" ? "Rechazado" :
                                "Pendiente"}
                    </Text>
                )}

                <View style={styles.buttonContainer}>
                    {(paymentStatus !== "approved")&& (
                        <CustomButton
                            title={`Pagar seña ($${(cost / 2).toFixed(0)})`}
                            onPress={handlePayment}
                            color={COLORS.primary}
                            style={styles.actionButton}
                        />
                    )}

                    {(status !== "cancelled")&& (
                        <CustomButton
                            title={"Cancelar reserva"}
                            onPress={() => console.log("Cancelar reserva")}
                            color={"red"}
                            style={styles.cancelButton}
                        />
                    )}
                </View>

                <Text style={styles.noteText}>
                    Recordá que si cancelas con 24hs de anticipación, se te devolverá la seña.
                </Text>
            </View>
        </ScrollView>
    );
};

export default ReservationDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary10,
        padding: 40,
        alignItems: "center",
        paddingTop: 20,
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
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    approved: {
        color: "green",
    },
    pending: {
        color: "orange",
    },
    rejected: {
        color: "red",
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
    },
    buttonContainer: {
        width: "100%",
        alignItems: "center",
        marginTop: 16,
        gap: 12
    },
    actionButton: {
        width: "80%",
        paddingVertical: 10,
        marginVertical: 8,
    },
    cancelButton: {
        width: "80%",
        paddingVertical: 10,
        marginVertical: 8,
    },

});
