import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Timestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  getDoc,
  or,
  and,
  updateDoc,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { Agendamento, Semana, getDate } from "./components/schedule/Utils.js";

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
  let toastId
  console.log(horario)
  try {
    toastId = toast.loading("Adicionando agendamento para " + nome, {
    })
    let uploadTimeout = setTimeout(() => {
      toast.update(toastId, { 
      render: "Isso está demorando mais do que deveria. Verifique sua internet!", 
      type: "warning", 
      isLoading: true, 
    })
      let warningTimeout = setTimeout(() => {
        toast.update(toastId, { 
        render: "Você parece estar sem internet. O agendamento de " + nome + " Não foi realizado e será feito quando internet estiver disponível!", 
        type: "warning", 
        isLoading: false, 
      })},2000);
    },7000)
    let docRef
    if (fixo) {
      docRef = await addDoc(collection(db, "agendamentos"), {
      nome: nome,
      estágio: estágio,
      tipo: tipo,
      conteúdo: conteúdo,
      data: new Date(
        ano,
        mes - 1,
        dia,
        Number(horario.split("h")[0]),
        Number(horario.split("h")[1]),
        0,
        0
      ),
      horario: horario,
      responsável: responsável,
      fixo: fixo,
      inicioFixo: inicioFixo,
      fimFixo: fimFixo,
    });
    }
    if (!fixo) {
      console.log(horario)
      docRef = await addDoc(collection(db, "agendamentos"), {
      nome: nome,
      estágio: estágio,
      tipo: tipo,
      conteúdo: conteúdo,
      data: new Date(
        ano,
        mes - 1,
        dia,
        Number(horario.split("h")[0]),
        Number(horario.split("h")[1]),
        0,
        0
      ),
      horario: horario,
      responsável: responsável,
      fixo: false
    });
    }
    
    clearTimeout(uploadTimeout)
    console.log("Document written with ID: ", docRef.id);
    toast.update(toastId, { 
      render: "Agendamento de " + nome + " adicionado com sucesso!", 
      type: "success", 
      isLoading: false, 
      autoClose: 1500
    });
  } catch (e) {
    toast.update(toastId, { 
      render: "Ocorreu um erro, tentando novamente!", 
      type: "error", 
      isLoading: false, 
      autoClose: 5000 // Close after 5 seconds
    });
    console.error("Error adding document: ", e);
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
  const date = getDate('0', 'date') as Date;
  console.log(date)
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
    where("data", "<=", Timestamp.fromDate(dateNextWeek))
  );

  const unsubscribeFixo = onSnapshot(qFixo, (snapshot) => {
    if (!fixedQueryInitialLoadComplete && snapshot.metadata.fromCache) {
      initialLoadIsFromCache = true;
    }

    // Update the cache for fixed appointments
    fixedAgendamentosCache.clear(); // Clear previous results for this query
    snapshot.forEach((doc) => {
      fixedAgendamentosCache.set(doc.id, new Agendamento(
        doc.data().nome, doc.data().estágio, doc.data().tipo,
        doc.data().conteúdo, doc.data().responsável,
        new Date(doc.data().data.seconds * 1000),true,'',doc.id
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
  let toastloading = toast.loading("Atualizando o agendamento")
  console.log(agendamento)
  console.log(novoAgendamento)
  let q = query(collection(db,"agendamentos"), where('data', '==', Timestamp.fromDate(agendamento.data)), where("nome", '==', agendamento.nome), where("estágio", '==', agendamento.estágio))
  try {
    const querySnapshot = getDocs(q)
    ;(await querySnapshot).forEach(async (doc) => {
      await updateDoc(doc.ref, {
        'conteúdo': novoAgendamento.conteúdo, 
        'estágio': novoAgendamento.estágio, 
        'data': Timestamp.fromDate(novoAgendamento.data),
        'horario': `${novoAgendamento.data.getHours()}:${(novoAgendamento.data.getMinutes().toString.length == 1 ? '0' + novoAgendamento.data.getMinutes() : novoAgendamento.data.getMinutes())}`,
        'nome': novoAgendamento.nome,
        'tipo': novoAgendamento.tipo,
      })
      if (agendamento.fixo) {
        await updateDoc(doc.ref, {
          'inicioFixo': Timestamp.fromDate(inicioFixo!),
          'fimFixo': Timestamp.fromDate(fimFixo!),
        })
      }
      console.log("Updated document with ID: " + doc.id)
    })
    toast.update(toastloading, {
      render: 'Agendamento atualizado',
      isLoading: false,
      type: 'success',
      autoClose: 1500
    })
    return true
  }
  catch (error) {
    console.error("Erro atualizando documento: ", error);
    toast.update(toastloading, {
      render: 'Ocorreu um erro ao atualizar o agendamento',
      isLoading: false,
      type: 'error',
      autoClose: 1500
    })
    return false
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