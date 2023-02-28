import {Toast, Frame, Page, Button} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import {useDispatch} from "react-redux"
import { closeToast } from '../redux/toastRedux';
import { useSelector } from 'react-redux';

const ToastExample = ()=>{
const dispatch=useDispatch();
 
  const {open,message,error}=useSelector((state)=>state.toast)

  
  const dismissToast=()=>{
    dispatch(closeToast())
  }

  setTimeout(() => {
     dismissToast()
  }, 3000);
  const toastMarkup =  (
    <Toast content={message} onDismiss={dismissToast} error={error}/>
  ) 

  return (
    <div>
          {open?toastMarkup:null}
    </div>
  );
}

export default ToastExample