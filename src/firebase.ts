import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Timestamp,
  query,
  where,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  deleteDoc,
  getDoc,
  or,
  and,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Agendamento, Semana, getDate } from "./components/schedule/Utils.js";

import { overlappingHolidays, slotDate, validateHoliday, type Holiday, type HolidayInput } from "./holidays.js";

import { collection, addDoc, doc } from "firebase/firestore";
let fireStoreAPIKey;
try {
  fireStoreAPIKey = import.meta.env.VITE_FIREBASE_API_KEY;
} catch (e) {
  fireStoreAPIKey = process.env.VITE_FIREBASE_API_KEY;
}

import {toast } from "react-toastify";

const firebaseConfig = {
  apiKey: fireStoreAPIKey as string,
  authDomain: "agendalab-ab113.firebaseapp.com",
  projectId: "agendalab-ab113",
  storageBucket: "agendalab-ab113.firebasestorage.app",
  messagingSenderId: "229593910539",
  appId: "1:229593910539:web:08d5602089ea9a52e9e60e",
  measurementId: "G-GCR9E6DN76",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function addSession(
  nome: string,
  estágio: string,
  tipo: string,
  conteúdo: string,
  ano: number,
  dia: number,
  horario: string,
  mes: number,
  responsável: string,
  fixo?: boolean,
  inicioFixo?: Date,
  fimFixo?: Date,
) {
  const toastId = toast.loading("Adicionando agendamento para " + nome);
  try {
    const data = slotDate(new Date(ano, mes - 1, dia), horario);
    await verifyHolidayBooking(data, Boolean(fixo));
    if (fixo && (!inicioFixo || !fimFixo || inicioFixo > fimFixo)) {
      throw new Error("Informe um período válido para o agendamento fixo.");
    }
    await addDoc(collection(db, "agendamentos"), {
      nome, estágio, tipo, conteúdo, data, horario, responsável, fixo: Boolean(fixo),
      ...(fixo ? { inicioFixo, fimFixo } : {}),
    });
    toast.update(toastId, { render: "Agendamento de " + nome + " adicionado com sucesso!", type: "success", isLoading: false, autoClose: 1500 });
    return true;
  } catch (error) {
    toast.update(toastId, { render: error instanceof Error ? error.message : "Não foi possível salvar o agendamento.", type: "error", isLoading: false, autoClose: 5000 });
    return false;
  }
}

function readHoliday(id: string, data: unknown): Holiday {
  return { ...validateHoliday(data as HolidayInput), id };
}

export function listenToHolidays(onChange: (holidays: Holiday[], ready: boolean) => void, onError: (error: unknown) => void) {
  return onSnapshot(collection(db, "feriados"), { includeMetadataChanges: true }, snapshot => {
    try {
      onChange(snapshot.docs.map(document => readHoliday(document.id, document.data())), !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites);
    } catch (error) { onError(error); }
  }, onError);
}

export async function saveHoliday(value: HolidayInput, id?: string) {
  const data = validateHoliday(value);
  if (!auth.currentUser) throw new Error("Entre na sua conta para cadastrar feriados.");
  if (id) await updateDoc(doc(db, "feriados", id), data);
  else await addDoc(collection(db, "feriados"), data);
}

export async function deleteHoliday(id: string) {
  if (!auth.currentUser) throw new Error("Entre na sua conta para excluir feriados.");
  await deleteDoc(doc(db, "feriados", id));
}

/** Recheck server state at submission, including a holiday added while the form was open. */
export async function verifyHolidayBooking(date: Date, recurring: boolean) {
  if (!Number.isFinite(date.getTime())) throw new Error("Informe uma data válida.");
  let holidays: Holiday[];
  try {
    const snapshot = await getDocsFromServer(collection(db, "feriados"));
    holidays = snapshot.docs.map(document => readHoliday(document.id, document.data()));
  } catch {
    throw new Error("Não foi possível verificar os feriados. Verifique sua conexão e tente novamente.");
  }
  const conflicts = overlappingHolidays(holidays, date);
  // Recurring series are retained; the calendar skips only affected occurrences.
  if (!recurring && conflicts.length) {
    throw new Error(`Horário indisponível por feriado: ${conflicts.map(holiday => holiday.name).join(", ")}.`);
  }
}

export async function getSessions(startDate: Date) {
  const q = query(collection(db, "agendamentos"));
  const querySnapshot = await getDocs(q);
  console.log("Snapshot: ")
  console.log(querySnapshot)
  let semana: Semana = new Semana([]);
  querySnapshot.forEach((doc) => {
    semana.agendamentos.push(
      new Agendamento(
        doc.data().nome,
        doc.data().estágio,
        doc.data().tipo,
        doc.data().conteúdo,
        doc.data().responsável,
        new Date(doc.data().data.seconds * 1000)
      )
    );
  });
  return semana;
}
let first = true

// --- Global/Module-Level State ---
const fixedAgendamentosCache = new Map<string, Agendamento>();
const regularAgendamentosCache = new Map<string, Agendamento>();

// Flags to track if the initial snapshot for each query has been received
let fixedQueryInitialLoadComplete = false;
let regularQueryInitialLoadComplete = false;


let initialToastId: string | number | undefined;
let initialToastTimeout: NodeJS.Timeout | undefined;
let initialLoadIsFromCache = false;

let firstCallToListener = true;


export function listenToChancesInDB(setterFunction: Function) {
  if (firstCallToListener) {
    initialToastId = toast.loading("Sincronizando dados...");
    fixedQueryInitialLoadComplete = false;
    regularQueryInitialLoadComplete = false;
    initialLoadIsFromCache = false;

    initialToastTimeout = setTimeout(() => {
      if (initialToastId && toast.isActive(initialToastId) && (!fixedQueryInitialLoadComplete || !regularQueryInitialLoadComplete)) {
        toast.update(initialToastId, {
          render: "Isso está demorando mais do que deveria, verifique sua internet!",
          type: 'warning',
          isLoading: false,
          autoClose: false
        });
      }
    }, 3000);
  }

  const weekMiliseconds = 7 * 24 * 60 * 60 * 1000;
  const date = getDate(1, 'date') as Date;
  const dateNextWeek = new Date(date.getTime() + weekMiliseconds);

  const qFixo = query(collection(db, "agendamentos"),
    where("fixo", "==", true),
    // To fix the bug of new schedulings not showing up when recurrent
    where("inicioFixo", "<=", Timestamp.fromDate(new Date(date.getTime() + weekMiliseconds))),
    where("fimFixo", ">=", Timestamp.fromDate(date))
  );

  const qRegular = query(collection(db, "agendamentos"),
    where("fixo", "==", false),
    where("data", ">=", Timestamp.fromDate(date)),
    where("data", "<", Timestamp.fromDate(dateNextWeek))
  );

  const unsubscribeFixo = onSnapshot(qFixo, (snapshot) => {
    if (!fixedQueryInitialLoadComplete && snapshot.metadata.fromCache) {
      initialLoadIsFromCache = true;
    }

    //TODO ajust here to get the status from the DB
    

    // Update the cache for fixed appointments
    fixedAgendamentosCache.clear(); // Clear previous results for this query
    snapshot.forEach((doc) => {
      const presencas = doc.data().presencas as Array<{data:Timestamp;status:string}>
      fixedAgendamentosCache.set(doc.id, new Agendamento(
        doc.data().nome, doc.data().estágio, doc.data().tipo,
        doc.data().conteúdo, doc.data().responsável,
        new Date(doc.data().data.seconds * 1000),true,'',doc.id,presencas,
        doc.data().inicioFixo?.toDate(), doc.data().fimFixo?.toDate()
      ));
    });
    fixedQueryInitialLoadComplete = true;
    processAndSetMergedData(setterFunction); // Trigger the merge and update UI
  }, (error) => {
    console.error("Error listening to fixed agendamentos:", error);
    if (initialToastId && toast.isActive(initialToastId) && (!fixedQueryInitialLoadComplete || !regularQueryInitialLoadComplete)) {
      toast.update(initialToastId, { type: 'error', render: `Erro ao carregar agendamentos fixos: ${error.message}`, isLoading: false, autoClose: false });
    } else {
      toast.error(`Erro em agendamentos fixos: ${error.message}`);
    }
    fixedQueryInitialLoadComplete = true;
    processAndSetMergedData(setterFunction);
  });

  const unsubscribeRegular = onSnapshot(qRegular, (snapshot) => {
    if (!regularQueryInitialLoadComplete && snapshot.metadata.fromCache) {
      initialLoadIsFromCache = true;
    }
    regularAgendamentosCache.clear(); 
    snapshot.forEach((doc) => {
      let id = doc.id
      regularAgendamentosCache.set(doc.id, new Agendamento(
        doc.data().nome, doc.data().estágio, doc.data().tipo,
        doc.data().conteúdo, doc.data().responsável,
        new Date(doc.data().data.seconds * 1000), false, doc.data().status, id));
    });

    regularQueryInitialLoadComplete = true;
    processAndSetMergedData(setterFunction); 
  }, (error) => {
    console.error("Error listening to regular agendamentos:", error);
    
    if (initialToastId && toast.isActive(initialToastId) && (!fixedQueryInitialLoadComplete || !regularQueryInitialLoadComplete)) {
      toast.update(initialToastId, { type: 'error', render: `Erro ao carregar agendamentos regulares: ${error.message}`, isLoading: false, autoClose: false });
    } else {
      
      toast.error(`Erro em agendamentos regulares: ${error.message}`);
    }
    regularQueryInitialLoadComplete = true;
    processAndSetMergedData(setterFunction);
  });

  return () => {
    console.log("Unsubscribing from Firestore listeners.");
    unsubscribeFixo();
    unsubscribeRegular();

    if (initialToastTimeout) {
      clearTimeout(initialToastTimeout);
      initialToastTimeout = undefined;
    }
    if (initialToastId && toast.isActive(initialToastId)) {
      toast.dismiss(initialToastId);
      initialToastId = undefined;
    }
  };
}

  
function processAndSetMergedData(setterFunction: Function) {
  const combinedResults = new Map<string, Agendamento>();

  // Add all documents from the fixed cache
  fixedAgendamentosCache.forEach((ag, id) => combinedResults.set(id, ag));
  // Add all documents from the regular cache. This will overwrite if an ID exists, ensuring deduplication.
  regularAgendamentosCache.forEach((ag, id) => combinedResults.set(id, ag));

  // Create the Semana object with the combined, deduplicated agendamentos
  const semana = new Semana(Array.from(combinedResults.values()));
  setterFunction(semana);

  // --- Initial Toast Management Logic ---
  // This block runs only once after both queries have completed their *initial* data fetch.
  if (firstCallToListener && fixedQueryInitialLoadComplete && regularQueryInitialLoadComplete) {
    if (initialToastTimeout) {
      clearTimeout(initialToastTimeout);
      initialToastTimeout = undefined;
    }

    if (initialToastId && toast.isActive(initialToastId)) {
      if (initialLoadIsFromCache) {
        toast.update(initialToastId, {
          type: 'error', // Use 'error' for cache-only initial load
          render: "Sem internet! Verifique sua conexão",
          isLoading: false,
          autoClose: false // Keep open to inform user
        });
      } else {
        toast.update(initialToastId, {
          type: 'success',
          render: "Agenda sincronizada com sucesso!",
          autoClose: 1500, // Auto close on success
          isLoading: false,
        });
      }
    }
    firstCallToListener = false; // Mark initial setup complete
  }
}

export async function deletefromDB(agendamento:Agendamento) {
  let mytoast = toast.loading("Removendo aluno")
  let q = query(collection(db,"agendamentos"), where('data', '==', Timestamp.fromDate(agendamento.data)), where("nome", '==', agendamento.nome), where("estágio", '==', agendamento.estágio))
  const snapshot = await getDocs(q) 
  snapshot.forEach(document => {
    deleteDoc(doc(db,"agendamentos",document.id))
    console.log(document.id)
  })
  toast.update(mytoast,{
    type: 'success',
    autoClose: 1500,
    isLoading: false,
    render: "Agendamento excluído com sucesso!"
  })
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// 3. Create an asynchronous function to handle Google sign-in
export async function signInWithGoogle() {
  // Create a new Google Auth provider instance
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);

    // The signed-in user info.
    const user = result.user;
    console.log("Successfully signed in:", user);

    // You can also get the ID Token and Access Token here if needed
    // const idToken = await user.getIdToken();
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    // const accessToken = credential.accessToken;

    return user;

  } catch (error:any) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData ? error.customData.email : null;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);

    console.error("Error during Google sign-in:", errorMessage, errorCode, email, credential);
    throw error; // Re-throw the error or handle it gracefully
  }
}

