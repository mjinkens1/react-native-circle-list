# react-native-circle-list

### Description

A React Native component implemented in Javascript to create a circular list of elements, with infinite scroll. Data is mapped onto a fixed number of elements, so no matter how long your list is, it will appear to render in the given circle size.

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

| Prop                  | Default                   | Description                                                                                                                                 | Required |
| --------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| containerStyle        | undefined                 | Override default container styling.                                                                                                         | No       |
| data                  | []                        | Array of objects, similar to React Native's FlatList.                                                                                       | Yes      |
| elementCount          | 12                        | Number of elements that form the circle.                                                                                                    | No       |
| initialRotationOffset | 3 \* PI / 2               | Inital rotation of list in radians. Default value causes index 0 to be centered.                                                            | No       |
| innerRef              | undefined                 | Gets the ref for the CircleList component .                                                                                                 | No       |
| keyExtractor          | undefined                 | Function to extract list item keys from dataset, similar to React Native's FlatList                                                         | Yes      |
| onScroll              | undefined                 | Called continuously as the list is scrolled.                                                                                                | No       |
| onScrollBegin         | undefined                 | Called once when scrolling of the list begins.                                                                                              | No       |
| onScrollEnd           | undefined                 | Called once when scrolling of the list ends.                                                                                                | No       |
| radius                | 1.2 \* (SCREEN_WIDTH / 2) | Radius of the circle form by the list elements.                                                                                             | No       |
| renderItem            | undefined                 | Function to that returns a React Componet or elements to render, similar to React Native's FlatList.                                        | Yes      |
| selectedItemScale     | 1.15                      | Scaling factor for the selected item.                                                                                                       | No       |
| swipeSpeedMultiplier  | 40                        | Postive number to customize how quickly the list rotates in response to a gesture. A higher number means more movement for a given gesture. | No       |
| visiblityPadding      | 3                         | How many elements to show on either side of the selected element.                                                                           | No       |

### Methods

| Method        | Arguments             | Description                                                                                                                      |
| ------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| scrollToIndex | (index, stepDuration) | Scrolls to the specified index. Speed is constant and is specified as the time to scroll from the current index to +/- one index |

### PRs Welcome!
