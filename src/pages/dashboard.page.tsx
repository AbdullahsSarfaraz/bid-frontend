"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateItemForm from "@/components/create-item-form"
import CreateAuctionForm from "@/components/create-auction-form"
import ListAuctions from "./list-auctions"


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("auctions")
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null)

  const handleAuctionSelect = (auctionId: string) => {
    setSelectedAuctionId(auctionId)
    setActiveTab("create-item")
  }

  const handleAuctionCreated = (auctionId: string) => {
    setSelectedAuctionId(auctionId)
    setActiveTab("create-item")
  }

  return (
      <div className="container mx-auto py-10">
        <Card className="border-none shadow-md">
          <CardHeader className="bg-white rounded-t-lg border-b">
            <CardTitle className="text-2xl font-bold">Auction Dashboard</CardTitle>
            <CardDescription>Manage auctions and auction items</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="auctions" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                <TabsTrigger value="auctions" className="hover:cursor-pointer">Auctions</TabsTrigger>
                <TabsTrigger value="create-auction" className="hover:cursor-pointer">Create Auction</TabsTrigger>
                <TabsTrigger value="create-item" disabled={!selectedAuctionId}>
                  Add Item to Auction
                </TabsTrigger>
              </TabsList>
              <TabsContent value="auctions" className="p-6">
                <ListAuctions onAuctionSelect={handleAuctionSelect} />
              </TabsContent>
              <TabsContent value="create-auction" className="p-6">
                <CreateAuctionForm onSuccess={handleAuctionCreated} />
              </TabsContent>
              <TabsContent value="create-item" className="p-6">
                {selectedAuctionId ? (
                  <CreateItemForm auctionId={selectedAuctionId} onSuccess={() => setActiveTab("auctions")} />
                ) : (
                  <div className="text-center py-10">
                    <p>Please select an auction first to add items.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
  )
}
