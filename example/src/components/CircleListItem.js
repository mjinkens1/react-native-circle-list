import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export const CircleListItem = ({ label, value }) => (
    <View style={styles.container}>
        <View style={styles.icon}>
            <Text style={styles.text}>{value}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
    </View>
)

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 70,
        borderRadius: 70 / 2,
        backgroundColor: 'blue',
    },
    label: {
        textAlign: 'center',
    },
    text: {
        margin: 12,
        color: 'white',
    },
})
