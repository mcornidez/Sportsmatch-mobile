import React from "react";
import * as SecureStore from "expo-secure-store";
import CustomButton from "../components/CustomButton";
import {useNavigation, useRoute} from "@react-navigation/native";
import {View, StyleSheet, Text} from "react-native";
import { COLORS } from "../constants";

const PaymentDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { token, reservationId, reservationCost, clubName } = route.params;

    if (!reservationId) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: No se recibió información de la reserva.</Text>
            </View>
        );
    }

    const reservationValue = parseFloat(reservationCost);
    const depositValue = reservationValue * 0.5;
    const commission = reservationValue * 0.025;
    const totalToPayNow = depositValue + commission;
    const totalToPayOnSite = depositValue;

    const handlePayment = async () => {

        navigation.navigate("NewPayment", {
            amount: totalToPayNow,
            reservationId: reservationId,
            apiKey: token,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>{clubName}</Text>

            <View style={styles.detailsContainer}>
                <Text style={styles.detailLabel}>Valor de la reserva:</Text>
                <Text style={styles.detailValue}>${reservationValue.toFixed(2)}</Text>

                <Text style={styles.detailLabel}>Valor de la seña:</Text>
                <Text style={styles.detailValue}>${depositValue.toFixed(2)}</Text>

                <Text style={styles.detailLabel}>Comisión (2.5%):</Text>
                <Text style={styles.detailValue}>${commission.toFixed(2)}</Text>

                <View style={styles.divider} />

                <Text style={styles.totalLabel}>Total a pagar hoy:</Text>
                <Text style={styles.totalValue}>${totalToPayNow.toFixed(2)}</Text>

                <Text style={styles.totalLabel}>Total a pagar en el lugar:</Text>
                <Text style={styles.totalValue}>${totalToPayOnSite.toFixed(2)}</Text>
            </View>

            <View style={{ width: "100%", alignItems: "center", marginTop: 40 }}>
                <CustomButton
                    title="Pagar"
                    onPress={handlePayment}
                    color={COLORS.primary}
                    style={styles.actionButton}
                />
            </View>

        </View>
    );
};

export default PaymentDetail;

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
        color: COLORS.primary,
        marginBottom: 10,
    },
    detailsContainer: {
        backgroundColor: COLORS.white,
        marginTop: 25,
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
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.primary,
        marginTop: 10,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.lightGray,
        marginVertical: 10,
    },
    actionButton: {
        width: "80%",
        paddingVertical: 10,
        marginVertical: 20,
        marginTop: 40,
    },
    errorText: {
        fontSize: 16,
        color: "red",
        fontWeight: "bold",
        textAlign: "center",
    },
});
