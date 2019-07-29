# react-native-circle-list

### Description

A React Native component implemented in Javascript to create a circular list of elements with infinite scroll. Data is mapped onto a fixed number of elements so no matter how long your list is, it will appear to render in the given circle size.

![](react-native-circle-list.gif)

### Installation

```sh
$ yarn add react-native-circle-list
$ npm install react-native-circle-list
```

### Example Usage

```
...
import CircleList from 'react-native-circle-list'
...

export class ExampleUsage extends PureComponent {

    _keyExtractor = item => item.id

    _renderItem = ({ item }) => <CircleListItem label={`Label ${item.value}`} value={item.value} />

    render() {
        const { data } = this.props

        return (
            <CircleList
                data={data}
                keyExtractor={this._keyExtractor}
                renderItem={this._renderItem}
            />
        )
    }
}
```

### Props

| Prop                 | Default                   | Description                                                                                                                                                                                                                                                                                                                       | Required |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| containerStyle       | undefined                 | Override default container styling.                                                                                                                                                                                                                                                                                               | No       |
| data                 | []                        | Array of objects, similar to React Native's FlatList.                                                                                                                                                                                                                                                                             | Yes      |
| elementCount         | 12                        | Number of elements that form the circle. Any value lower than 12 will have no effect as this is the smallest amount to form a circular list. Max element count is 40, any number greater than this will have no effect. Most arc shapes can still be achieved with the proper combination of element count, radius, and flatness. | No       |
| flatness             | 0                         | Value between 0-1 specifying the flatness of the visible part of the circle. With a flatness of 1 (fully flat) only uniformly sized elements are supported currently.                                                                                                                                                             | No       |
| innerRef             | undefined                 | Gets the ref for the CircleList component .                                                                                                                                                                                                                                                                                       | No       |
| keyExtractor         | undefined                 | Function to extract list item keys from dataset, similar to React Native's FlatList                                                                                                                                                                                                                                               | Yes      |
| onScroll             | undefined                 | Called continuously as the list is scrolled.                                                                                                                                                                                                                                                                                      | No       |
| onScrollBegin        | undefined                 | Called once when scrolling of the list begins.                                                                                                                                                                                                                                                                                    | No       |
| onScrollEnd          | undefined                 | Called once when scrolling of the list ends.                                                                                                                                                                                                                                                                                      | No       |
| radius               | 1.2 \* (SCREEN_WIDTH / 2) | Radius of the circle form by the list elements.                                                                                                                                                                                                                                                                                   | No       |
| renderItem           | undefined                 | Function to that returns a React Component or elements to render, similar to React Native's FlatList.                                                                                                                                                                                                                             | Yes      |
| selectedItemScale    | 1.15                      | Scaling factor for the selected item.                                                                                                                                                                                                                                                                                             | No       |
| swipeSpeedMultiplier | 40                        | Postive number to customize how quickly the list rotates in response to a gesture. A higher number means more movement for a given gesture.                                                                                                                                                                                       | No       |
| visiblityPadding     | 3                         | How many elements to show on either side of the selected element.                                                                                                                                                                                                                                                                 | No       |

### Methods

| Method        | Arguments         | Description                                                                      |
| ------------- | ----------------- | -------------------------------------------------------------------------------- |
| scrollToIndex | (index, duration) | Scrolls to the specified index in the given duration. Default duration is 250ms. |

### PRs Welcome!
