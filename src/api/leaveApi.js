import axiosInstance from "./axiosInstance";

export class leaveApi {
    #base = '/api/vi/leave';

    //잔여 연차 조회
    async getBalance() { 
        const { data } = await axiosInstance.get(`${this.#base}/balance`);
        return data;
    }

    //직급별 연차 기준 조회
    async getPolicy() {
        const { data } = await axiosInstance.get(`${this.#base}/policy`);
        return data;
    }
    
    //연차 신청 (leaveData: {leaveType, startDate, endDate, reason}) 
    async createRequest(leaveData) {
        const { data } = await axiosInstance.post(`${this.#base}/requests`, leaveData);
        return data;
    }
    
    //신청 내역 조회
    async getMyRequests() {
        const { data } = await axiosInstance.get(`${this.#base}/requests/me`);
        return data;
    }
}
