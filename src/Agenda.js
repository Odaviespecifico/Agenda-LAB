import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useState, createContext, useRef, useEffect, useImperativeHandle, use } from "react";
import { ToastContainer, toast } from 'react-toastify';
export class Semana {
    agendamentos;
    constructor(agendamentos) {
        this.agendamentos = agendamentos;
    }
}
export class Agendamento {
    nome;
    estágio;
    tipo;
    conteúdo;
    responsável;
    data;
    constructor(nome, estágio, tipo, conteúdo, responsável, data) {
        this.nome = nome;
        this.estágio = estágio;
        this.tipo = tipo;
        this.conteúdo = conteúdo;
        this.responsável = responsável;
        this.data = data;
    }
}
const SemanaContext = createContext(null);
const ModalContext = createContext(undefined);
export default function Agenda() {
    let [user, setUser] = useState('Juliana Ramos');
    let [scheduleDate, setScheduleDate] = useState(Date);
    let [semana, setSemana] = useState(new Semana([new Agendamento('Maria Clara Andrade', 'kids 2', "Escola", "Estudar algom kk", "Alexandra", new Date(2025, 8, 25, 14)), new Agendamento('Maria Clara Andrade', 'kids 2', "Escola", "Estudar algom kk", "Alexandra", new Date(2025, 8, 25, 14)), new Agendamento('Thalles Augusto dos Santos Nascimento de Lira', 'kids 3', "Escola", "Estudar algom kk", "Alexandra", new Date(2025, 8, 26, 14)), new Agendamento('Joaninha123', 'kids 3', "Escola", "Estudar algom kk", "Alexandra", new Date(2025, 8, 27, 17))]));
    let modalRef = useRef(null);
    const SemanaContextValue = { semana, setSemana };
    function showRegisterModal(day, startTime) {
        console.log('mostrando modal');
        localStorage.setItem('day', day);
        localStorage.setItem('startTime', startTime);
        localStorage.setItem('user', user);
        modalRef.current?.classList.replace('hidden', 'flex');
        modalRef.current?.showModal();
    }
    return (_jsxs("div", { className: "w-dvw h-dvh", children: [_jsx(Header, { user: user, setUser: setUser }), _jsxs(SemanaContext, { value: SemanaContextValue, children: [_jsx(ModalContext.Provider, { value: { showRegisterModal }, children: _jsx(ScheduleTable, {}) }), _jsx(RegisterStudent, { ref: modalRef, scheduleDate: scheduleDate })] }), _jsx(ToastContainer, { position: "top-right", autoClose: 3000 })] }));
}
function Header({ user, setUser }) {
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "relative h-12 w-full flex justify-between items-center p-2 text-lg bg-gray-50 shadow-md z-10 overflow-visible", children: [_jsx("h1", { children: _jsx("b", { children: "Agenda Lab" }) }), _jsxs("h1", { children: ["Usu\u00E1rio: ", _jsxs("span", { className: "font-bold", children: [" ", user] })] })] }) }));
}
function ScheduleTable() {
    return (_jsxs("table", { className: "w-full table-fixed", children: [_jsx("thead", { className: "sticky top-0 border-b-2 w-full", children: _jsxs("tr", { className: "w-full text-xl font-bold text-center border-b-2", children: [_jsx("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0 w-40", children: "Hor\u00E1rio" }), _jsxs("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: ["Segunda-feira ", _jsx("br", {}), " ", getDate(1)] }), _jsxs("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: ["Ter\u00E7a-feira ", _jsx("br", {}), " ", getDate(2)] }), _jsxs("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: ["Quarta-feira ", _jsx("br", {}), getDate(3)] }), _jsxs("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: ["Quinta-feira ", _jsx("br", {}), getDate(4)] }), _jsxs("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: ["Sexta-feira ", _jsx("br", {}), getDate(5)] }), _jsxs("td", { className: "bg-purple-100 py-2 border-r-2 last:border-0", children: ["S\u00E1bado ", _jsx("br", {}), getDate(6)] })] }) }), _jsxs("tbody", { children: [_jsx(TableRow, { startTime: 14, endTime: '14h45' }), _jsx(TableRow, { startTime: 15, endTime: '15h45' }), _jsx(TableRow, { startTime: '16h15', endTime: '16h45' }), _jsx(TableRow, { startTime: 17, endTime: '17h45' }), _jsx(TableRow, { startTime: 18, endTime: '18h45' })] })] }));
}
function TableRow({ startTime, endTime }) {
    return (_jsxs("tr", { className: "text-xl text-center border-y-2 h-16 even:bg-gray-50 ", children: [_jsxs("td", { className: "select-none hover:bg-amber-200 transition-all border-t-2 bg-amber-100", children: [startTime, " at\u00E9 ", endTime] }), _jsx(RowData, { day: 1, startTime: startTime }), _jsx(RowData, { day: 2, startTime: startTime }), _jsx(RowData, { day: 3, startTime: startTime }), _jsx(RowData, { day: 4, startTime: startTime }), _jsx(RowData, { day: 5, startTime: startTime }), _jsx(RowData, { day: 6, startTime: startTime })] }));
}
function RowData({ day, startTime }) {
    let semanaContext = useContext(SemanaContext);
    const renderRow = () => {
        return (_jsx(_Fragment, { children: semanaContext?.semana.agendamentos
                .filter((agendamento) => agendamento.data.getDay() == day && agendamento.data.getHours() == startTime)
                .map((agendamento, idx) => (_jsx(Session, { agendamento: agendamento }, idx))) }));
    };
    return (_jsx("td", { className: "group transition-all text-left text-lg border-x-2 h-full -mb-5 ", children: _jsxs("div", { className: "flex flex-col justify-start h-full", children: [renderRow(), _jsx(ModalContext.Consumer, { children: ({ showRegisterModal }) => (_jsx("button", { className: "cursor-pointer w-full not-only:border-t-2 text-gray-50 transition-all h-0 group-hover:text-black group-hover:h-full hover:bg-blue-200 active:bg-blue-300 focus:outline-0", onClick: () => showRegisterModal(day, startTime), children: "Agendar Aluno" })) })] }) }));
}
function Session({ agendamento }) {
    function handleSectionClick() {
        if (agendamento) {
            // navigator.clipboard.writeText(agendamento)
        }
    }
    if (!agendamento)
        return null;
    return (_jsxs("div", { className: "h-full select-all border-b-2 last-of-type:border-0 px-2 py-1", onClick: handleSectionClick, children: [_jsx("b", { children: "Aluno:" }), " ", agendamento.nome, " ", _jsx("br", {}), _jsxs("b", { children: ["Conte\u00FAdo: ", agendamento.tipo] }), " ", " - " + agendamento.conteúdo, " ", _jsx("br", {}), _jsx("b", { children: "Est\u00E1gio:" }), " ", agendamento.estágio, " ", _jsx("br", {}), _jsx("b", { children: "Respons\u00E1vel:" }), " ", agendamento.responsável, " ", _jsx("br", {}), _jsx("div", { className: "absolute top-0 right-0", children: "X" })] }));
}
function RegisterStudent({ ref, scheduleDate }) {
    let semanaContext = useContext(SemanaContext);
    let formRef = useRef(null);
    let [day, setDay] = useState('testando');
    let [time, setTime] = useState('testando');
    useEffect(() => {
        window.addEventListener("storage", handleStorageChange);
    }, []);
    function handleStorageChange() {
        console.log('updating localStorage');
        setDay(getDate(parseInt(localStorage.getItem('day'))));
        setTime(localStorage.getItem('startTime'));
    }
    function handleclose(e) {
        let target = e.target;
        console.log('fechou o modal');
        target.close();
        target.classList.replace('flex', 'hidden');
    }
    function handleSelectChange(e) {
        console.log(e.target.value);
    }
    function handleFormSubmit(e) {
        e.preventDefault();
        const target = e.target;
        if (target && target instanceof HTMLFormElement) {
            const form = target;
            const rawData = Object.fromEntries(new FormData(form));
            const formData = {
                name: String(rawData.name ?? ""),
                estágio: String(rawData.estágio ?? ""),
                destalhes: String(rawData.detalhes ?? ""),
                tipo: String(rawData.tipo ?? "")
            };
            let date = new Date(Date.now());
            if (day && typeof day === "string" && day.includes('/')) {
                const [d, m] = day.split('/');
                date.setMonth(parseInt(m ?? "1") - 1);
                date.setDate(parseInt(d ?? "1"));
            }
            else {
                console.error("Invalid day value:", day);
                return;
            }
            let startTime = localStorage.getItem('startTime')?.split('h');
            console.log("Start time = " + startTime);
            const hour = parseInt(startTime?.at(0) ?? "0");
            const minute = parseInt(startTime?.at(1) ?? "0");
            date.setHours(hour, minute);
            // Atualizar a semana
            let tempSemana = Array.from(semanaContext?.semana?.agendamentos ?? []);
            tempSemana.push(new Agendamento(formData.name, formData.estágio, formData.tipo, formData.destalhes, localStorage.getItem('user'), date));
            // Atualizar o estado com nova semana
            semanaContext?.setSemana(new Semana(tempSemana));
            target.reset();
            toast.success("Agendamento realizado com sucesso!");
            // Hide the dialog
            let dialog = document.querySelector('dialog');
            dialog?.close();
        }
    }
    return (_jsx("dialog", { ref: ref, className: "aboslute h-dvh w-dvw hidden items-center justify-center bg-transparent backdrop:bg-blue-950/20", onFocus: (handleStorageChange), onClose: (e) => (handleclose(e)), children: _jsxs("form", { ref: formRef, action: "", className: "p-5 bg-white h-fit w-fit flex flex-col gap-4 text-xl", onSubmit: (e) => handleFormSubmit(e), children: [_jsxs("h1", { className: "text-center font-medium", children: ["Criar agendamento - ", day, " \u00E0s ", localStorage.getItem('startTime') + 'h'] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("label", { htmlFor: "name", children: "Nome:" }), _jsx("input", { type: "text", name: "name", className: "border-1 rounded-sm w-full" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("label", { htmlFor: "est\u00E1gio", children: "Est\u00E1gio:" }), _jsx("input", { type: "text", name: "est\u00E1gio", className: "border-1 rounded-sm w-full" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("label", { htmlFor: "tipo", children: "Conte\u00FAdo" }), _jsxs("select", { name: "tipo", id: "tipo", className: "border-1", onChange: (e) => handleSelectChange(e), children: [_jsx("option", { value: "reposi\u00E7\u00E3o", children: "Resposi\u00E7\u00E3o" }), _jsx("option", { value: "escolar", children: "Escolar" }), _jsx("option", { value: "revis\u00E3o", children: "Revis\u00E3o" }), _jsx("option", { value: "outro", children: "Outro" })] })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("label", { htmlFor: "detalhes", children: "Detalhes:" }), _jsx("input", { type: "text", name: "detalhes", className: "border-1 rounded-sm w-full" })] }), _jsx("button", { type: "submit", className: "select-none bg-blue-200 p-2 w-fit self-center font-medium rounded-lg hover:bg-blue-300 active:bg-blue-400 transition-all", children: "Confirmar agendamento" })] }) }));
}
function getDate(dayIndex) {
    const parsedURL = new URLSearchParams(window.location.search).get('date')?.replace('-', '/');
    if (parsedURL) {
        let [d, m, y] = parsedURL.split(/[\/-]/).map(Number);
        let date = new Date(y, m - 1, d);
        // Alinhar para segunda sempre ficar com o dia correto
        while (date.getDay() > 1) {
            date = new Date(date.getTime() - 86400000);
        }
        if (date.getDay() == 0) {
            date = new Date(date.getTime() + 86400000);
        }
        // Ajustar a data exibida com base no indice
        date = new Date(date.getTime() + 86400000 * dayIndex - 1);
        // Ajusts the monthString
        let monthString;
        if (date.getMonth() == 0) {
            monthString = '12';
        }
        else if (date.getMonth.toString().length == 1) {
            monthString = "0" + (date.getMonth() + 1);
        }
        else {
            monthString = (date.getMonth() + 1);
        }
        return (`${date.getDate()}/${monthString}`);
    }
    else {
        return ('');
    }
}
//# sourceMappingURL=Agenda.js.map