import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
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
import { UserContext } from "../contexts/UserContext";

const ReservationDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { reservationData, isOwner, eventDate, eventDuration } = route.params;

    const parsedEventDate = eventDate ? DateTime.fromISO(eventDate) : null;

    if (!reservationData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No hay información de reserva disponible.</Text>
            </View>
        );
    }

    const { field, timeSlots, cost, status } = reservationData;
    const [clubAddress, setClubAddress] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(true);
    const [loadingCancel, setLoadingCancel] = useState(false);

    useEffect(() => {
        const fetchClubAddress = async () => {
            try {
                if (field && field.clubId) {
                    const club = await getClubById(field.clubId);
                    setClubAddress(club.address || "Dirección no disponible");
                } else {
                    setClubAddress("Dirección no disponible");
                }
            } catch (error) {
                console.error("Error obteniendo la dirección del club:", error);
                setClubAddress("Error al obtener la dirección.");
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchClubAddress();
    }, [field]);

    useEffect(() => {
        if (isOwner && reservationData && reservationData.id) {
            const fetchPaymentStatus = async () => {
                try {
                    const payments = await getPaymentsByReservationId(reservationData.id);

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
        } else {
            setLoadingPayment(false);
        }
    }, [isOwner, reservationData]);

    const handlePayment = async () => {
        if (!reservationData || !reservationData.id || !reservationData.cost) {
            Alert.alert("Error", "No se puede procesar el pago porque falta información de la reserva.");
            return;
        }

        const token = await SecureStore.getItemAsync("userToken");

        navigation.navigate("PaymentDetail", {
            token: token,
            reservationCost: reservationData.cost,
            reservationId: reservationData.id,
            clubName: reservationData.clubName
        });
    };

    const handleCancelReservation = async () => {
        console.log("🛑 Iniciando proceso de cancelación de reserva...");

        if (!reservationData || !reservationData.id) {
            Alert.alert("Error", "No se puede cancelar la reserva porque no hay información disponible.");
            return;
        }

        Alert.alert(
            "Confirmar cancelación",
            "¿Estás seguro de que deseas cancelar esta reserva?",
            [
                { text: "No", style: "cancel", onPress: () => console.log("🚫 Cancelación abortada por el usuario") },
                {
                    text: "Sí, cancelar",
                    onPress: async () => {
                        console.log("✅ Usuario confirmó la cancelación. Procediendo...");
                        setLoadingCancel(true);

                        try {
                            console.log(`📡 Enviando solicitud para cancelar la reserva con ID: ${reservationData.id}`);
                            await cancelReservation(reservationData.id);
                            console.log("✅ Reserva cancelada con éxito.");

                            Alert.alert("Reserva cancelada", "La reserva ha sido cancelada exitosamente.");
                            navigation.goBack();
                        } catch (error) {
                            console.error("❌ Error al cancelar la reserva:", error);
                            Alert.alert("Error", "No se pudo cancelar la reserva. Inténtalo nuevamente.");
                        } finally {
                            console.log("🔄 Finalizando proceso de cancelación.");
                            setLoadingCancel(false);
                        }
                    },
                },
            ]
        );
    };

    let startTime, endTime, duration, formattedDate, formattedStartTime;

    if (timeSlots && timeSlots.length > 0) {
        startTime = DateTime.fromFormat(timeSlots[0].startTime, "HH:mm:ss");
        endTime = DateTime.fromFormat(timeSlots[0].endTime, "HH:mm:ss");
        duration = endTime.diff(startTime, "minutes").minutes;
        formattedDate = DateTime.fromISO(timeSlots[0].date).toFormat("dd/MM/yyyy");
        formattedStartTime = startTime.toFormat("HH:mm");
    } 
    else if (parsedEventDate) {
        formattedDate = parsedEventDate.toFormat("dd/MM/yyyy");
        formattedStartTime = parsedEventDate.toFormat("HH:mm");
        duration = eventDuration || 0;
    }
    else {
        formattedDate = "No disponible";
        formattedStartTime = "No disponible";
        duration = 0;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.clubName}>{field?.clubName || "Cancha no disponible"}</Text>

            <View style={styles.detailsContainer}>
                <Text style={styles.detailLabel}>Ubicación:</Text>
                {loadingAddress ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={styles.detailValue}>{clubAddress || "No disponible"}</Text>
                )}

                <Text style={styles.detailLabel}>Cancha:</Text>
                <Text style={styles.detailValue}>{field?.name || "No disponible"}</Text>

                <Text style={styles.detailLabel}>Fecha y hora:</Text>
                <Text style={styles.detailValue}>{formattedDate} a las {formattedStartTime}</Text>

                <Text style={styles.detailLabel}>Duración:</Text>
                <Text style={styles.detailValue}>{duration} min</Text>

                {field?.description && (
                    <>
                        <Text style={styles.detailLabel}>Descripción:</Text>
                        <Text style={styles.detailValue}>{field.description}</Text>
                    </>
                )}

                <Text style={styles.detailLabel}>Costo:</Text>
                <Text style={styles.detailValue}>${cost || "No disponible"}</Text>

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
                            status === "completed" ? "Señada" :
                                "Cancelada"}
                </Text>

                {isOwner && (
                    <>
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
                            {paymentStatus !== "approved" && status === "confirmed" && (
                                <>
                                    <Text style={styles.noteText}>
                                        Recordá que tenés hasta 24hs antes de la reserva para pagar la seña.
                                        Caso contrario, el club puede cancelar la reserva.
                                    </Text>
                                    <CustomButton
                                        title={`Pagar seña ($${(cost / 2).toFixed(0)})`}
                                        onPress={handlePayment}
                                        color={COLORS.primary}
                                        style={styles.actionButton}
                                    />
                                </>
                            )}

                            {status !== "cancelled" && (
                                <>
                                    <CustomButton
                                        title={"Cancelar reserva"}
                                        onPress={handleCancelReservation}
                                        color={"red"}
                                        style={styles.cancelButton}
                                    />
                                    <Text style={styles.noteText}>
                                        Recordá que si cancelas con 24hs de anticipación, se te devolverá la seña.
                                    </Text>
                                </>
                            )}
                        </View>
                    </>
                )}
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
