import { useDispatch, type TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store/store';


export const atminDispatch: () => AppDispatch = useDispatch;
export const atminSelector: TypedUseSelectorHook<RootState> = useSelector;