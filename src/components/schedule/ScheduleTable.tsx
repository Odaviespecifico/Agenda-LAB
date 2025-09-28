import { TableRow } from "./TableRow.js";
import { getDate } from "./Utils.js";
export function ScheduleTable() {
  return (
    <div className="max-h-full overflow-y-auto">
      <table className="w-full table-fixed">
        <thead className="sticky top-0 border-b-2 w-full z-5">
          <tr className="relative w-full text-xl font-bold text-center border-b-2 shadow-md z-20">
            <td className="bg-purple-100 py-2 border-r-2 last:border-0 w-40">
              Horário
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Segunda-feira <br /> {getDate(1) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Terça-feira <br /> {getDate(2) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Quarta-feira <br />
              {getDate(3) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Quinta-feira <br />
              {getDate(4) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Sexta-feira <br />
              {getDate(5) as string}
            </td>
            <td className="bg-purple-100 py-2 border-r-2 last:border-0">
              Sábado <br />
              {getDate(6) as string}
            </td>
          </tr>
        </thead>
        <tbody className="relative z-1">
          <TableRow startTime={14} endTime={"14h45"}></TableRow>
          <TableRow startTime={15} endTime={"15h45"}></TableRow>
          <TableRow startTime={"16h15"} endTime={"16h45"}></TableRow>
          <TableRow startTime={17} endTime={"17h45"}></TableRow>
          <TableRow startTime={18} endTime={"18h45"}></TableRow>
        </tbody>
      </table>
    </div>
  );
}