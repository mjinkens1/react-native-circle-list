import React from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'

export const CircleListLayout = ({
    calcHeight,
    containerStyle,
    displayData,
    keyExtractor,
    panHandlers,
    renderItem,
    state,
}) => (
    <View {...panHandlers} style={[styles.container, { height: calcHeight() }, containerStyle]}>
        <View style={styles.wrapper}>
            {displayData.map((item, index) => {
                const scale = state[`scale${index}`]
                const translateX = state[`translateX${index}`]
                const translateY = state[`translateY${index}`]
                const { _dataIndex, ...itemToRender } = item

                return (
                    translateX &&
                    translateY && (
                        <Animated.View
                            key={keyExtractor(item, index)}
                            style={[
                                styles.renderItemContainer,
                                {
                                    transform: [{ translateX }, { translateY }, { scale }],
                                },
                            ]}
                        >
                            {renderItem({ item: itemToRender, index: item._dataIndex })}
                        </Animated.View>
                    )
                )
            })}
        </View>
    </View>
)

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'stretch',
        overflow: 'hidden',
    },
    renderItemContainer: {
        position: 'absolute',
    },
    wrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'stretch',
        marginTop: 10,
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
    renderItem: PropTypes.func.isRequired,
    swipeSpeedMultiplier: PropTypes.number,
    theta: PropTypes.number.isRequired,
    visibilityPadding: PropTypes.number,
}
