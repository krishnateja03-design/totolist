import {useEffect} from 'react';
export function useHotkeys(key:string,handler:()=>void){useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===key.toLowerCase()){e.preventDefault();handler();}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[key,handler]);}
