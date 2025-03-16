import React from 'react'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../constants';

// Ahora recibe el isSelected desde fuera, no lo calcula internamente
const Pill = ({ props, handlePress, customStyle }) => {
    return (
        <TouchableOpacity
            style={[styles.pill, customStyle]}
            onPress={handlePress}
        >
            <Text style={[styles.text, props.textStyle]}>
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
    }
});

export default Pill;
