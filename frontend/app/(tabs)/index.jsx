import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import React from 'react'

export default function index() {
  const {logout} = useAuthStore();
  return (
    <View>
      <Text>Home tab</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}