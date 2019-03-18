import React from 'react'
import renderer from 'react-test-renderer'
import { CircleListLayout } from '../CircleListLayout'

// TODO: Add more test cases

test('renders correctly', () => {
    const tree = renderer
        .create(
            <CircleListLayout
                calcHeight={jest.fn()}
                displayData={[]}
                initialRotationOffset={0}
                keyExtractor={jest.fn(() => Math.random())}
                panHandlers={{}}
                radius={0}
                renderItem={jest.fn()}
                rotationOffset={0}
                selectedIndex={0}
                selectedItemScale={0}
                theta={0}
            />
        )
        .toJSON()
    expect(tree).toMatchSnapshot()
})