export async function updateSchedule(agendamento:Agendamento, novoAgendamento:Agendamento, inicioFixo:Date|null=null, fimFixo:Date|null=null) {
  const toastloading = toast.loading("Atualizando o agendamento");
  try {
    if (!agendamento.id) throw new Error("Agendamento não encontrado.");
    // Editing details of an existing conflict is allowed; moving into one is not.
    const moved = agendamento.data.getTime() !== novoAgendamento.data.getTime();
    await verifyHolidayBooking(novoAgendamento.data, Boolean(agendamento.fixo) || !moved);
    if (agendamento.fixo && (!inicioFixo || !fimFixo || inicioFixo > fimFixo)) {
      throw new Error("Informe um período válido para o agendamento fixo.");
    }
    await updateDoc(doc(db, "agendamentos", agendamento.id), {
      conteúdo: novoAgendamento.conteúdo,
      estágio: novoAgendamento.estágio,
      data: Timestamp.fromDate(novoAgendamento.data),
      horario: `${novoAgendamento.data.getHours()}h${novoAgendamento.data.getMinutes()}`,
      nome: novoAgendamento.nome,
      tipo: novoAgendamento.tipo,
      ...(agendamento.fixo ? { inicioFixo: Timestamp.fromDate(inicioFixo!), fimFixo: Timestamp.fromDate(fimFixo!) } : {}),
    });
    toast.update(toastloading, { render: "Agendamento atualizado", type: "success", isLoading: false, autoClose: 1500 });
    return true;
  } catch (error) {
    toast.update(toastloading, { render: error instanceof Error ? error.message : "Não foi possível atualizar o agendamento.", type: "error", isLoading: false, autoClose: 5000 });
    return false;
  }
}

export async function setScheduleStatus(status, id) {
  const documentRef = doc(db,'agendamentos',id)
  if (!status) {
    status = ''
  }
  await updateDoc(documentRef,{
    status: status
  })
}

export async function setScheduleStatusFixo(status,dateTime,agendamento:Agendamento) {
  console.log('Atualizando status')
  const documentRef = doc(db,'agendamentos',agendamento.id!)
  const newStatus = {data:dateTime,status:status}
  agendamento.presenças?.forEach(async (presencas) => {
    if (presencas.data.isEqual(dateTime)) {
      const removeStatus = {data:dateTime, status:presencas.status}
      await updateDoc(documentRef, {
        presencas: arrayRemove(removeStatus)
      })
    }
  })
  await updateDoc(documentRef,{
    presencas: arrayUnion(newStatus)
  })
}