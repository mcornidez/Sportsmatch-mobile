
import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
    Text,
  SafeAreaView,
  RefreshControl,
  View,
} from "react-native";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { fetchNearEvents } from "../services/eventService";
import { COLORS } from "../constants";
import { StyleSheet } from "react-native";
import { NoContentMessage } from "../components/NoContentMessage";
import { UserContext } from "../contexts/UserContext";
import {getSports} from "../services/sportService";
import { useFocusEffect } from "@react-navigation/native";

const Home = ({ navigation, route }) => {
  const [eventsList, setEventsList] = useState([]);
  const [filteredEventsList, setFilteredEventList] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState([]);
  const {currUser} = useContext(UserContext);
  const [loadingSports, setLoadingSports] = useState(true);
  const onlyClubs = route.params?.onlyClubs ?? false;

  useEffect(() => {
    console.log("🔄 useEffect activado. Cargando eventos...");
    loadEvents();
  }, [route.params?.filters, route.params?.onlyClubs]);


  const loadEvents = async () => {
    if (!currUser || !currUser.id) {
      console.warn("⚠️ Usuario no autenticado, no se pueden cargar eventos.");
      return;
    }

    console.log("📡 Cargando eventos para el usuario:", currUser.id);

    setLoading(true);
    try {
      console.log("📊 Filtros recibidos:", route.params?.filters);

      const filters = route.params?.filters ? route.params.filters : "";
      console.log("✅ Filtros parseados correctamente:", filters);


      console.log("📡 Ejecutando fetchNearEvents con filtros:", filters);
      const data = await fetchNearEvents(currUser.id, filters);

      if (!data || !data.items) {
        console.error("❌ Respuesta inválida de fetchNearEvents:", data);
        setEventsList([]);
        setFilteredEventList([]);
      } else {

        let eventos = data.items;
        if (onlyClubs) {
          eventos = eventos.filter(e => e.organizerType  === "club");
        }

        eventos.sort((a, b) => {
          const userSports = currUser.sports || [];
          const userLocations = currUser.locations || [];

          // Calculamos prioridad de cada evento
          const aPriority =
              (userSports.includes(a.sportId) ? 1 : 0) +
              (userLocations.some((loc) => a.location.includes(loc)) ? 1 : 0);
          const bPriority =
              (userSports.includes(b.sportId) ? 1 : 0) +
              (userLocations.some((loc) => b.location.includes(loc)) ? 1 : 0);

          // Orden descendente (los que tienen más prioridad arriba)
          return bPriority - aPriority;
        });

        setEventsList(eventos);
        setFilteredEventList(eventos);
      }
    } catch (error) {
      console.error("❌ Error en loadEvents:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log("🔄 useEffect activado. Cargando eventos...");
    loadEvents();
  }, [route.params?.filters]);

  useFocusEffect(
      useCallback(() => {
        console.log("🔄 useFocusEffect: Re-cargando eventos...");
        loadEvents();
      }, [currUser, route.params?.filters, route.params?.onlyClubs])
  );


  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sportsData = await getSports();
        setSports(sportsData);
      } catch (error) {
        console.error("Error loading sports:", error);
      } finally {
        setLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

  useEffect(() => {
    setLoading(true);
    const getNearEvents = async () => {
      console.log(currUser)
      const mockData = await fetchNearEvents(currUser.id, JSON.parse(route.params?.filters));
      setEventsList(mockData.items);
      setFilteredEventList(mockData.items);
      setLoading(false);
    };
    getNearEvents().catch((err) => console.log(err));
  }, [route.params?.filters]);

  useEffect(() => {
    setLoading(true);
    const getNearEvents = async () => {
      const data = await fetchNearEvents(currUser.id);
      setEventsList(data.items);
      setFilteredEventList(data.items);
      setLoading(false);
    };
    if (currUser) {
      getNearEvents().catch((err) => console.log(err));
    }
  }, [currUser]);

  const renderItem = ({ item }) => {
    return <Card props={item} />;
  };

  const renderItemPill = ({ item }) => {
    item.title = item.name;
    const isSelected = selectedFilter === item;

    return (
        <Pill
            customStyle={{
              paddingHorizontal: 18,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.primary,
              backgroundColor: isSelected ? COLORS.primary : COLORS.white,
              marginHorizontal: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            props={{
              title: item.name,
              textStyle: isSelected
                  ? { color: COLORS.white, fontWeight: "600" }
                  : { color: COLORS.primary, fontWeight: "400" }
            }}
            handlePress={() => handleFilter(item)}
            currentFilter={isSelected}
        />
    );
  };

  const renderEmptyList = () => {
    return (
        <>
          <NoContentMessage message="No hay eventos disponibles en este momento."/>
          <View style={{height: 40}}/>
        </>
    );
  };

  const handleFilter = (sport) => {
    setLoading(true);

    if (selectedFilter === sport) {
      setSelectedFilter("");
      setFilteredEventList(eventsList);

    } else {
      setSelectedFilter(sport);
      const filteredList = eventsList?.filter((e) => e.sportId === sport.id);
      setFilteredEventList(filteredList);
    }
    setLoading(false);
  };

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    console.log("🔄 Refrescando eventos...");
    try {
      const jsonData = await fetchNearEvents(currUser.id);
      console.log("✅ Eventos refrescados:", jsonData.items.length);
      let eventos = jsonData.items || [];
      if (onlyClubs) {
        eventos = eventos.filter(e => e.organizerType === "club");
      }

      setEventsList(eventos);
      setFilteredEventList(eventos);
    } catch (error) {
      console.error("❌ Error al refrescar eventos:", error);
    }
    setRefreshing(false);
  };

  return (
      <SafeAreaView style={{ flex: 1, minHeight: "100%"}}>
        {loadingSports ? (
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        ) : (
            <>
              <FlatList
                  data={sports}
                  renderItem={renderItemPill}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flex: 1, paddingTop: 20, paddingBottom: 10, maxHeight: 70 }}
                  contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 10
                  }}
              />
              {loading ? (
            <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ alignSelf: "center", marginTop: '70%' }}
            />
        ) : (
            <FlatList
                data={filteredEventsList}
                renderItem={renderItem}
                refreshControl={
                  <RefreshControl tintColor={COLORS.primary} refreshing={refreshing} onRefresh={onRefresh} />
                }
                style={{flex: 1}}
                contentContainerStyle={filteredEventsList?.length === 0 ?  [styles.noContentContainer, {paddingHorizontal: 24}] : styles.contentContainer}
                keyExtractor={(item) => {
                  return item.id.toString();
                }}
                ListEmptyComponent={renderEmptyList}
            ></FlatList>
        )}
            </>
            )}
      </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  noContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",

  },
  contentContainer : {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 8,
    alignItems: 'center',
    paddingBottom: '5%'
  }
});

