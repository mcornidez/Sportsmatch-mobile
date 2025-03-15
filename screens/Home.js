
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

  const loadEvents = async () => {
    if (!currUser || !currUser.id) {
      console.warn("⚠️ Usuario no autenticado, no se pueden cargar eventos.");
      return;
    }

    console.log("📡 Cargando eventos para el usuario:", currUser.id);

    setLoading(true);
    try {
      console.log("📊 Filtros recibidos:", route.params?.filters);
      const filters = route.params?.filters ? JSON.parse(route.params.filters) : undefined;

      console.log("📡 Ejecutando fetchNearEvents con filtros:", filters);
      const data = await fetchNearEvents(currUser.id, filters);

      if (!data || !data.items) {
        console.error("❌ Respuesta inválida de fetchNearEvents:", data);
        setEventsList([]);
        setFilteredEventList([]);
      } else {
        console.log("✅ Eventos cargados correctamente:", data.items.length, "eventos");
        setEventsList(data.items);
        setFilteredEventList(data.items);
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
      }, [currUser, route.params?.filters])
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
    return (
        <Pill
            props={item}
            handlePress={handleFilter}
            currentFilter={selectedFilter}
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
      setEventsList(jsonData.items);
      setFilteredEventList(jsonData.items);
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
            keyExtractor={(item) => {
              return item.id.toString();
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1, paddingTop: 20, paddingBottom: 10, maxHeight: 70 }}
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

