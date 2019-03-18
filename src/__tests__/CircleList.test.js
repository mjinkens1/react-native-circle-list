import React from 'react'
import renderer from 'react-test-renderer'
import CircleList from '../CircleList'
import { mockData } from '../__mocks__/mockData'

// TODO: Add more test cases

test('renders correctly', () => {
    const tree = renderer
        .create(<CircleList data={mockData} keyExtractor={jest.fn()} renderItem={jest.fn()} />)
        .toJSON()
    expect(tree).toMatchSnapshot()
})
