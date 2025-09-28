import { TableRow } from "./TableRow.js";
import { getDate } from "./Utils.js";

export function ScheduleTable() {
  return (
    <div className="h-full overflow-y-auto p-2">
      <table className="w-full table-fixed border-collapse rounded-xl overflow-hidden shadow-lg">
        <thead className="sticky top-0 z-10">
          <tr className="bg-purple-200 text-gray-800 text-lg font-semibold text-center">
            <td className="py-3 px-2 border-r border-purple-300 w-42">Horário</td>
            <td className="py-3 px-2 border-r border-purple-300">
              Segunda-feira <br /> {getDate(1) as string}
            </td>
            <td className="py-3 px-2 border-r border-purple-300">
              Terça-feira <br /> {getDate(2) as string}
            </td>
            <td className="py-3 px-2 border-r border-purple-300">
              Quarta-feira <br /> {getDate(3) as string}
            </td>
            <td className="py-3 px-2 border-r border-purple-300">
              Quinta-feira <br /> {getDate(4) as string}
            </td>
            <td className="py-3 px-2 border-r border-purple-300">
              Sexta-feira <br /> {getDate(5) as string}
            </td>
            <td className="py-3 px-2 border-r-0 border-purple-300">
              Sábado <br /> {getDate(6) as string}
            </td>
          </tr>
        </thead>
        <tbody className="bg-white text-center">
          <TableRow startTime={14} endTime={"14h45"} />
          <TableRow startTime={15} endTime={"15h45"} />
          <TableRow startTime={"16h15"} endTime={"16h45"} />
          <TableRow startTime={17} endTime={"17h45"} />
          <TableRow startTime={18} endTime={"18h45"} />
        </tbody>
      </table>
    </div>
  );
}
