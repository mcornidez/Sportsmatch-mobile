import { Ionicons } from "@expo/vector-icons";
import { View , Text, StyleSheet} from "react-native";
import { COLORS, FONTS } from "../constants";


export const Spots = ({qty, alternative = false}) => {
    return (
    <View style={[styles.mainContainer, alternative ? {backgroundColor: COLORS.primary} : {}]}>
        <Text style={[FONTS.body3, {fontWeight: 600, color: alternative ? COLORS.white : COLORS.primary}]}>Vacantes: </Text>
        <View style={styles.qtyContainer}>
            <Ionicons name="person" style= {{paddingTop: 0}}size={16} color={alternative ? COLORS.white : COLORS.primary} />
            <Text style={[FONTS.body3, {color: alternative ? COLORS.white : COLORS.primary}]}> {qty}</Text>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        maxWidth: 140,
        justifyContent: 'space-between',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        backgroundColor: COLORS.primary10
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6
    }
});