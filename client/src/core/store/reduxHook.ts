import { useDispatch, type TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';


export const atminDispatch: () => AppDispatch = useDispatch;
export const atminSelector: TypedUseSelectorHook<RootState> = useSelector;