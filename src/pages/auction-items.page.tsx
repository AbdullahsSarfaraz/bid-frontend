'use client';

import { useParams, useNavigate, useLocation } from 'react-router'; 
import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL, AuctionService } from '@/lib/apis/auction.api';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { io } from 'socket.io-client'; 

export default function AuctionItems() {
  const { auctionId } = useParams(); 
  const navigate = useNavigate();
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
  const [userIds, setUserIds] = useState<Record<string, number>>({});
  const [socket, setSocket] = useState<any>(null);
  const [localItems, setLocalItems] = useState<any[]>([]);
  const location = useLocation()

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['auction-items', auctionId],
    queryFn: () => AuctionService.getAuctionItems(auctionId!),  
  });
  const auctionEndTime = location.state?.auctionEndTime;
  useEffect(() => {
    const intervalId = setInterval(() => {
      const auctionEnd = new Date(auctionEndTime).getTime();
      const currentTime = new Date().getTime();
  
      if (auctionEnd <= currentTime) {
        toast.info('Auction has ended!');
        navigate(-1); 
        clearInterval(intervalId); 
      }
    }, 1000); 


    if (items && items.length > 0) {
      setLocalItems(items); 
      
      const initialBids: Record<string, number> = {};
      const initialUserIds: Record<string, number> = {};
      items.forEach(item => {
        initialBids[item.id] = item.startingPrice + 1;
        initialUserIds[item.id] = 1; 
      });
      setBidAmounts(initialBids);
      setUserIds(initialUserIds);
    }

    const socketConnection = io(API_BASE_URL); 
    setSocket(socketConnection);

    socketConnection.on('bidPlaced', (data) => {
      if (data.success) {
        toast.success(`Successfully placed bid of $${data.amount} on ${data.itemName}`);
        setLocalItems((prevItems) =>
          prevItems.map((item) =>
            item.id === data.itemId
              ? { ...item, highestBidAmount: data.amount }
              : item
          )
        );
      } else {
        toast.error('Failed to place bid. Please try again.');
      }
    });

    socketConnection.on('newBid', (data) => {
      toast.info(`New highest bid of $${data.amount} on ${data.itemName}`);
      setLocalItems((prevItems) =>
        prevItems.map((item) =>
          item.id === data.itemId
            ? { ...item, highestBidAmount: data.amount }
            : item
        )
      );
    });

    socketConnection.on('validationError', (data) => {
      if (data.errors && data.errors.length > 0) {
        data.errors.forEach((error: any) => {
          toast.error(`${error.property}: ${Object.values(error.constraints).join(', ')}`);
        });
      }
    });


    return () => {
      clearInterval(intervalId)
      socketConnection.disconnect();
    };
  }, [items, auctionEndTime]);

  const handleBid = (itemId: string, itemStartingPrice: number, itemName: string) => {
    const selectedItem = localItems.find((item) => item.id === itemId);
    const highestBid = selectedItem?.highestBidAmount || itemStartingPrice;
    const bidAmount = bidAmounts[itemId];
    const userId = userIds[itemId];

    if (!bidAmount || bidAmount <= highestBid) {
      toast.error(`Bid must be higher than the current highest bid of $${highestBid}`);
      return;
    }
    if (!userId || userId < 1 || userId > 100) {
      toast.error('Please provide a valid User ID (between 1 and 100)');
      return;
    }

    socket.emit('placeBid', { auctionId, itemId, amount: bidAmount, userId, itemName });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 text-gray-800 p-4 flex justify-center items-center">
      <div className="border-t-4 border-blue-600 border-solid w-16 h-16 rounded-full animate-spin"></div>
    </div>
    )
  }

  if (isError) {
    return <div>Error loading items.</div>;
  }

  return (
    <div className="container mx-auto py-10">

    <button
    onClick={handleGoBack}
    className="text-lg mb-4 text-gray-300 hover:text-gray-400 hover:cursor-pointer"
  >
    {'<'} Previous
    </button>

      <h2 className="text-2xl font-semibold mb-4">Auction Items</h2>

      {auctionEndTime && (
  <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
    <p className="text-lg font-semibold text-gray-600 flex gap-2">
      Ends At:   <p className="text-xl text-green-600">
      {new Date(auctionEndTime).toLocaleString()}
    </p>
    </p>
  
  </div>
)}

      {localItems.length > 0 ? (
        <Table>
          <TableHeader className='bg-gray-100 text-gray-100'>
            <TableRow>
              <TableHead className='text-gray-600'>Item Name</TableHead>
              <TableHead className='text-gray-600'>Description</TableHead>
              <TableHead className='text-gray-600'>Current Highest Bid</TableHead>
              <TableHead className='text-gray-600'>Starting Price</TableHead>
              <TableHead className='text-gray-600'>User ID</TableHead>
              <TableHead className='text-gray-600'>Place Bid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localItems.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>${item.highestBidAmount ?? item.startingPrice}</TableCell>
                <TableCell>${item.startingPrice}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Enter your user ID"
                    value={userIds[item.id] ?? ''}
                    onChange={(e) => setUserIds((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter your bid"
                      value={bidAmounts[item.id] ?? ''}
                      onChange={(e) => setBidAmounts((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                      className="w-32"
                    />
                    <Button
                      onClick={() => handleBid(item.id, item.startingPrice, item.name)}
                      variant="outline"
                      className='hover:cursor-pointer'
                    >
                      Place Bid
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-gray-500 py-10">No items available for this auction.</div>
      )}

      <ToastContainer />
    </div>
  );
}
