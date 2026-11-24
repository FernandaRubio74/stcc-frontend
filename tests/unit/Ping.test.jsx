import React from 'react';
import { render, screen } from '@testing-library/react';
import { Ping } from '../../src/Ping';

test('Ping renderiza pong', () => {
  render(<Ping />);
  expect(screen.getByText('pong')).toBeTruthy();
});
