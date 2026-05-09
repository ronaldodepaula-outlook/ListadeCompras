import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider } from './src/context/AppContext';
import { colors } from './src/theme';

import ListsScreen from './src/screens/ListsScreen';
import ListDetailScreen from './src/screens/ListDetailScreen';
import CompareScreen from './src/screens/CompareScreen';
import StoresScreen from './src/screens/StoresScreen';
import ProductsScreen from './src/screens/ProductsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const map = {
            Lists:    [focused ? 'list-circle'   : 'list-circle-outline',   26],
            Products: [focused ? 'cube'           : 'cube-outline',          24],
            Stores:   [focused ? 'storefront'     : 'storefront-outline',    24],
          };
          const [name, size] = map[route.name];
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Lists"    component={ListsScreen}    options={{ tabBarLabel: 'Listas'   }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ tabBarLabel: 'Produtos' }} />
      <Tab.Screen name="Stores"   component={StoresScreen}   options={{ tabBarLabel: 'Lojas'    }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" backgroundColor={colors.primaryDark} />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="Main"       component={MainTabs}        />
            <Stack.Screen name="ListDetail" component={ListDetailScreen} />
            <Stack.Screen name="Compare"    component={CompareScreen}   />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
