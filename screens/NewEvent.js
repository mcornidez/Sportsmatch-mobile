import React, { useEffect, useState } from "react";
import { getSports } from "../services/sportService";
import { Switch } from "react-native";

import {
  Keyboard,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Modal,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import CustomButton from "../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import { EXPERTISE, LOCATIONS, SPORT } from "../constants/data";
import { COLORS, FONTS } from "../constants";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import {
  formatDate,
  formatTime,
  showDatepicker,
  showTimepicker,
} from "../utils/datetime";
import { publishEvent } from "../services/eventService";
import { useNavigation } from "@react-navigation/native";
import Pill from "../components/Pill";
import CustomDropdown from "../components/CustomDropdown";
import { ScrollView } from "react-native-gesture-handler";

const NewEvent = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      date: new Date(),
      time: new Date(),
    },
  });
  const [modalVisible, setModalVisible] = React.useState(false);
  const [customPlayerQty, setCustomPlayerQty] = React.useState("+");
  const eventDuration = ["60", "90", "120"];
  const playersQty = ["1", "2", "3", customPlayerQty];
  const [sports, setSports] = useState([]);
  const [isTimeOptional, setIsTimeOptional] = useState(false);


  const dateTimeToDate = (date, time) => {
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${time.getHours()}:${time
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sportsData = await getSports();
        setSports(sportsData);
      } catch (error) {
        console.error("Error loading sports:", error);
      }
    };

    fetchSports();
  }, []);

  const onSubmit = async (formData, goToHome) => {
    const {
      sport,
      difficulty,
      location,
      date,
      time,
      description,
      players,
      duration,
    } = formData;

    const selectedSport = sports.find((s) => s.name === sport);
    const sportId = selectedSport ? selectedSport.id : null;

    if (!sportId) {
      console.error("❌ Error: No se encontró el ID del deporte seleccionado.");
      return;
    }

    const data = {
      sportId: sportId,
      expertise: EXPERTISE.indexOf(difficulty) + 1,
      location: location,
      schedule: dateTimeToDate(date, time),
      description: description || " ",
      remaining: +players,
      duration: +duration,
    };

    try {
      setIsLoading(true);

      const response = await publishEvent(data);

      if (!response || !response.eventId) {
        console.error("❌ No se recibió eventId en la respuesta.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);

      if (goToHome === true) {
        navigation.navigate("Inicio");
      } else {
        navigation.navigate("Buscar Canchas", {
          eventId: response.eventId,
          sportId: data.sportId,
          location: data.location,
          date: formatDate(formData.date),
          time: formatTime(formData.time),
          duration: formData.duration
        });
      }

    } catch (err) {
      console.error("❌ Error creando evento:", err);
      setIsLoading(false);
    }
  };



  const renderErrors = () => {
    var errorMsg = "";
    if (errors.sport) {
      errorMsg += "deporte, ";
    }
    if (errors.difficulty) {
      errorMsg += "dificultad, ";
    }
    if (errors.location) {
      errorMsg += "ubicación, ";
    }
    if (errors.players) {
      errorMsg += "jugadores, ";
    }
    if (errors.duration) {
      errorMsg += "duración, ";
    }
    if (errors.description) {
      errorMsg += "descripción, ";
    }
    if (errorMsg) {
      return "Por favor ingrese: " + errorMsg.trim().replace(/,$/, "");
    }
    return errorMsg;
  };

  return (
    <ScrollView
      contentContainerStyle={{
        ...styles.centeredView,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: COLORS.primary10,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <Pressable
            style={styles.centeredView}
            onPress={(e) =>
              e.target == e.currentTarget && setModalVisible(false)
            }
          >
            <View style={styles.modalView}>
              <Text style={styles.modalText}>¿Cuantos jugadores faltan?</Text>
              <TextInput
                style={{
                  width: 50,
                  backgroundColor: COLORS.primary10,
                  borderColor: COLORS.primary,
                  borderWidth: 1,
                  borderRadius: 4,
                  padding: 8,
                }}
                textAlign="center"
                autoFocus={true}
                keyboardType="number-pad"
                onChangeText={(text) => setCustomPlayerQty(text)}
              />
              <CustomButton
                title="Guardar"
                onPress={() => {
                  setValue("players", customPlayerQty);
                  setModalVisible(false);
                }}
              />
            </View>
          </Pressable>
        </Modal>
        <View
          style={{
            flex: 1,
            alignSelf: "stretch",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomDropdown
                  selected={field.value}
                  setSelected={field.onChange}
                  data={sports.map(sport => sport.name)}
                  name="Deporte"
                />
              )}
              name="sport"
            />
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomDropdown
                  selected={field.value}
                  setSelected={field.onChange}
                  data={EXPERTISE}
                  name="Nivel"
                />
              )}
              name="difficulty"
            />
          </View>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomDropdown
                selected={field.value}
                setSelected={field.onChange}
                data={LOCATIONS}
                name="Lugar"
                search={true}
              />
            )}
            name="location"
          />
        </View>
        <View style={styles.dateTimeRowContainer}>
          {/* Sección de Fecha */}
          <View style={styles.dateTimeLabelContainer}>
            <Text style={styles.label}>Fecha</Text>
            <Controller
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  if (field.value === undefined) field.value = new Date();
                  return Platform.OS !== "ios" ? (
                      <TouchableOpacity
                          onPress={() => showDatepicker(field)}
                          style={styles.dateTimeContainer}
                      >
                        <Text style={{ textAlign: "center" }}>
                          {formatDate(field.value)}
                        </Text>
                      </TouchableOpacity>
                  ) : (
                      <RNDateTimePicker
                          style={{ alignSelf: "center", minWidth: "40%" }}
                          value={new Date(field.value)}
                          mode="date"
                          onChange={(event, selecteDate) =>
                              field.onChange(selecteDate)
                          }
                          minimumDate={new Date()}
                      />
                  );
                }}
                name="date"
            />
          </View>

          {/* Sección de Hora */}
          <View style={styles.dateTimeLabelContainer}>
            <Text style={styles.label}>Hora</Text>
            <Controller
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  if (field.value === undefined) field.value = new Date();

                  const selectedDate = watch("date") || new Date();
                  const today = new Date();
                  const isToday =
                      selectedDate.getFullYear() === today.getFullYear() &&
                      selectedDate.getMonth() === today.getMonth() &&
                      selectedDate.getDate() === today.getDate();

                  return Platform.OS !== "ios" ? (
                      <TouchableOpacity
                          onPress={() => showTimepicker(field)}
                          style={styles.dateTimeContainer}
                      >
                        <Text style={{ textAlign: "center" }}>
                          {formatTime(field.value)}
                        </Text>
                      </TouchableOpacity>
                  ) : (
                      <RNDateTimePicker
                          style={{ alignSelf: "center", marginRight: 8 }}
                          value={field.value}
                          mode="time"
                          onChange={(event, selectedDate) =>
                              field.onChange(selectedDate || field.value)
                          }
                          minimumDate={isToday ? new Date() : undefined}
                      />
                  );
                }}
                name="time"
            />
          </View>
        </View>
        <View style={{ flexDirection: "column" }}>
          <View style={styles.qtyInputContainer}>
            <Text style={styles.label}>Faltan</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => {
                  return playersQty.map((qty, index) => {
                    return (
                      <Pill
                        key={index}
                        props={{ title: qty }}
                        handlePress={
                          index != playersQty.length - 1
                            ? onChange
                            : () => setModalVisible(true)
                        }
                        currentFilter={value}
                      />
                    );
                  });
                }}
                name="players"
              />
            </View>
          </View>
          <View style={{ ...styles.qtyInputContainer }}>
            <Text style={styles.label}>Duración de preferencia (min)</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                maxWidth: "90%",
              }}
            >
              <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => {
                  return eventDuration.map((duration, index) => {
                    return (
                      <Pill
                        key={index}
                        props={{ title: duration }}
                        handlePress={onChange}
                        currentFilter={value}
                      />
                    );
                  });
                }}
                name="duration"
              />
            </View>
          </View>
        </View>
        {/* Cuadro de comentarios más pequeño */}
        <Controller
            control={control}
            rules={{ required: false, maxLength: 100 }}
            render={({ field }) => (
                <TextInput
                    placeholder="Comentarios (opcional)"
                    value={field.value || ""}
                    style={styles.smallInput}
                    multiline={true}
                    blurOnSubmit={true}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
                    onChangeText={(text) => field.onChange(text || "")}
                />
            )}
            name="description"
        />

        {errors.description && errors.description.type === "maxLength" && (
          <Text style={styles.error}>
            La descripción no debe tener más de 50 caracteres
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <CustomButton
              title="Crear sin cancha"
              isLoading={isLoading}
              onPress={() => handleSubmit((data) => onSubmit(data, true))()}
              color={COLORS.primary}
              style={styles.button}
          />

          <CustomButton
              title="Buscar canchas"
              isLoading={isLoading}
              onPress={() => handleSubmit((data) => onSubmit(data, false))()}
              color={COLORS.primary}
              style={styles.button}
          />
        </View>
        <Text style={styles.error}>{renderErrors()}</Text>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default NewEvent;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: "20%",
    alignSelf: "stretch",
    paddingHorizontal: 10,
    marginVertical: 16,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-around",
    width: "90%",
    alignSelf: "center",
    gap: 50,
    marginRight: 10
  },
  button: {
    flex: 1,
    paddingHorizontal: 10,
  },
  dateTimeRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  dateTimeContainer: {
    borderWidth: 1,
    borderColor: COLORS.primary20,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    minWidth: 130,
    alignSelf: "center",
  },
  smallInput: {
    height: 80,
    alignSelf: "stretch",
    paddingHorizontal: 10,
    marginVertical: 16,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 16,
  },
  dateSectionContainer: {
    flexDirection: "row",
    minHeight: 28,
    alignSelf: "stretch",
    justifyContent: "space-around",
    marginTop: 10,
  },
  dateTimeLabelContainer: {
    flex: 1,
    alignItems: "center",
  },
  timeContainer: {
    alignItems: "center",
  },
  label: {
    marginBottom: 10,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 600,
  },
  qtyInputContainer: {
    alignSelf: "center",
    padding: 10,
    alignItems: "center",
  },
  numberInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 16,
    paddingHorizontal: 5,
    marginTop: 5,
  },
  inputsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 36,
    paddingVertical: 24,
    alignItems: "center",
    flexDirection: "column",
    gap: 14,
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: 600,
    color: COLORS.primary,
  },
  error: {
    ...FONTS.body3,
    color: "#F00",
    fontWeight: "700",
    paddingTop: 10,
  },
});
