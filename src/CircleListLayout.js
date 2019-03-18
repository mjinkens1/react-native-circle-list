import React from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'

const { cos, PI, sin } = Math

export const CircleListLayout = ({
    calcHeight,
    containerStyle,
    displayData,
    initialRotationOffset,
    keyExtractor,
    panHandlers,
    radius,
    renderItem,
    rotationOffset,
    selectedIndex,
    selectedItemScale,
    theta,
}) => (
    <View {...panHandlers} style={[styles.container, { height: calcHeight() }, containerStyle]}>
        {displayData.map((item, index) => {
            const thetaOffset = 2 * PI * index + (rotationOffset + initialRotationOffset)
            const translateX = radius * cos(index * theta + thetaOffset)
            const translateY = radius * sin(index * theta + thetaOffset) + radius
            const selected = selectedIndex === index

            return (
                translateY < radius && (
                    <View
                        key={keyExtractor(item, index)}
                        style={[
                            styles.renderItemContainer,
                            {
                                transform: [
                                    { translateX },
                                    { translateY },
                                    { scale: selected ? selectedItemScale : 1 },
                                ],
                            },
                        ]}
                    >
                        {renderItem({ item, index })}
                    </View>
                )
            )
        })}
    </View>
)

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'stretch',
    },
    renderItemContainer: {
        position: 'absolute',
    },
})

CircleListLayout.propTypes = {
    calcHeight: PropTypes.func.isRequired,
    containerStyle: PropTypes.object,
    data: PropTypes.array,
    displayData: PropTypes.array,
    elementCount: PropTypes.number,
    initialRotationOffset: PropTypes.number,
    keyExtractor: PropTypes.func.isRequired,
    panHandlers: PropTypes.object.isRequired,
    radius: PropTypes.number,
    renderItem: PropTypes.func.isRequired,
    rotationOffset: PropTypes.number.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    selectedItemScale: PropTypes.number,
    swipeSpeedMultiplier: PropTypes.number,
    theta: PropTypes.number.isRequired,
    visibilityPadding: PropTypes.number,
}
