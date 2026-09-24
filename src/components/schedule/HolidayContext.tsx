import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, listenToHolidays } from "../../firebase.js";
import type { Holiday } from "../../holidays.js";

interface HolidayState {
  holidays: Holiday[];
  ready: boolean;
  error: string;
}

const HolidayContext = createContext<HolidayState>({ holidays: [], ready: false, error: "" });
export const useHolidays = () => useContext(HolidayContext);

export function HolidayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HolidayState>({ holidays: [], ready: false, error: "" });
  useEffect(() => {
    let unsubscribeHolidays: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      unsubscribeHolidays?.();
      setState({ holidays: [], ready: false, error: "" });
      if (user) {
        unsubscribeHolidays = listenToHolidays(
          (holidays, ready) => setState({ holidays, ready, error: "" }),
          () => setState({ holidays: [], ready: false, error: "Não foi possível carregar os feriados. Verifique a conexão e as permissões e recarregue a página." }),
        );
      }
    });
    return () => { unsubscribeAuth(); unsubscribeHolidays?.(); };
  }, []);
  return <HolidayContext.Provider value={state}>{children}</HolidayContext.Provider>;
}
