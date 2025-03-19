import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert
} from "react-native";
import {useNavigation, useRoute, useFocusEffect} from "@react-navigation/native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "../constants";
import {DateTime} from "luxon";
import {getClubById} from "../services/clubService";
import {getPaymentsByReservationId} from "../services/paymentsService";
import {cancelReservation, fetchReservationsByEvent} from "../services/reservationService";
import CustomButton from "../components/CustomButton";
import * as SecureStore from "expo-secure-store";
import {UserContext} from "../contexts/UserContext";

const ReservationDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {eventId, isOwner, eventDate, eventDuration} = route.params;
    const [reservationData, setReservationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clubAddress, setClubAddress] = useState(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [loadingCancel, setLoadingCancel] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const parsedEventDate = eventDate ? DateTime.fromISO(eventDate) : null;

    const fetchReservation = async () => {
        try {
            const reservations = await fetchReservationsByEvent(eventId);
            if (Array.isArray(reservations) && reservations.length > 0) {
                const cancelledReservation = reservations.find(r => r.status === "cancelled");
                if (cancelledReservation) {
                    setReservationData({...cancelledReservation, isCancelled: true});
                } else {
                    // Asumimos que si no hay canceladas, tomamos la primera activa
                    setReservationData({...reservations[0], isCancelled: false});
                }
            } else {
                setReservationData(null);
            }
        } catch (error) {
            console.error("❌ Error obteniendo la reserva:", error);
            setReservationData(null);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchReservation();
        }, [eventId])
    );

    const fetchClubAddress = async () => {
        if (reservationData?.field?.clubId) {
            try {
                const club = await getClubById(reservationData.field.clubId);
                setClubAddress(club.address || "Dirección no disponible");
            } catch (error) {
                console.error("Error obteniendo la dirección del club:", error);
                setClubAddress("Error al obtener la dirección.");
            } finally {
                setLoadingAddress(false);
            }
        } else {
            setLoadingAddress(false);
        }
    };

    useEffect(() => {
        if (reservationData) {
            fetchClubAddress();
        }
    }, [reservationData]);

    if (loading) {
        return <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: "50%"}}/>;
    }

    if (!reservationData) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No hay información de reserva disponible.</Text>
            </View>
        );
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchReservation();
        await fetchClubAddress();
        setRefreshing(false);
    };

    const {field, timeSlots, cost, status, payment} = reservationData;
    const isPaid = payment?.isPaid || false;
    const paymentDate = payment?.paymentDate;


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
            clubName: reservationData.clubName,
            isPaid,
            eventId,
            isOwner,
            eventDate,
            eventDuration,
            paymentDate
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
                {text: "No", style: "cancel", onPress: () => console.log("🚫 Cancelación abortada por el usuario")},
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
    } else if (parsedEventDate) {
        let eventAdjusted = parsedEventDate;

        if (reservationData?.status === "cancelled") {
            eventAdjusted = parsedEventDate.plus({hours: 3});
        }

        formattedDate = eventAdjusted.toFormat("dd/MM/yyyy");
        formattedStartTime = eventAdjusted.toFormat("HH:mm");
        duration = eventDuration || 0;
    } else {
        formattedDate = "No disponible";
        formattedStartTime = "No disponible";
        duration = 0;
    }

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    tintColor={COLORS.primary}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
            contentContainerStyle={{
            padding: 40,
            paddingTop: 20,
            backgroundColor: COLORS.primary10,
            minHeight: "100%",
        }}>
            <Text style={styles.clubName}>{field?.clubName || "Cancha no disponible"}</Text>

            <View style={styles.detailsContainer}>
                <Text style={styles.detailLabel}>Ubicación:</Text>
                {loadingAddress ? (
                    <ActivityIndicator size="small" color={COLORS.primary}/>
                ) : (
                    <Text style={styles.detailValue}>{clubAddress || "No disponible"}</Text>
                )}

                <Text style={styles.detailLabel}>Cancha:</Text>
                <Text style={styles.detailValue}>{field?.name || "No disponible"}</Text>

                {field?.description && (
                    <>
                        <Text style={styles.detailLabel}>Descripción:</Text>
                        <Text style={styles.detailValue}>{field.description}</Text>
                    </>
                )}

                <Text style={styles.detailLabel}>Fecha y hora:</Text>
                <Text style={styles.detailValue}>{formattedDate} a las {formattedStartTime}</Text>

                <Text style={styles.detailLabel}>Duración:</Text>
                <Text style={styles.detailValue}>{duration} min</Text>

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
                        {payment.isRefunded ? (
                            <>
                                <Text style={[styles.statusValue, {color: "green"}]}>Reembolsado</Text>
                                <Text style={styles.detailText}>Monto reembolsado:
                                    ${Number(payment.refundAmount).toFixed(2)}</Text>
                                <Text
                                    style={styles.detailText}>Fecha: {DateTime.fromISO(payment.refundDate).toFormat('dd/MM/yyyy HH:mm')}</Text>
                            </>
                        ) : status === "cancelled" && !payment.isRefunded ? (
                            <>
                                <Text style={[styles.statusValue, { color: "red" }]}>No reembolsado</Text>
                                <Text style={styles.noteText}>
                                    La seña no fue devuelta porque la reserva se canceló con menos de 24hs de anticipación.
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={[
                                    styles.statusValue,
                                    isPaid ? styles.approved : styles.pending
                                ]}>
                                    {isPaid ? "Aprobado" : "Pendiente"}
                                </Text>

                                <View style={styles.buttonContainer}>
                                    {!isPaid && status === "confirmed" && (
                                        <>
                                            <Text style={styles.noteText}>
                                                Recordá que tenés hasta 24hs antes de la reserva para pagar la seña.
                                                Caso contrario, el club puede cancelar la reserva.
                                            </Text>
                                            <CustomButton
                                                title={`Pagar seña`}
                                                onPress={handlePayment}
                                                color={COLORS.primary}
                                                style={styles.actionButton}
                                            />
                                        </>
                                    )}

                                    {isPaid && (
                                        <CustomButton
                                            title="Detalle del pago"
                                            onPress={handlePayment}
                                            color={COLORS.primary}
                                            style={styles.actionButton}
                                        />
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
                                                Recordá que si cancelas con 24hs de anticipación, se te devolverá la
                                                seña.
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
    );

};

export default ReservationDetail;

const styles = StyleSheet.create({
    container: {
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
        textAlign: "center"
    },
    detailsContainer: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 8,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
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
