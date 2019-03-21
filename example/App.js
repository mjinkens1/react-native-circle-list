import React, { PureComponent } from 'react'
import { Button, Dimensions, StyleSheet, Text, TextInput, View } from 'react-native'
import { CircleList } from './src/components/CircleList'
import { CircleListItem } from './src/components/CircleListItem'
import { mockData } from './src/mockData'

const { width } = Dimensions.get('screen')
const RADIUS = (1.5 * width) / 2

export default class App extends PureComponent {
    state = {
        text: '0',
    }

    _keyExtractor = item => item.id

    _onChange = text => {
        const filteredText = text.replace(/[^0-9]/, '')

        if (parseInt(filteredText, 10) > mockData.length - 1) {
            return
        }

        this.setState({ text: filteredText })
    }

    _onPress = () => {
        const { text } = this.state
        const scrollIndex = parseInt(text, 10)

        this.circleList.scrollToIndex(scrollIndex)
    }

    _renderItem = ({ item }) => <CircleListItem label={`Label ${item.value}`} value={item.value} />

    render() {
        const { text } = this.state

        return (
            <View style={styles.container}>
                <CircleList
                    data={mockData}
                    elementCount={16}
                    keyExtractor={this._keyExtractor}
                    radius={RADIUS}
                    innerRef={component => {
                        this.circleList = component
                    }}
                    renderItem={this._renderItem}
                />
                <Text>Choose Scroll Index</Text>
                <TextInput
                    keyboardType="number-pad"
                    onChangeText={text => this._onChange(text)}
                    style={styles.textInput}
                    value={text}
                />
                <Button onPress={this._onPress} title={`Scroll To Index ${text}`} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    text: {
        textAlign: 'center',
    },
    textInput: {
        width: 50,
        margin: 12,
        padding: 12,
        textAlign: 'center',
        borderWidth: 1,
    },
    view: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    view1: {
        backgroundColor: 'yellow',
    },
    view2: {
        backgroundColor: 'orange',
    },
})
