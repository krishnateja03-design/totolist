import {motion} from 'framer-motion';
const blobs=[['bg-indigo-400','top-4 left-20'],['bg-violet-400','top-28 right-24'],['bg-cyan-300','bottom-24 left-1/3'],['bg-pink-300','bottom-10 right-1/4']];
export function BackgroundBlobs(){return <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F8FAFC] dark:bg-slate-950">{blobs.map(([c,p],i)=><motion.div key={c} className={`absolute ${p} h-72 w-72 rounded-full ${c} opacity-30 blur-3xl`} animate={{x:[0,60,-30,0],y:[0,-40,50,0],scale:[1,1.15,.95,1]}} transition={{duration:18+i*3,repeat:Infinity,ease:'easeInOut'}} />)}</div>}
