import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import 'react-native/Libraries/NewAppScreen';
import {theme} from '../theme';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import {MapPinIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from '../api/weather';
import {weatherImages} from '../constants';
import * as Progress from 'react-native-progress';
import {getData, storeData} from '../utils/AsyncStorage';

export default function Home() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocation] = useState([1, 2, 3]);
  const [weather, setWeather] = useState({});

  const [loading, setLoading] = useState(false);

  const handleLocation = loc => {
    console.log('location ', loc);
    setLocation([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setWeather(data);

      setLoading(false);
      storeData('city', loc.name);
      console.log('got forecast ', data);
    });
  };

  const handleSearch = value => {
    //fetch locations
    if (value.length > 2) {
      fetchLocations({cityName: value}).then(data => {
        // console.log('got location ', data);
        setLocation(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'VietNam';
    if (myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const {current, location} = weather;

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <View className="flex-1 relative">
        <StatusBar barStyle={'dark-content'} />
        <Image
          blurRadius={70}
          source={require('../asset/images/bg.png')}
          className="absolute h-full w-full"
        />
        {loading ? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.Circle thickness={10} size={140} color="#0bb3b2" />
            {/* <Text className="text-white text-4xl">Loading...</Text> */}
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/*search section*/}
            <View style={{height: '7%'}} className="mx-4 relative z-50">
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : 'transparent',
                }}>
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city"
                    placeholderTextColor={'lightgray'}
                    className="pl-6 h-10 flex-1 text-base text-white"
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={{backgroundColor: theme.bgWhite(0.3)}}
                  className="rounded-full p-3 m-1">
                  <MagnifyingGlassIcon size={25} color={'#fff'} />
                </TouchableOpacity>
              </View>
              {locations.length > 0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                  {locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder
                      ? 'border-b-2 border-b-gray-400'
                      : '';
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={
                          'flex-row items-center border-0 p-3 px-4 mb-1' +
                          borderClass
                        }>
                        <MapPinIcon size={20} color={'gray'} />
                        <Text className="to-black text-lg ml-2">
                          {loc?.name}, {loc?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {/* forecast section */}
            <View className="mx-4 flex justify-around flex-1 mb-2">
              {/* location */}
              <Text className="text-white text-center text-2xl font-bold">
                {location?.name},
                <Text className="text-lg font-semibold text-gray-300">
                  {' ' + location?.country}
                </Text>
              </Text>
              {/* weather image */}
              <View className="flex-row justify-center">
                <Image
                  source={{uri: 'https:' + current?.condition?.icon}}
                  // source={require('../asset/images/partlycloudy.png')}
                  // source={weatherImages[current?.condition?.text]}
                  className="w-52 h-52"
                />
              </View>
              <View className="space-y-2">
                {/* degree */}
                <Text className="text-center font-bold text-white text-6xl ml-5">
                  {current?.temp_c}&#176;
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {current?.condition?.text}
                </Text>
              </View>
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../asset/icons/wind.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {current?.wind_kph}km
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../asset/icons/drop.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {current?.humidity}%
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../asset/icons/sun.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size={23} color={'#fff'} />
                <Text className="text-white text-base">Daily forcast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}>
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item.date);
                  let options = {weekday: 'long'};
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{backgroundColor: theme.bgWhite(0.15)}}>
                      <Image
                        source={{uri: 'https:' + item?.day?.condition?.icon}}
                        // source={weatherImages[item?.day?.condition?.text]}
                        // source={require('../asset/images/heavyrain.png')}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
