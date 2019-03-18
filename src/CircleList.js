import React, { PureComponent } from 'react'
import { Dimensions, PanResponder, Platform } from 'react-native'
import PropTypes from 'prop-types'
import { CircleListLayout } from './CircleListLayout'

const { OS } = Platform
const { width } = Dimensions.get('screen')
const { abs, acos, PI } = Math

export class CircleList extends PureComponent {
    static defaultProps = {
        data: [],
        elementCount: 12,
        initialRotationOffset: (3 * PI) / 2,
        radius: (1.2 * width) / 2,
        selectedItemScale: 1.15,
        swipeSpeedMultiplier: OS === 'ios' ? 40 : 40,
        visibilityPadding: 3,
    }

    static propTypes = {
        data: PropTypes.array.isRequired,
        containerStyle: PropTypes.object,
        elementCount: PropTypes.number,
        initialRotationOffset: PropTypes.number,
        keyExtractor: PropTypes.func.isRequired,
        radius: PropTypes.number,
        renderItem: PropTypes.func.isRequired,
        selectedItemScale: PropTypes.number,
        swipeSpeedMultiplier: PropTypes.number,
        visibilityPadding: PropTypes.number,
    }

    constructor(props) {
        super(props)

        const { data, elementCount, visibilityPadding } = props

        this.state = {
            breakpoints: this._getBreakpoints(elementCount, (2 * PI) / elementCount),
            dataIndexLeft: data.length - visibilityPadding - 1,
            dataIndexRight: visibilityPadding + 1,
            displayData: this._getOffsetData(),
            insertionIndexLeft: elementCount - visibilityPadding - 1,
            insertionIndexRight: visibilityPadding + 1,
            rotationIndex: 0,
            rotationOffset: 0,
            selectedIndex: 0,
            theta: (2 * PI) / elementCount,
        }

        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: (event, gestureState) => this._onScrollBegin(event, gestureState),
            onPanResponderMove: (event, gestureState) => {
                const { dx, moveX } = gestureState

                // Don't do anything if not a swipe gesture
                if (dx === 0) {
                    return
                }

                // Throttle number of calls to reduce unnecessary renders, can be optimized more by playing with swipeSpeedMultiplier and throttle timeout
                if (this.executing) {
                    return
                }

                this.executing = true
                setTimeout(() => (this.executing = false), 20)

                const { radius, swipeSpeedMultiplier } = this.props
                const { breakpoints, rotationIndex, rotationOffset, theta } = this.state
                const direction = dx < 0 ? 'LEFT' : 'RIGHT'
                const xNew = radius - moveX
                const directionFactor = dx > 0 ? -1 : 1
                const thetaOffset =
                    (swipeSpeedMultiplier / 1000) * directionFactor * acos(xNew / radius)

                // Reset rotation offset after one full revolution in either direction
                const resetOffset =
                    rotationOffset > 2 * PI
                        ? rotationOffset - 2 * PI
                        : rotationOffset < -2 * PI
                        ? rotationOffset + 2 * PI
                        : rotationOffset

                // Get updated rotation index
                const newRotationIndex = this._getClosestIndex(
                    resetOffset - thetaOffset,
                    breakpoints,
                    theta,
                    direction
                )

                // Only get new data index if rotation index has changed
                if (newRotationIndex !== rotationIndex) {
                    const [insertionIndexLeft, insertionIndexRight] = this._getInsertionIndex(
                        direction,
                        'ELEMENTS'
                    )
                    const [dataIndexLeft, dataIndexRight] = this._getInsertionIndex(
                        direction,
                        'DATA'
                    )
                    const displayData = this._getDisplayData(
                        dataIndexLeft,
                        dataIndexRight,
                        insertionIndexLeft,
                        insertionIndexRight
                    )

                    this.setState({
                        dataIndexLeft,
                        dataIndexRight,
                        displayData,
                        insertionIndexLeft,
                        insertionIndexRight,
                        rotationIndex: newRotationIndex,
                        rotationOffset: resetOffset - thetaOffset,
                        selectedIndex: newRotationIndex,
                    })

                    return this._onScroll(event, gestureState)
                }

                this.setState({
                    rotationIndex: newRotationIndex,
                    rotationOffset: resetOffset - thetaOffset,
                    selectedIndex: newRotationIndex,
                })

                this._onScroll(event, gestureState)
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (event, gestureState) => {
                const { dx } = gestureState

                // Don't do anything if not a swipe gesture
                if (dx === 0) {
                    return
                }

                const { visibilityPadding } = this.props
                const { breakpoints, rotationIndex, rotationOffset, theta } = this.state
                const direction = dx < 0 ? 'LEFT' : 'RIGHT'
                const selectedIndex = this._getClosestIndex(
                    rotationOffset,
                    breakpoints,
                    theta,
                    direction
                )

                // Calculate offset to snap to nearest index
                const snapOffset =
                    rotationOffset < 0 && selectedIndex > visibilityPadding // Buffer for rotation reset
                        ? breakpoints[selectedIndex]
                        : 2 * PI - breakpoints[selectedIndex]

                // Only get new data index if rotation index has changed
                if (selectedIndex !== rotationIndex) {
                    this.setState({
                        rotationIndex: selectedIndex,
                        rotationOffset: snapOffset,
                        selectedIndex,
                    })

                    return this._onScrollEnd(event, gestureState)
                }

                this.setState({
                    rotationIndex: selectedIndex,
                    rotationOffset: snapOffset,
                    selectedIndex,
                })

                this._onScrollEnd(event, gestureState)
            },
            onPanResponderTerminate: () => null,
            onShouldBlockNativeResponder: () => true,
        })
    }

    _calcHeight = () => {
        const { elementCount, radius } = this.props

        return ((12 / elementCount) * 1.8 * radius) / 2
    }

    _getBreakpoints = (elementCount, separationAngle) => {
        const _calc = (breakpoints, count) => {
            const newBreakpoints = breakpoints.concat(count * separationAngle)

            if (count < elementCount - 1) {
                return _calc(newBreakpoints, count + 1)
            } else {
                return newBreakpoints
            }
        }

        return _calc([], 0)
    }

    _getClosestIndex = (offset, breakpoints, separationAngle, direction) => {
        const offsets = breakpoints.map((_, index) => {
            if (offset >= 0) {
                if (index === 0 && direction === 'LEFT') {
                    return 2 * PI - abs(breakpoints.length * separationAngle - offset)
                } else {
                    return abs((breakpoints.length - index) * separationAngle - offset)
                }
            } else {
                return abs(offset + index * separationAngle)
            }
        })

        return offsets.indexOf(Math.min(...offsets))
    }

    _getDisplayData = (dataIndexLeft, dataIndexRight, insertionIndexLeft, insertionIndexRight) => {
        const { data } = this.props
        const { displayData } = this.state

        return Object.assign([...displayData], {
            [insertionIndexLeft]: data[dataIndexLeft],
            [insertionIndexRight]: data[dataIndexRight],
        })
    }

    _getInsertionIndex = (direction, type) => {
        const { data, elementCount } = this.props
        const {
            dataIndexLeft,
            dataIndexRight,
            insertionIndexLeft,
            insertionIndexRight,
        } = this.state
        // Set wrapping bounds based on type argument
        const indexLeft = type === 'DATA' ? dataIndexLeft : insertionIndexLeft
        const indexRight = type === 'DATA' ? dataIndexRight : insertionIndexRight
        const length = type === 'DATA' ? data.length : elementCount

        // Increment index for left swipe, wrap if index greater than length
        if (direction === 'LEFT') {
            const incrementedIndexLeft = indexLeft + 1
            const incrementedIndexRight = indexRight + 1

            return [
                incrementedIndexLeft >= length
                    ? incrementedIndexLeft - length
                    : incrementedIndexLeft,

                incrementedIndexRight >= length
                    ? incrementedIndexRight - length
                    : incrementedIndexRight,
            ]
            // Decrement index for right swipe, wrap if less than zero
        } else if (direction === 'RIGHT') {
            const incrementedIndexLeft = indexLeft - 1
            const incrementedIndexRight = indexRight - 1

            return [
                incrementedIndexLeft < 0 ? length + incrementedIndexLeft : incrementedIndexLeft,

                incrementedIndexRight < 0 ? length + incrementedIndexRight : incrementedIndexRight,
            ]
        }
    }

    _getOffsetData = () => {
        const { data, elementCount } = this.props
        const { length } = data

        return [...data.slice(0, elementCount / 2), ...data.slice(length - elementCount / 2)]
    }

    _keyExtractor = (item, index) => {
        const { keyExtractor } = this.props

        return keyExtractor(item, index)
    }

    _onScroll = () => {
        const { onScroll } = this.props

        onScroll && onScroll()
    }

    _onScrollBegin = () => {
        const { onScrollBegin } = this.props

        onScrollBegin && onScrollBegin()
    }

    _onScrollEnd = () => {
        const { onScrollEnd } = this.props

        onScrollEnd && onScrollEnd()
    }

    _renderItem = ({ item, index }) => {
        const { renderItem } = this.props

        return renderItem({ item, index })
    }

    render() {
        const { containerStyle, initialRotationOffset, radius, selectedItemScale } = this.props
        const { displayData, rotationOffset, selectedIndex, theta } = this.state

        return (
            <CircleListLayout
                calcHeight={this._calcHeight}
                containerStyle={containerStyle}
                displayData={displayData}
                initialRotationOffset={initialRotationOffset}
                keyExtractor={this._keyExtractor}
                panHandlers={this._panResponder.panHandlers}
                radius={radius}
                renderItem={this._renderItem}
                rotationOffset={rotationOffset}
                selectedIndex={selectedIndex}
                selectedItemScale={selectedItemScale}
                theta={theta}
            />
        )
    }
}
