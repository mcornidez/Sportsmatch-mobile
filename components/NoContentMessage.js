import { StyleSheet, Text, View } from "react-native"
import { COLORS } from "../constants";

export const NoContentMessage = ({message}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: COLORS.primary20,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 500,

    }
});