import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons'; 
import { COLORS } from '../constants';

export const CustomMultiDropdown = ({data, onChangeItem, defaultValues}) => {
  const [selected, setSelected] = useState(defaultValues);

  return (
    <View style={styles.container}>
      <MultiSelect
        activeColor={COLORS.primary20}
        dropdownPosition='top'
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        search
        data={data.map((item) => ({ label: item, value: item }))}
        labelField="label"
        valueField="value"
        placeholder="Seleccione una ubicación"
        searchPlaceholder="Buscar..."
        value={selected}
        onChange={items => {
            onChangeItem(items);
            setSelected(items);
        }}
        renderLeftIcon={() => (
            <Ionicons name="location-sharp" size={24} color={COLORS.primary} style={styles.icon} /> 
        )}
        selectedStyle={styles.selectedStyle}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  dropdown: {
    height: 55,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.white
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
});