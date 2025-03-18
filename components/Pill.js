import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../constants';

// Ahora recibe el isSelected desde fuera, no lo calcula internamente
const Pill = ({ props, handlePress, customStyle, currentFilter }) => {
    const isSelected = currentFilter;
    return (
        <TouchableOpacity
            style={[
                styles.pill,
                isSelected ? styles.selectedPill : styles.unselectedPill,
                customStyle
            ]}
            onPress={() => handlePress(props.title)}
        >
            <Text style={[
                styles.text,
                isSelected ? styles.selectedText : styles.unselectedText,
                props.textStyle
            ]}>
                {props.title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    pill: {
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.primary,
        maxHeight: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 7,
        minHeight: 37,
    },
    text: {
        fontSize: 14,
        fontWeight: '400'
    },
    selectedPill: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    unselectedPill: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.primary,
    },
    selectedText: {
        color: COLORS.white,
        fontWeight: "600"
    },
    unselectedText: {
        color: COLORS.primary,
        fontWeight: "400"
    }


});

export default Pill;
