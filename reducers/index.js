/*
  reducer = a function that returns some data
*/
import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import PaymentReducer from './PaymentReducer';
import UtilityReducer from './UtilityReducer';
import ChoreReducer from './ChoreReducer';
import ErrandReducer from './ErrandReducer';

// requried to have minimum 1 reducer that returns NOT undefined.
export default combineReducers({
  auth: AuthReducer,
  payment: PaymentReducer,
  utility: UtilityReducer,
  chore: ChoreReducer,
  errand: ErrandReducer
});
