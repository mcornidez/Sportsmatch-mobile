import React, { useContext, useEffect, useState } from "react";
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
import { SPORT } from "../constants/data";
import { StyleSheet } from "react-native";
import { NoContentMessage } from "../components/NoContentMessage";
import { UserContext } from "../contexts/UserContext";

const filterData = [
  { key: 1, sportId: 1, sport: SPORT[0] },
  { key: 2, sportId: 2, sport: SPORT[1] },
  { key: 3, sportId: 3, sport: SPORT[2] },
  { key: 4, sportId: 4, sport: SPORT[3] },
  { key: 5, sportId: 5, sport: SPORT[4] },
  { key: 6, sportId: 6, sport: SPORT[5]}
];

const Home = ({ navigation, route }) => {
  const [eventsList, setEventsList] = useState(null);
  const [filteredEventsList, setFilteredEventList] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const {currUser} = useContext(UserContext);

  useEffect(() => {
    setLoading(true);
    const getNearEvents = async () => {
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
    item.title = item.sport;
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

    if (selectedFilter == sport) {
      setSelectedFilter("");
      setFilteredEventList(eventsList);

    } else {
      setSelectedFilter(sport);
      //TODO: FIX this should be done in the backend
      const filteredList  = eventsList?.filter((e) => SPORT[e.sportId - 1] == sport);
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
        data={filterData}
        renderItem={renderItemPill}
        keyExtractor={(item) => {
          return item.key.toString();
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
          contentContainerStyle={filteredEventsList?.length == 0 ?  [styles.noContentContainer, {paddingHorizontal: 24}] : styles.contentContainer}
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
