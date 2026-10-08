import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../../src/theme';

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.forge,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: colors.paper,
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Projects' }} />
      <Stack.Screen name="[id]" options={{ title: 'Project Details' }} />
    </Stack>
  );
}
