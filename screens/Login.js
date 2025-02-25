import React, { useContext, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { COLORS, FONTS } from "../constants";
import { validateEmail } from "../utils/validations";
import { AuthContext } from "../contexts/authContext";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../components/CustomButton";
import { Image } from "@rneui/base";
import { StatusBar } from "expo-status-bar";


const Login = () => {
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext)
  const { control, handleSubmit, formState: { errors } } = useForm();
  const navigation = useNavigation();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authContext.signIn(data)
    }
    catch (err) {
      setLoading(false);
      console.error('Error signing in', err);
    }
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar backgroundColor={COLORS.primary} style="light" />
      <View
       style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 24,
      }}>

        {loading ? <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ alignSelf: "center", marginTop: "10%" }}
        /> : 
        <>
        <View style={{ alignSelf: 'stretch', 
        alignItems: 'center', flex: 1, maxHeight: '30%', justifyContent: 'flex-end'}}>
          <Image
            style={{ height: 200,width: 200, }}
            resizeMode="contain"
            source={require("../assets/logo.png")}
            />
        </View>

          {errors.email && <Text style={styles.error}>Email o contraseña incorrecta</Text>}

          <View style={{alignSelf: 'stretch', gap: 14}}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Email</Text>
            <Controller control={control}
              rules={{
                required: true,
                validate: {
                  matchPattern: v => validateEmail(v),
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />)}
              name="email"
            />
          </View>
          {errors.email && (
            <Text style={styles.error}>Por favor ingrese un email válido</Text>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Contraseña</Text>
            <Controller control={control}
              rules={{
                minLength: 8,
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={true}
                  />)}
              name="password"
              />
          </View>
          </View>
          {errors.password && (
            <Text style={styles.error}>Por favor ingrese una contraseña válida</Text>
          )}
          <View style={{ height: 50 }}></View>
          <CustomButton
            title="Iniciar sesion"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
          <TouchableOpacity
            style={{ marginTop: 10 }}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.referal}>Todavía no tenes una cuenta?</Text>
          </TouchableOpacity>
        </>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 12,
    borderColor: COLORS.primary,
    color: COLORS.primary,
    fontSize: 16
  },
  inputContainer: {
    alignSelf: 'stretch',
    gap: 8,
  },
  inputText: {
    ...FONTS.body2,
    marginLeft: 10,
    color: COLORS.primary,
  },
  error: {
    ...FONTS.body3,
    color: "#F00",
    fontWeight: "700",
  },
  referal: {
    color: COLORS.primary,
    fontSize: 18,
  },
});

export default Login;
