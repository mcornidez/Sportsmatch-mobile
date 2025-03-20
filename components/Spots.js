import { Ionicons } from "@expo/vector-icons";
import { View , Text, StyleSheet} from "react-native";
import { COLORS, FONTS } from "../constants";


export const Spots = ({qty, alternative = false}) => {
    return (
        <View style={[styles.qtyBadge, alternative && { backgroundColor: COLORS.primary }]}>
            <Ionicons name="person" size={14} color={alternative ? COLORS.white : COLORS.primary} />
            <Text style={[{ marginLeft: 4, fontWeight: "600", fontSize: 14, color: alternative ? COLORS.white : COLORS.primary }]}>
                {qty} vacantes
            </Text>
        </View>

    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flexDirection: 'row',
        maxWidth: 140,
        justifyContent: 'space-between',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        alignItems: 'center',
        marginLeft: 6,
        backgroundColor: COLORS.primary10
    },
    qtyBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignSelf: 'flex-start'
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});