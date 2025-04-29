import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; 
export class AuctionService {
  static async createAuction(data: { title: string; endTime: string }) {
    const response = await axios.post(`${API_BASE_URL}/auctions`, data);
    return response.data;
  }

  static async getAllAuctions() {
    const response = await axios.get(`${API_BASE_URL}/auctions`);
    return response.data;
  }

  static async getAuctionById(auctionId: string) {
    const response = await axios.get(`${API_BASE_URL}/auctions/${auctionId}`);
    return response.data;
  }

  static async addItemToAuction(auctionId: string, data: { name: string; description: string; startingPrice: number }) {
    const response = await axios.post(`${API_BASE_URL}/auctions/${auctionId}/items`, data);
    return response.data;
  }

  static async getAuctionItems(auctionId: string) {
    const response = await axios.get(`${API_BASE_URL}/auctions/${auctionId}/items`);
    return response.data;
  }

}
