import {
  useContext,
  useState,
  createContext,
  useRef,
  useEffect,
  useImperativeHandle,
  use,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import { addSession, getSessions, listenToChancesInDB, deletefromDB, signInWithGoogle } from "./firebase.js";
import { Header, Footer, Semana, Agendamento } from "./components/schedule/Utils.js";
import { ScheduleTable } from "./components/schedule/ScheduleTable.js";
import { RegisterStudentModal } from "./components/schedule/RegisterStudent.js";

// Contexts
interface SemanaContextType {
  semana: Semana;
  setSemana: React.Dispatch<React.SetStateAction<Semana>>;
}
export const SemanaContext = createContext<SemanaContextType | null>(null);
export const ModalContext = createContext<any>(undefined);

export default function Agenda() {
  let [user, setUser] = useState("Juliana Ramos");
  let [scheduleDate, setScheduleDate] = useState(Date);
  let [semana, setSemana] = useState(new Semana([]));
  let modalRef = useRef<HTMLDialogElement | null>(null);

  // If no date is in the URL
  useEffect(() => {
    let URLParans = new URLSearchParams(window.location.search)
      .get("date")
      ?.replaceAll("-", "/");
    if (!URLParans) {
      let date = new Date(Date.now());
      let [day, month, year] = [
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
      ];
      window.location.search = `date=${day}-${month}-${year}`;

    }
    
    listenToChancesInDB(setSemana)
  }, []);

  const SemanaContextValue = { semana, setSemana };

  function showRegisterModal(day, startTime) {
    localStorage.setItem("day", day);
    localStorage.setItem("startTime", startTime);
    localStorage.setItem("user", user);
    modalRef.current?.classList.replace("hidden", "flex");
    modalRef.current?.showModal();
  }

  return (
    <div className="w-full h-dvh flex flex-col">
      <Header user={user} setUser={setUser}></Header>
      <SemanaContext value={SemanaContextValue}>
        <ModalContext value={{ showRegisterModal }}>

          <ScheduleTable></ScheduleTable>
          <Footer></Footer>
          <RegisterStudentModal
            ref={modalRef}
            scheduleDate={scheduleDate}
            />

        </ModalContext>
      </SemanaContext>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}