
import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  const loadEvents = async () => {
    if (!currUser || !currUser.id) {
      console.warn("⚠️ Usuario no autenticado, no se pueden cargar eventos.");
      return;
    }

    setLoading(true);
    try {
      const filters = route.params?.filters ? JSON.parse(route.params.filters) : undefined;

      const data = await fetchNearEvents(currUser.id, filters);

      if (!data || !data.items) {
        console.error("❌ Error: Respuesta de fetchNearEvents no válida:", data);
        setEventsList([]);
        setFilteredEventList([]);
      } else {
        setEventsList(data.items);
        setFilteredEventList(data.items);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  useFocusEffect(
      useCallback(() => {
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
    try {
      const jsonData = await fetchNearEvents(currUser.id);
      setEventsList(jsonData.items);
      setFilteredEventList(jsonData.items);
    } catch (error) {
      console.error(error);
    }
    setRefreshing(false);
  };

  return (
      <SafeAreaView style={{ flex: 1, minHeight: "100%"}}>
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

