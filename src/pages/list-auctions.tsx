'use client';

import { useQuery } from '@tanstack/react-query';
import { AuctionService } from '@/lib/apis/auction.api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router'; 

interface ListAuctionsProps {
  onAuctionSelect: (auctionId: string) => void;
}

export default function ListAuctions({ onAuctionSelect }: ListAuctionsProps) {
  const { data: auctions, isLoading, isError } = useQuery({
    queryKey: ['auctions'],
    queryFn: AuctionService.getAllAuctions,
  });

  const [currentTime, setCurrentTime] = useState(Date.now());
  const navigate = useNavigate();  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval); 
  }, []);

  const handleViewItems = (auctionId: string, auctionEndTime: string) => {
    navigate(`/auction/${auctionId}/items`, {
      state: { auctionEndTime },
    });
  };

  if (isLoading) {
    return (
     
      <div className="w-full bg-gray-50 text-gray-800 p-4 flex justify-center items-center">
      <div className="border-t-4 border-blue-600 border-solid w-16 h-16 rounded-full animate-spin"></div>
    </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full bg-gray-50 text-red-600 p-4">
        Error loading auctions.
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 text-gray-800 p-4">
      <h2 className="text-2xl font-semibold mb-4">Current Auctions</h2>

      {(!auctions || auctions.length === 0) ? (
        <div className="text-gray-500">No auctions found.</div>
      ) : (
        <ul className="space-y-4">
          {auctions.map((auction: any) => {
            const auctionEndTime = new Date(auction.endTime).toISOString(); // Ensuring ISO string format
            const auctionStatus = currentTime < new Date(auctionEndTime).getTime() ? 'Ongoing' : 'Ended';

            return (
              <li
                key={auction.id}
                className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm ${
                  auctionStatus === 'Ended' ? 'cursor-not-allowed' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">{auction.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Ends at: {new Date(auction.endTime).toLocaleString()}
                    </div>
                    <div
                      className={`text-sm mt-2 ${
                        auctionStatus === 'Ongoing' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      Status: {auctionStatus}
                    </div>
                  </div>

                  {auctionStatus === 'Ongoing' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleViewItems(auction.id, auctionEndTime)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:cursor-pointer"
                      >
                        View Auction Items
                      </button>
                      <button
                        onClick={() => onAuctionSelect(auction.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hover:cursor-pointer"
                      >
                        Add Item to Auction
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
