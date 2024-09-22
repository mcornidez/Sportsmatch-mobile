import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';

const CustomButton = ({ title, onPress, color, isLoading = false, enabled=true, filled=true }) => {
  return (
    <TouchableOpacity onPress={enabled ? onPress : () => {}} 
    style={[styles.button, filled ? {backgroundColor: color ?? COLORS.primary} : styles.notFilled]} disabled={isLoading}>
      {isLoading ? <ActivityIndicator size="small" color="white" style={{paddingRight: 10}} />:
      <Text style={[styles.buttonText, {color: filled ? COLORS.white : COLORS.primary}]}>{title}</Text>}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'stretch',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notFilled: {
    backgroundColor: COLORS.transparent,
  }
});