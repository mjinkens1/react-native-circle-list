import React, { PureComponent } from 'react'
import { Animated, Dimensions, PanResponder, Text } from 'react-native'
import PropTypes from 'prop-types'
import { CircleListLayout } from './CircleListLayout'

const { width } = Dimensions.get('screen')
const { abs, acos, cos, PI, sin } = Math

export class CircleList extends PureComponent {
    static defaultProps = {
        data: [],
        elementCount: 12,
        flatness: 0,
        initialRotationOffset: (3 * PI) / 2,
        radius: (1.2 * width) / 2,
        selectedItemScale: 1.15,
        swipeSpeedMultiplier: 30,
        visibilityPadding: 3,
    }

    static propTypes = {
        data: PropTypes.array.isRequired,
        containerStyle: PropTypes.object,
        elementCount: PropTypes.number,
        flatness: PropTypes.number,
        initialRotationOffset: PropTypes.number,
        innerRef: PropTypes.func,
        keyExtractor: PropTypes.func.isRequired,
        onScroll: PropTypes.func,
        onScrollBegin: PropTypes.func,
        onScrollEnd: PropTypes.func,
        radius: PropTypes.number,
        renderItem: PropTypes.func.isRequired,
        selectedItemScale: PropTypes.number,
        swipeSpeedMultiplier: PropTypes.number,
        visibilityPadding: PropTypes.number,
    }

