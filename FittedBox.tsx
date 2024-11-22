 import { useStyle } from '@amzn/ar-workcell-user-interface-design-tokens';
	 import { FC, ReactElement, useLayoutEffect, useEffect, useRef, useState } from 'react';
	 
	 type FittedBoxProps = {
	   fit: 'contain' | 'cover' | 'fill';
	   children: ReactElement;
	 };
	 
	 const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
	 
	 const FittedBox: FC<FittedBoxProps> = ({ children, fit }) => {
	   const ref = useRef<HTMLDivElement>(null);
	 
	   const [scale, setScale] = useState('1');
	   const [margin, setMargin] = useState([0, 0]);
	 
	   const wrapper = useStyle(() => ({
	     width: '100%',
	     height: '100%',
	     overflow: 'hidden',
	     '> *': {
	       transform: `scale(${scale})`,
	       transformOrigin: `50% 50%`,
	       marginLeft: margin[0],
	       marginTop: margin[1],
	     },
	   }));
	 
	   useIsomorphicLayoutEffect(() => {
	     if (!ref.current) {
	       return;
	     }
	 
	     const { width, height } = ref.current.getBoundingClientRect();
	     const { width: childWidth, height: childHeight } = ref.current.firstElementChild.getBoundingClientRect();
	     const scaleX = childWidth === 0 ? 0 : width / childWidth;
	     const scaleY = childHeight === 0 ? 0 : height / childHeight;
	 
	     setMargin([(width - childWidth) / 2, (height - childHeight) / 2]);
	 
	     switch (fit) {
	       case 'contain':
	         setScale(Math.min(scaleX, scaleY).toString());
	         break;
	       case 'cover':
	         setScale(Math.max(scaleX, scaleY).toString());
	         break;
	       case 'fill':
	         setScale(`${scaleX}, ${scaleY}`);
	         break;
	     }
	   }, []);
	 
	   return (
	     <div
	       ref={ref}
	       className={wrapper}>
	       {children}
	     </div>
	   );
	 };
	 
	 export default FittedBox;
