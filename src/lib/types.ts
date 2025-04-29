export interface Auction {
  id: string
  title: string
  startTime: string
  endTime: string
  createdAt: string
}

export interface Item {
  id: string
  name: string
  description: string
  startingPrice: number
  auction?: Auction
  bids?: Bid[]
}

export interface Bid {
  id: string
  user: User
  item?: Item
  amount: number
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface AuctionWithItems extends Auction {
  items: Item[]
}

export interface CreateAuctionPayload {
  title: string
  startTime: string
  endTime: string
}

export interface CreateItemPayload {
  auctionId: string
  name: string
  description: string
  startingPrice: number
}
