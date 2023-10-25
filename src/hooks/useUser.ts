import { IEmployees } from "./../interfaces/Employees";
import create from "zustand";
import { persist, devtools } from "zustand/middleware";
import { axiosClient } from "../libraries/axiosClient";

const persistOptions = {
  name: "user-storage",
  getStorage: () => localStorage,
};

export const useUser = create(
  persist(
    devtools((set, get: any) => ({
      access_token: null,
      refresh_token: null,
      users: {},
      addUser: (employee: IEmployees) => {
        const users = get().users;
        Object.assign(users, employee);
        return set((state) => ({ users: users }), false, {
          type: "addUser",
        });
      },
      initialize: () => {
        const storedToken = localStorage.getItem("access_token");
        const storedRefreshToken = localStorage.getItem("refresh_token");
        if (storedToken && storedRefreshToken) {
          set({ access_token: storedToken, refresh_token: storedRefreshToken });
        }
      },
      refreshToken: async () => {
        const refresh_token = localStorage.getItem("refresh_token");
        if (refresh_token) {
          try {
            const response = await axiosClient.post("employees/refresh-token", {
              refresh_token,
            });
            const { access_token } = response.data;
            set({ access_token });
            // Lưu trữ token mới vào localStorage hoặc cookie
            localStorage.setItem("access_token", access_token);
          } catch (error) {
            console.error("Làm mới token thất bại", error);
            // Xóa token và refreshToken từ localStorage hoặc cookie
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        }
      },
    })),
    persistOptions
  )
);
