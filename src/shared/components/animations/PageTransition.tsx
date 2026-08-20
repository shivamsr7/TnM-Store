import {
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
} from "react-router-dom";


interface PageTransitionProps {
  children: ReactNode;
}


export default function PageTransition({
  children,
}: PageTransitionProps) {

  const {
    pathname,
    search,
  } = useLocation();


  const [isVisible, setIsVisible] = useState(false);


  useEffect(() => {

    setIsVisible(false);


    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });


    return () => {
      cancelAnimationFrame(frame);
    };

  }, [
    pathname,
    search,
  ]);


  return (

    <div
      className={`
        transition-[opacity,transform]
        duration-300
        ease-out
        motion-reduce:transition-none
        motion-reduce:transform-none
        ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-[4px] opacity-0"
        }
      `}
    >

      {children}

    </div>

  );

}