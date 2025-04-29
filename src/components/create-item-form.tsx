"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import { createItem, fetchAuctionById } from "@/lib/api"
import { AuctionService } from "@/lib/apis/auction.api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  startingPrice: z.coerce.number().positive({
    message: "Starting price must be a positive number.",
  }),
})

interface CreateItemFormProps {
  auctionId: string
  onSuccess?: () => void
}

export default function CreateItemForm({ auctionId, onSuccess }: CreateItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: auction,
    isLoading: isLoadingAuction,
    error: auctionError,
  } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => AuctionService.getAuctionById(auctionId),
    enabled: !!auctionId,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startingPrice: undefined,
    },
  })

  const createItemMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => AuctionService.addItemToAuction(auctionId,{ ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] })
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] })
      toast({
        title: "Item created",
        description: "Your auction item has been created successfully.",
      })
      form.reset()
      if (onSuccess) onSuccess()
    },
    onError: (error) => {
      console.error("Error creating item:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create item. Please try again.",
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    createItemMutation.mutate(values)
  }

  if (isLoadingAuction) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (auctionError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load auction details. Please try again.</AlertDescription>
      </Alert>
    )
  }

  if (!auction) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Auction not found</AlertTitle>
        <AlertDescription>The selected auction could not be found.</AlertDescription>
      </Alert>
    )
  }

  // Check if auction has ended
  const auctionEnded = new Date(auction.endTime) < new Date()
  if (auctionEnded) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Auction has ended</AlertTitle>
        <AlertDescription>You cannot add items to an auction that has already ended.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium">Adding item to: {auction.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This item will be available for bidding until the auction ends on {new Date(auction.endTime).toLocaleString()}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Vintage Watch" {...field} />
                </FormControl>
                <FormDescription>Enter a descriptive name for your auction item.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe your item in detail..." className="resize-none" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starting Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" placeholder="100.00" {...field} />
                </FormControl>
                <FormDescription>Set the minimum starting bid for this item.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Auction Item"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
