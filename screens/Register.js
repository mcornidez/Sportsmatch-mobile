import React, { useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { COLORS, FONTS } from "../constants";
import { TextInput } from "react-native-gesture-handler";
import { validateEmail, validatePassword } from "../utils/validations";
import { AuthContext } from "../contexts/authContext";
import PhoneInput from "react-native-phone-number-input";
import { PhoneNumberUtil } from "google-libphonenumber";
import CustomButton from "../components/CustomButton";
import { StatusBar } from "expo-status-bar";

const Register = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const authContext = useContext(AuthContext);
  const phoneUtil = PhoneNumberUtil.getInstance();
  const [signUpError, setSignUpError] = useState(false);
  const [phoneConflict, setPhoneConflict] = useState(false);
  const [emailConflict, setEmailConflict] = useState(false);
  const [passError, setPassError] = useState("");
  const [confPassError, setConfPassError] = useState("");

  const parsePhoneNumber = (phone) => {
    const parsedNumber = phoneUtil.parse(phone, "");
    const code = phoneUtil.getRegionCodeForNumber(parsedNumber);
    const national_number = phoneUtil
      .parseAndKeepRawInput(phone, code)
      .getNationalNumber();
    return {
      code: code,
      national_number: national_number.toString(),
    };
  };

  const validatePhone = (phone) => {
    const { code, national_number } = parsePhoneNumber(phone);
    return phoneUtil.isValidNumberForRegion(
      phoneUtil.parse(national_number, code),
      code
    );
  };

  const submit = async (data) => {
    setPhoneConflict(false);
    setEmailConflict(false);
    delete data.confPassword;

    const res = await authContext.signUp(data);
    if (res.ok) {
      navigation.navigate("Login");
    } else if (res.internalStatus === "CONFLICT") {
      res.message === "email" ? setEmailConflict(true) : setPhoneConflict(true);
    } else if (res.internalStatus === "VALIDATION_ERROR") {
      setSignUpError(true);
    }
  };

  return (
    <SafeAreaView
      style={Platform.OS !== "ios" ? { paddingTop: 40 } : { flex: 1 }}
    >
      <StatusBar backgroundColor={COLORS.primary} style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text
            style={{
              ...FONTS.h1,
              fontSize: 40,
              color: COLORS.primary,
              paddingTop: 50,
            }}
          >
            SportsMatch
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Nombre</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={(text) =>
                    onChange(text.charAt(0).toUpperCase() + text.slice(1))
                  }
                  value={value}
                />
              )}
              name="firstName"
            />
          </View>
          {errors.name && (
            <Text style={styles.error}>Este campo no puede estar vacio</Text>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Apellido</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={(text) =>
                    onChange(text.charAt(0).toUpperCase() + text.slice(1))
                  }
                  value={value}
                />
              )}
              name="lastName"
            />
          </View>
          {errors.lastName && (
            <Text style={styles.error}>Este campo no puede estar vacío</Text>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Email</Text>
            <Controller
              control={control}
              rules={{
                required: true,
                pattern: {
                  matchPattern: (mail) => validateEmail(mail),
                  message: "Dirección de correo inválida",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="email"
            />
          </View>
          {errors.email && (
            <Text style={styles.error}>Por favor ingrese un email válido</Text>
          )}
          {emailConflict && (
            <Text style={styles.error}>El email ya está en uso</Text>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Fecha de nacimiento</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="dd/mm/aaaa"
                />
              )}
              name="birthdate"
            />
          </View>
          {errors.birthdate && (
            <Text style={styles.error}>
              Por favor ingrese su fecha de nacimiento
            </Text>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Telefono</Text>
            <Controller
              control={control}
              rules={{
                required: true,
                validate: (phone) => {
                  return validatePhone(phone);
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <PhoneInput
                  defaultValue={""}
                  defaultCode="AR"
                  layout="first"
                  placeholder="Numero de telefono"
                  containerStyle={styles.phoneContainer}
                  textContainerStyle={styles.phoneContainer.input}
                  flagButtonStyle={styles.phoneContainer.flag}
                  onChangeFormattedText={(text) => {
                    onChange(text);
                  }}
                />
              )}
              name="phoneNumber"
            />
          </View>
          {errors.phoneNumber && (
            <Text style={styles.error}>
              Por favor ingrese un número de teléfono válido
            </Text>
          )}
          {phoneConflict && (
            <Text style={styles.error}>
              Este número de teléfono ya fue registrado
            </Text>
          )}
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>Contraseña</Text>
            <Controller
              control={control}
              rules={{
                required: true,
                minLength: 8,
                pattern: {
                  matchPattern: (password) => validatePassword(password),
                  message: "Contraseña inválida",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    let errorMessage = "";

                    if (!/[a-z]/.test(text)) {
                      errorMessage +=
                        "Se requiere al menos una letra minúscula\n";
                    }

                    if (!/[A-Z]/.test(text)) {
                      errorMessage +=
                        "Se requiere al menos una letra mayúscula\n";
                    }

                    if (!/\d/.test(text)) {
                      errorMessage += "Se requiere al menos un dígito\n";
                    }

                    if (!/\W/.test(text)) {
                      errorMessage +=
                        "Se requiere al menos un caracter especial\n";
                    }

                    setPassError(errorMessage);
                    onChange(text);
                  }}
                  value={value}
                  secureTextEntry={true}
                />
              )}
              name="password"
            />
          </View>
          {<Text style={styles.error}>{passError}</Text>}
          {errors.password && (
            <Text style={styles.error}>
              Por favor ingrese una contraseña válida
            </Text>
          )}
          <View style={[styles.inputContainer, { marginBottom: 10 }]}>
            <Text style={styles.inputText}>Confirmar contraseña</Text>
            <Controller
              control={control}
              rules={{
                required: true,
                length: 8,
                validate: (value) => value === watch("password"),
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    setConfPassError("");
                    if (text !== watch('password')) {
                      setConfPassError("Las contraseñas deben coincidir");
                    }
                    onChange(text);
                  }}
                  value={value}
                  secureTextEntry={true}
                />
              )}
              name="confPassword"
            />
          </View>
          {<Text style={styles.error}>{confPassError}</Text>}
          {errors.confPassword && (
            <Text style={styles.error}>Las contraseñas no son iguales</Text>
          )}
          <CustomButton title="Registrarse" onPress={handleSubmit(submit)} />
          {signUpError && (
            <Text style={styles.error}>
              Hubo un error, por favor intente nuevamente.
            </Text>
          )}
          <TouchableOpacity
            style={{ marginTop: 10 }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.referal}>Ya tenes una cuenta?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    paddingHorizontal: 24,
    gap: 14,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: COLORS.primary,
    color: COLORS.primary,
    fontSize: 16,
  },
  inputContainer: {
    alignSelf: "stretch",
    gap: 5,
  },
  inputText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 10,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.transparent,

    flag: {
      width: 55,
      marginLeft: 10,
    },
    input: {
      backgroundColor: COLORS.transparent,
      paddingVertical: 12,
    },
  },
  referal: {
    color: COLORS.primary,
    fontSize: 18,
  },
  error: {
    ...FONTS.body3,
    color: "#F00",
    fontWeight: "700",
  },
  errorList: {
    ...FONTS.body3,
    color: "#F00",
    fontWeight: "700",
    fontSize: 11,
  },
});

export default Register;