    constructor(props) {
        super(props)

        const { data, elementCount, visibilityPadding } = props
        const dataWithIndexes = this._assignIndexes(data)

        this.dataIndex = 0
        this.rotationOffset = 0
        this.selectedIndex = 0

        this.state = {
            breakpoints: this._getBreakpoints(elementCount, (2 * PI) / elementCount),
            data: dataWithIndexes,
            dataIndexLeft: data.length - visibilityPadding - 1,
            dataIndexRight: visibilityPadding + 1,
            displayData: this._getOffsetData(dataWithIndexes),
            insertionIndexLeft: elementCount - visibilityPadding - 1,
            insertionIndexRight: visibilityPadding + 1,
            rotationIndex: 0,
            scrolling: false,
            theta: (2 * PI) / elementCount,
            visibleDataBounds: this._getVisibleElements(),
        }

        this._innerRef = this._innerRef.bind(this)

        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: () => null,
            onPanResponderMove: (_, gestureState) => {
                const { dx, moveX } = gestureState

                // Don't do anything if not a swipe gesture
                if (dx === 0) {
                    return
                }

                const { radius, selectedItemScale, swipeSpeedMultiplier } = this.props
                const { breakpoints, displayData, rotationIndex, scrolling, theta } = this.state

                if (!scrolling) {
                    this._onScrollBegin(this.dataIndex)
                    this.setState({ scrolling: true })
                }

                const { rotationOffset } = this
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
                    const newDataIndex = this._getDataIndex(direction)
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
                    const visibleDataBounds = this._getVisibleElements()

                    this.setState({
                        dataIndexLeft,
                        dataIndexRight,
                        displayData,
                        insertionIndexLeft,
                        insertionIndexRight,
                        rotationIndex: newRotationIndex,
                        visibleDataBounds,
                    })

                    this.dataIndex = newDataIndex
                    this.rotationOffset = resetOffset - thetaOffset
                    this.selectedIndex = newRotationIndex

                    this._onScroll(this.dataIndex)

                    return displayData.forEach((_, index) => {
                        const { translateX, translateY } = this._getTransforms(index)

                        this.state[`scale${index}`].setValue(
                            index === this.selectedIndex ? selectedItemScale : 1
                        )
                        this.state[`translateX${index}`].setValue(translateX)
                        this.state[`translateY${index}`].setValue(translateY)
                    })
                }

                this.rotationOffset = resetOffset - thetaOffset

                displayData.forEach((_, index) => {
                    const { translateX, translateY } = this._getTransforms(index)

                    this.state[`scale${index}`].setValue(
                        index === this.selectedIndex ? selectedItemScale : 1
                    )
                    this.state[`translateX${index}`].setValue(translateX)
                    this.state[`translateY${index}`].setValue(translateY)
                })

                this._onScroll(this.dataIndex)
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (event, gestureState) => {
                const { dx, vx } = gestureState

                // Don't do anything if not a swipe gesture
                if (dx === 0) {
                    return
                }

                const { selectedItemScale } = this.props
                const { breakpoints, displayData, rotationIndex, theta } = this.state
                const direction = dx < 0 ? 'LEFT' : 'RIGHT'
                const selectedIndex = this._getClosestIndex(
                    this.rotationOffset,
                    breakpoints,
                    theta,
                    direction
                )

                // Only get snap animations if rotation index has changed
                if (selectedIndex !== this.rotationIndex) {
                    // Calculate offset to snap to nearest index
                    const snapOffset = 2 * PI - breakpoints[selectedIndex]

                    this.rotationOffset = snapOffset

                    this.setState({ rotationIndex: selectedIndex })

                    const animations = displayData.map((_, index) => {
                        const { translateX, translateY } = this._getTransforms(index)

                        this.state[`scale${index}`].setValue(
                            index === this.selectedIndex ? selectedItemScale : 1
                        )

                        const xSpring = Animated.spring(this.state[`translateX${index}`], {
                            toValue: translateX,
                            velocity: abs(vx),
                        })
                        const ySpring = Animated.spring(this.state[`translateY${index}`], {
                            toValue: translateY,
                            velocity: abs(vx),
                        })

                        return Animated.parallel([xSpring, ySpring])
                    })

                    Animated.parallel(animations).start(() => this.setState({ scrolling: false }))

                    return this._onScrollEnd(this.dataIndex)
                }

                this.setState({ scrolling: false })
                this._onScrollEnd(this.dataIndex)
            },
            onPanResponderTerminate: () => null,
            onShouldBlockNativeResponder: () => true,
        })
    }

    _assignIndexes = data => {
        if (!data) {
            return
        }

        return data.map((item, index) => ({
            ...item,
            _dataIndex: index,
        }))
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

    _getDataIndex = direction => {
        const { data } = this.state
        const { length } = data

        if (direction === 'LEFT') {
            const incrementedIndex = this.dataIndex + 1

            return incrementedIndex >= length ? incrementedIndex - length : incrementedIndex
        } else if (direction === 'RIGHT') {
            const decrementedIndex = this.dataIndex - 1

            return decrementedIndex < 0 ? decrementedIndex + length : decrementedIndex
        }
    }

    _getDisplayData = (dataIndexLeft, dataIndexRight, insertionIndexLeft, insertionIndexRight) => {
        const { data, displayData } = this.state

        return Object.assign([...displayData], {
            [insertionIndexLeft]: data[dataIndexLeft],
            [insertionIndexRight]: data[dataIndexRight],
        })
    }

    _getInsertionIndex = (direction, type) => {
        const { elementCount } = this.props
        const { data } = this.state
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
            const decrementedIndexLeft = indexLeft - 1
            const decrementedIndexRight = indexRight - 1

            return [
                decrementedIndexLeft < 0 ? length + decrementedIndexLeft : decrementedIndexLeft,

                decrementedIndexRight < 0 ? length + decrementedIndexRight : decrementedIndexRight,
            ]
        }
    }

    _getOffsetData = data => {
        const { elementCount } = this.props
        const { length } = data

        return [...data.slice(0, elementCount / 2), ...data.slice(length - elementCount / 2)]
    }

    _getScrollToIndex = index => {
        const { data } = this.state
        const { length } = data

        if (index > this.dataIndex) {
            if (index - this.dataIndex < length - index + this.dataIndex) {
                return {
                    direction: 'LEFT',
                    stepCount: index - this.dataIndex,
                }
            }
            return {
                direction: 'RIGHT',
                stepCount: length - index + this.dataIndex,
            }
        } else {
            if (this.dataIndex - index < length - this.dataIndex + index) {
                return {
                    direction: 'RIGHT',
                    stepCount: this.dataIndex - index,
                }
            }
            return {
                direction: 'LEFT',
                stepCount: data.length - this.dataIndex + index,
            }
        }
    }

    _getTransforms = index => {
        const { flatness, initialRotationOffset, radius } = this.props
        const { theta } = this.state

        const thetaOffset = 2 * PI * index + (this.rotationOffset + initialRotationOffset)
        const translateX = radius * cos(index * theta + thetaOffset)
        const translateY =
            (1 - flatness) * radius * sin(index * theta + thetaOffset) + (1 - flatness) * radius

        return { translateX, translateY }
    }

    _getVisibleElements = () => {
        const { data, visibilityPadding } = this.props
        const { length } = data

        const leftBound = this.dataIndex - visibilityPadding - 1
        const leftBoundAdjusted = leftBound < 0 ? length + leftBound : leftBound
        const rightBound = this.dataIndex + visibilityPadding + 1
        const rightBoundAdjusted = rightBound > length ? rightBound - length : rightBound

        const _getBounds = (currentIndex, boundsArray) => {
            const newIndex = currentIndex + 1
            const newBoundsArray = boundsArray.concat(newIndex)

            if (newIndex < rightBoundAdjusted) {
                return _getBounds(newIndex, newBoundsArray)
            }

            return newBoundsArray
        }

        if (leftBoundAdjusted > rightBoundAdjusted) {
            const _getLeftBounds = (currentIndex, boundsArray) => {
                const newIndex = currentIndex + 1
                const newBoundsArray = boundsArray.concat(newIndex)

                if (newIndex < length) {
                    return _getLeftBounds(newIndex, newBoundsArray)
                }

                return newBoundsArray
            }

            const _getRightBounds = (currentIndex, boundsArray) => {
                const newIndex = currentIndex + 1
                const newBoundsArray = boundsArray.concat(newIndex)

                if (newIndex < rightBoundAdjusted) {
                    return _getRightBounds(newIndex, newBoundsArray)
                }

                return newBoundsArray
            }

            const leftBounds = _getLeftBounds(leftBoundAdjusted, [leftBoundAdjusted])
            const rightBounds = _getRightBounds(0, [0])

            return [...leftBounds, ...rightBounds]
        }

        return _getBounds(leftBoundAdjusted, [leftBoundAdjusted])
    }

    _innerRef = () => {
        const { innerRef } = this.props

        innerRef && innerRef(this)
    }

    _keyExtractor = (item, index) => {
        const { keyExtractor } = this.props

        return keyExtractor(item, index)
    }

    _onScroll = index => {
        const { onScroll } = this.props

        onScroll && onScroll(index)
    }

    _onScrollBegin = index => {
        const { onScrollBegin } = this.props

        onScrollBegin && onScrollBegin(index)
    }

    _onScrollEnd = index => {
        const { onScrollEnd } = this.props

        onScrollEnd && onScrollEnd(index)
    }

    _renderItem = ({ item, index }) => {
        const { renderItem } = this.props

        return renderItem({ item, index })
    }

    _setElementPositions = () => {
        const { displayData } = this.state

        this._innerRef()

        const transforms = displayData.reduce((acc, _, index) => {
            const { selectedItemScale } = this.props
            const { translateX, translateY } = this._getTransforms(index)

            return {
                ...acc,
                [`scale${index}`]: new Animated.Value(
                    index === this.selectedIndex ? selectedItemScale : 1
                ),
                [`translateX${index}`]: new Animated.Value(translateX),
                [`translateY${index}`]: new Animated.Value(translateY),
            }
        }, {})

        this.setState({ ...transforms })
    }

    scrollToIndex = (index, stepDuration = 30) => {
        if (index === this.dataIndex) {
            return
        }

        this._onScrollBegin(this.dataIndex)

        const { selectedItemScale } = this.props
        const { breakpoints, displayData, rotationIndex, theta } = this.state
        const { direction, stepCount } = this._getScrollToIndex(index)

        const step = currentCount => {
            const newCount = currentCount + 1
            const resetOffset =
                this.rotationOffset > 2 * PI
                    ? this.rotationOffset - 2 * PI
                    : this.rotationOffset < -2 * PI
                    ? this.rotationOffset + 2 * PI
                    : this.rotationOffset

            this.dataIndex = this._getDataIndex(direction)
            // Overshoot on last step of scroll for spring effect
            const thetaOffset = newCount < stepCount ? theta : theta * 1.1
            this.rotationOffset =
                direction === 'RIGHT' ? resetOffset + thetaOffset : resetOffset - thetaOffset
            this.selectedIndex = this._getClosestIndex(
                this.rotationOffset,
                breakpoints,
                theta,
                direction
            )

            const animations = displayData.map((_, index) => {
                const { translateX, translateY } = this._getTransforms(index)

                this.state[`scale${index}`].setValue(
                    index === this.selectedIndex ? selectedItemScale : 1
                )

                const xTiming = Animated.timing(this.state[`translateX${index}`], {
                    toValue: translateX,
                    duration: stepDuration,
                })
                const yTiming = Animated.timing(this.state[`translateY${index}`], {
                    toValue: translateY,
                    duration: stepDuration,
                })

                return Animated.parallel([xTiming, yTiming])
            })

            Animated.parallel(animations).start(() => {
                const [insertionIndexLeft, insertionIndexRight] = this._getInsertionIndex(
                    direction,
                    'ELEMENTS'
                )
                const [dataIndexLeft, dataIndexRight] = this._getInsertionIndex(direction, 'DATA')
                const displayData = this._getDisplayData(
                    dataIndexLeft,
                    dataIndexRight,
                    insertionIndexLeft,
                    insertionIndexRight
                )
                const newRotationIndex = this.selectedIndex
                const visibleDataBounds = this._getVisibleElements()

                if (newRotationIndex !== rotationIndex)
                    this.setState({
                        dataIndexLeft,
                        dataIndexRight,
                        displayData,
                        insertionIndexLeft,
                        insertionIndexRight,
                        rotationIndex: newRotationIndex,
                        visibleDataBounds,
                    })

                if (newCount < stepCount) {
                    return step(newCount)
                }

                const selectedIndex = this._getClosestIndex(
                    this.rotationOffset,
                    breakpoints,
                    theta,
                    direction
                )

                const snapOffset = 2 * PI - breakpoints[selectedIndex]

                this.rotationOffset = snapOffset

                this.setState({ rotationIndex: selectedIndex })

                const finalAnimations = displayData.map((_, index) => {
                    const { translateX, translateY } = this._getTransforms(index)

                    this.state[`scale${index}`].setValue(
                        index === this.selectedIndex ? selectedItemScale : 1
                    )

                    const xSpring = Animated.spring(this.state[`translateX${index}`], {
                        toValue: translateX,
                        velocity: abs(0.03 * stepDuration),
                    })
                    const ySpring = Animated.spring(this.state[`translateY${index}`], {
                        toValue: translateY,
                        velocity: abs(0.03 * stepDuration),
                    })

                    return Animated.parallel([xSpring, ySpring])
                })

                Animated.parallel(finalAnimations).start(() => {
                    this.setState({ scrolling: false })
                })

                return this._onScrollEnd(this.dataIndex)
            })
        }

        step(0)
    }

    componentDidMount() {
        this._setElementPositions()
    }

    componentDidUpdate(prevProps) {
        const { flatness } = this.props

        if (prevProps.flatness !== flatness) {
            this._setElementPositions()
        }
    }

    render() {
        const { containerStyle, radius, responderZoneInsets } = this.props
        const { data, displayData, theta, visibleDataBounds } = this.state

        return (
            <CircleListLayout
                calcHeight={this._calcHeight}
                containerStyle={containerStyle}
                data={data}
                displayData={displayData}
                keyExtractor={this._keyExtractor}
                panHandlers={this._panResponder.panHandlers}
                radius={radius}
                renderItem={this._renderItem}
                responderZoneInsets={responderZoneInsets}
                state={this.state}
                theta={theta}
                visibleDataBounds={visibleDataBounds}
            />
        )
    }
}
