import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router'
import './index.css'
import Home from './home.tsx'
import AuctionItems from './pages/auction-items.page.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auction/:auctionId/items" element={<AuctionItems />} />
    </Routes>
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
