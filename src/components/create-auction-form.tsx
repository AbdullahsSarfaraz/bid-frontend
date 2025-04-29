"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AuctionService } from "@/lib/apis/auction.api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z
  .object({
    title: z.string().min(3, {
      message: "Title must be at least 3 characters.",
    }),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date and time.",
    }),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Please enter a valid date and time.",
    }),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time.",
    path: ["endTime"],
  })

interface CreateAuctionFormProps {
  onSuccess?: (auctionId: string) => void
}

export default function CreateAuctionForm({ onSuccess }: CreateAuctionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const defaultStartTime = now.toISOString().slice(0, 16) 
  const defaultEndTime = tomorrow.toISOString().slice(0, 16)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    },
  })

  const createAuctionMutation = useMutation({
    mutationFn: AuctionService.createAuction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] })
      toast({
        title: "Auction created",
        description: "Your auction has been created successfully.",
      })
      form.reset()
      if (onSuccess) onSuccess(data.id) 
    },
    onError: (error) => {
      console.error("Error creating auction:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create auction. Please try again.",
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    createAuctionMutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auction Title</FormLabel>
              <FormControl>
                <Input placeholder="Spring Collection Auction" {...field} />
              </FormControl>
              <FormDescription>Enter a descriptive title for your auction.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>When will the auction start?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>When will the auction end?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Auction"
          )}
        </Button>
      </form>
    </Form>
  )
}
