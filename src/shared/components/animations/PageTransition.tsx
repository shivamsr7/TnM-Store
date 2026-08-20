import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigationType,
} from "react-router-dom";


interface PageTransitionProps {
  children: ReactNode;
}


type TransitionDirection =
  | "forward"
  | "back";


export default function PageTransition({
  children,
}: PageTransitionProps) {

  const {
    pathname,
    search,
  } = useLocation();


  const navigationType =
    useNavigationType();


  /*
   * =========================================================
   * NAVIGATION DIRECTION
   * =========================================================
   */

  const previousPathRef =
    useRef(
      `${pathname}${search}`
    );


  const historyIndexRef =
    useRef(0);


  const historyEntriesRef =
    useRef<
      string[]
    >([
      `${pathname}${search}`,
    ]);


  const [
    direction,
    setDirection,
  ] = useState<TransitionDirection>(
    "forward"
  );


  /*
   * =========================================================
   * VISIBILITY
   * =========================================================
   */

  const [
    isVisible,
    setIsVisible,
  ] = useState(true);


  /*
   * =========================================================
   * ROUTE CHANGE
   * =========================================================
   */

  useEffect(() => {

    const currentPath =
      `${pathname}${search}`;


    if (
      currentPath ===
      previousPathRef.current
    ) {

      return;

    }


    /*
     * PUSH
     *
     * A normal link click such as:
     *
     * Shop → Product
     *
     * is treated as forward navigation.
     */

    if (
      navigationType ===
      "PUSH"
    ) {

      const currentIndex =
        historyIndexRef.current + 1;


      historyEntriesRef.current =
        historyEntriesRef.current
          .slice(
            0,
            currentIndex
          );


      historyEntriesRef.current.push(
        currentPath
      );


      historyIndexRef.current =
        currentIndex;


      setDirection(
        "forward"
      );

    }


    /*
     * POP
     *
     * Browser back / forward.
     *
     * We compare the current route
     * against the locally tracked history
     * to determine the direction.
     */

    else if (
      navigationType ===
      "POP"
    ) {

      const existingIndex =
        historyEntriesRef.current
          .indexOf(
            currentPath
          );


      if (
        existingIndex !== -1
      ) {

        setDirection(
          existingIndex <
            historyIndexRef.current
            ? "back"
            : "forward"
        );


        historyIndexRef.current =
          existingIndex;

      }

      else {

        /*
         * If the route was reached through
         * a browser-level history entry that
         * this component has not tracked,
         * use the safest subtle transition.
         */

        setDirection(
          "back"
        );


        historyEntriesRef.current.push(
          currentPath
        );


        historyIndexRef.current =
          historyEntriesRef.current.length -
          1;

      }

    }


    /*
     * REPLACE
     *
     * Keep the current visual direction.
     */

    else {

      setDirection(
        "forward"
      );

    }


    previousPathRef.current =
      currentPath;


    /*
     * Start the new page slightly
     * transparent and offset.
     */

    setIsVisible(
      false
    );


    const frame =
      requestAnimationFrame(
        () => {

          setIsVisible(
            true
          );

        }
      );


    return () => {

      cancelAnimationFrame(
        frame
      );

    };

  }, [
    pathname,
    search,
    navigationType,
  ]);


  /*
   * =========================================================
   * TRANSITION
   * =========================================================
   */

  const transitionClasses =
    direction === "back"

      ? isVisible

        ? "translate-x-0 opacity-100"

        : "translate-x-1 opacity-0"

      : isVisible

        ? "translate-x-0 opacity-100"

        : "-translate-x-1 opacity-0";


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div
      className={`
        transition-[opacity,transform]
        duration-300
        ease-out

        motion-reduce:transition-none
        motion-reduce:transform-none

        ${transitionClasses}
      `}
    >

      {children}

    </div>

  );

}