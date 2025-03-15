import React, { useEffect, useState } from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../constants';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';
import {MyEvents} from "./index";

const NewPayment = ({route}) => {
    const navigation = useNavigation();
    const [webViewContent, setWebViewContent] = useState('');
    const { amount, reservationId, apiKey, eventId, isOwner, eventDate, eventDuration } = route.params;

    useEffect(() => {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://sdk.mercadopago.com/js/v2"></script>
            </head>
            <body style="margin:0;padding:0;background:white;">
                <div id="cardPaymentBrick_container"></div>
                <script>
                    const mp = new MercadoPago('TEST-1f8e0899-68a4-4042-8902-68dedc91dab8', {
                        locale: 'es-AR'
                    });
                    
                    const bricksBuilder = mp.bricks();
                    
                    const renderCardPaymentBrick = async (bricksBuilder) => {
                        const settings = {
                            initialization: {
                                amount: ${amount},
                                payer: {
                                    email: "",
                                },
                            },
                            customization: {
                                visual: {
                                    style: {
                                        theme: 'default'
                                    }
                                },
                                paymentMethods: {
                                    maxInstallments: 1,
                                }
                            },
                            callbacks: {
                                onReady: () => {
                                    // Notify React Native that the brick is ready
                                    window.ReactNativeWebView.postMessage('BRICK_READY');
                                },
                                onSubmit: (cardFormData) => {
                                    return new Promise((resolve, reject) => {
                                        // Send message to React Native with the form data
                                        window.ReactNativeWebView.postMessage(JSON.stringify({
                                            type: 'PAYMENT_SUBMISSION',
                                            data: cardFormData
                                        }));
                                        
                                        fetch("${API_URL}/payments/${reservationId}/process_payment", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "c-api-key": "${apiKey}"
                                            },
                                            body: JSON.stringify(cardFormData)
                                        })
                                        .then((response) => response.json())
                                        .then((response) => {
                                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                                type: 'PAYMENT_RESPONSE',
                                                data: response
                                            }));
                                            resolve();
                                        })
                                        .catch((error) => {
                                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                                type: 'PAYMENT_ERROR',
                                                error: error.message
                                            }));
                                            reject();
                                        });
                                    });
                                },
                                onError: (error) => {
                                    window.ReactNativeWebView.postMessage(JSON.stringify({
                                        type: 'BRICK_ERROR',
                                        error: error
                                    }));
                                },
                            },
                        };
                        window.cardPaymentBrickController = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', settings);
                    };
                    renderCardPaymentBrick(bricksBuilder);
                </script>
            </body>
            </html>
        `;
        setWebViewContent(htmlContent);
    }, []);

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
                            { text: "OK", onPress: () => navigation.navigate("ReservationDetail", { eventId, isOwner, eventDate, eventDuration })}
                        ]);
                    } else if (paymentStatus === "approved") {
                        Alert.alert("Pago aprobado", "Tu pago fue aprobado con éxito.", [
                            { text: "OK", onPress: () => navigation.navigate("ReservationDetail", { eventId, isOwner, eventDate, eventDuration })}
                        ]);
                    } else {
                        Alert.alert("Error en el pago", "Hubo un error procesando tu pago. Inténtalo nuevamente.", [
                            { text: "OK", onPress: () => navigation.navigate("ReservationDetail", { eventId, isOwner, eventDate, eventDuration })}
                        ]);
                    }
                    break;
                case 'PAYMENT_ERROR':
                case 'BRICK_ERROR':
                    console.error('Error:', message.error);
                    Alert.alert("Error en el pago", "Ocurrió un problema con el procesamiento del pago. Inténtalo nuevamente.", [
                        { text: "OK", onPress: () => navigation.navigate("ReservationDetail", { eventId, isOwner, eventDate, eventDuration })}
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
                source={{ html: webViewContent }}
                style={styles.webview}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                mixedContentMode="always"
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
   