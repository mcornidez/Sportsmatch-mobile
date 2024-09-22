import React, { useContext, useEffect } from "react";
import { SafeAreaView, FlatList, View, StyleSheet, ActivityIndicator } from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import Card from "../components/Card";
import {
  fetchJoinedEvents,
  fetchMyEvents,
} from "../services/eventService";
import { COLORS } from "../constants";
import { useIsFocused } from "@react-navigation/native";
import MyEventList from "../components/MyEventList";
import { NoContentMessage } from "../components/NoContentMessage";
import { UserContext } from "../contexts/UserContext";
import { StatusBar } from "expo-status-bar";

const renderList = (data) => {
  return <MyEventList data={data} />;
};

const renderJoinedItem = ({ item }) => {
  return <Card props={item} />;
};

const FirstRoute = (myEvents, loading) => (
  <SafeAreaView style={{ flex: 1 }}>
    {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ alignSelf: "center", marginTop: "50%" }} /> :
      <FlatList
        data={myEvents.slice().reverse()}
        renderItem={(data) => renderList(data)}
        style={{ flex: 1, marginBottom: 8 }}
        contentContainerStyle={myEvents.length != 0 ? { flexGrow: 1 } : styles.noContentContainer}
        keyExtractor={(item, index) => {
          return `${index}`;
        }}
        ListEmptyComponent={<NoContentMessage message={"Aún no creaste ningún evento"} />}
      />}
  </SafeAreaView>
);

const SecondRoute = (joinedEvents, loading) => (
  <SafeAreaView style={{ flex: 1 }}>
    {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ alignSelf: "center", marginTop: "50%" }} /> :
      <FlatList
        data={joinedEvents.slice().reverse()}
        renderItem={renderJoinedItem}
        style={{ flex: 1 }}
        contentContainerStyle={
          joinedEvents.length != 0 ? styles.contentContainer : styles.noContentContainer}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListEmptyComponent={renderEmptyList}
      ></FlatList>
    }
  </SafeAreaView>
);

const renderEmptyList = () => {
  return (
    <NoContentMessage message={"Aún no te anotaste a ningún evento"} />
  );
};

const MyEvents = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Creados" },
    { key: "second", title: "Anotado" },
  ]);
  const { currUser } = useContext(UserContext);
  const [loadingMyEvents, setLoadingMyEvents] = React.useState(true);
  const [loadingJoinedEvents, setLoadingJoinedEvents] = React.useState(true);
  const [myEvents, setMyEvents] = React.useState([]);
  const [joinedEvents, setJoinedEvents] = React.useState([]);
  const isFocused = useIsFocused();

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "first":
        return FirstRoute(myEvents, loadingMyEvents);
      case "second":
        return SecondRoute(joinedEvents, loadingJoinedEvents);
      default:
        return null;
    }
  };

  useEffect(() => {
    const getMyEvents = async () => {
      const data = await fetchMyEvents(currUser.id);
      setMyEvents(data.items);
    };

    if (isFocused) {
      getMyEvents().then(() => setLoadingMyEvents(false)).catch((err) => console.log(err));
    }
  }, [isFocused]);

  useEffect(() => {
    const getJoinedEvents = async () => {
      const mockData = await fetchJoinedEvents(currUser.id);
      setJoinedEvents(mockData.items);
    };
    if (isFocused) {
      getJoinedEvents().then(() => setLoadingJoinedEvents(false)).catch((err) => console.log(err));
    }
  }, [isFocused]);

  return (
      <TabView
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: COLORS.primary }}
            indicatorStyle={{ backgroundColor: COLORS.secondary }}
          />
        )}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />
  );
};

export default MyEvents;

const styles = StyleSheet.create({
  noContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
    paddingTop: 8,
  }
});
