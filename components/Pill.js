import React, {useState} from 'react'
import {Text, StyleSheet, TouchableOpacity} from 'react-native'
import { COLORS } from '../constants';


//TODO: Props es solo el title
const Pill = ({props, handlePress, currentFilter, customStyle}) => {

    const [selected, setSelected] = React.useState(false);

    React.useEffect(() => {
        setSelected(currentFilter === props.title)
    }, [currentFilter])


    return (
        <TouchableOpacity style = {
            [ customStyle ? customStyle : styles.pill, selected ? styles.selectedPill : null ]
        }
        onPress={() => {
            handlePress(props.title)
            }
        }>
            <Text style={[ selected ? {color: 'white', fontWeight: '700'}: {fontWeight: '400'}, customStyle ? customStyle.textStyle : null ]}>{props.title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pill : {
        flex: 1,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.primary,
        maxHeight: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 7,
        minHeight: 37,
    },
    selectedPill : {
        backgroundColor: COLORS.primary
    }
});

export default Pill;
