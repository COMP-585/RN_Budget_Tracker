import { StyleSheet } from 'react-native'
import { Stack } from "expo-router";
import React from 'react'

export default function PetScreenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ title: "Pet" }}
      />
    </Stack>
  )
}

const styles = StyleSheet.create({})