import React, { useEffect, useState } from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';

const NewPayment = ({route}) => {
    const navigation = useNavigation();
    const { amount, reservationId, apiKey, eventId, isOwner, eventDate, eventDuration } = route.params;

    const handleWebViewMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            console.log('Message from WebView:', message);
            
            switch(message.type) {
                case 'PAYMENT_SUBMISSION':
                    console.log('Payment submitted:', message.data);
                    break;
                case 'PAYMENT_RESPONSE':
                    console.log('Payment processed:', message.data);
                    const paymentStatus = message.data.transactionStatus; // Extrae el estado del pago

                    if (paymentStatus === "rejected") {
                        Alert.alert("Pago rechazado", "Tu pago fue rechazado. Por favor, intenta nuevamente.", [
                            { text: "OK", onPress: () => navigation.navigate("ReservationDetail", {reservationId, eventId, isOwner, eventDate, eventDuration })}
                        ]);
                    } else if (paymentStatus === "approved") {
                        Alert.alert("Pago aprobado", "Tu pago fue aprobado con éxito.", [
                            { text: "OK", onPress: () => navigation.navigate("ReservationDetail", {reservationId, eventId, isOwner, eventDate, eventDuration })}
                        ]);
                    } else {
                        Alert.alert("Error en el pago", "Hubo un error procesando tu pago. Inténtalo nuevamente.", [
                            { text: "OK", onPress: () => navigation.navigate("ReservationDetail", {reservationId, eventId, isOwner, eventDate, eventDuration })}
                        ]);
                    }
                    break;
                case 'PAYMENT_ERROR':
                case 'BRICK_ERROR':
                    console.error('Error:', message.error);
                    Alert.alert("Error en el pago", "Ocurrió un problema con el procesamiento del pago. Inténtalo nuevamente.", [
                        { text: "OK", onPress: () => navigation.navigate("ReservationDetail", {reservationId, eventId, isOwner, eventDate, eventDuration })}
                    ]);
                    break;
            }
        } catch (error) {
            console.log('WebView message:', event.nativeEvent.data);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{
                    uri: `https://payment-brick.vercel.app/?amount=${amount}&reservationId=${reservationId}&apiUrl=${API_URL}&apiKey=${apiKey}`
                }}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['*']}
                mixedContentMode="always"
                startInLoadingState={true}
                allowsInlineMediaPlayback={true}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    webview: {
        flex: 1,
        backgroundColor: COLORS.white,
    }
});

export default NewPayment;
   