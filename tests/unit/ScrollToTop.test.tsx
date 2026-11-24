import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { ScrollToTop } from '../../src/components/ScrollToTop';

describe('ScrollToTop', () => {
  it('llama a window.scrollTo(0, 0) al montar y de nuevo al navegar a otra ruta', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(
      <MemoryRouter initialEntries={['/a']}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/b">ir a B</Link>} />
          <Route path="/b" element={<span>Pagina B</span>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockClear();

    await user.click(screen.getByText('ir a B'));

    expect(await screen.findByText('Pagina B')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
