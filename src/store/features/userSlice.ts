// import { User } from '@/interfaces/auth';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../types/user';

interface UserState {
    user: User | null;
}

const initialState: UserState = {
    user: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
        },
        updateUserInfo: (state: UserState, action: PayloadAction<any>) => {
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const { logout, updateUserInfo } = userSlice.actions;
export default userSlice.reducer;
