import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import "./App.css";

import { useCallback, useRef, useState } from "react";
import Selector from "./Selector";
import { AgGridReact } from "ag-grid-react";
import { GridOptions, ICellRendererParams } from "ag-grid-community";
import { Nullable, SelectorItem, TableRow } from "./types";

type TableRowKey = keyof TableRow;
type TableData = TableRow[];

const cols: TableRowKey[] = Array.from({ length: 6 }, (_, idx) =>
  idx === 0 ? "id" : `col${idx}`
).map((key) => key as TableRowKey);

const getColNameByIndex = (idx: number) => cols[idx];

const initialData: TableData = Array.from({ length: 100 }, (_, idx) =>
  cols.reduce((acc, key: keyof TableRow) => {
    if (key === "id") {
      acc["id"] = idx + 1;
    } else {
      acc[key] = null;
    }
    return acc;
  }, {} as TableRow)
);

const formatColHeader = (arg: TableRowKey) => {
  if (arg === "id") {
    return arg.toUpperCase();
  } else {
    return arg[0].toUpperCase() + arg.substring(1, 3) + " " + arg.substring(3);
  }
};

const initialOptions: SelectorItem[] = [
  {
    id: "1.1",
    parentId: null,
  },
  {
    id: "1.2",
    parentId: null,
  },
  {
    id: "2.1",
    parentId: "1.1",
  },
  {
    id: "2.2",
    parentId: "1.2",
  },
  {
    id: "3.1",
    parentId: "2.1",
  },
  {
    id: "3.2",
    parentId: "2.2",
  },
  {
    id: "4.1",
    parentId: "3.1",
  },
  {
    id: "4.2",
    parentId: "3.2",
  },
  {
    id: "5.1",
    parentId: "4.1",
  },
  {
    id: "5.2",
    parentId: "4.2",
  },
];

const DEFAULT_INPUT_VALUE = "100000";

function App() {
  const options = useRef(initialOptions);
  const gridRef = useRef<GridOptions>();
  const dataRef = useRef<TableData>(initialData);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCellRenderer = (rowName: TableRowKey) => {
    return function (params: ICellRendererParams) {
      // console.log("ppp", params, rowName);
      const currentIndex = params.column?.getInstanceId();

      if (!currentIndex) {
        return null;
      }
      let localOptions: SelectorItem[] = [];
      let disabled = false;
      if (currentIndex === 1) {
        localOptions = options.current.filter((item) => !item.parentId);
      } else {
        const prevIndex = currentIndex - 1;

        const prevColName = getColNameByIndex(prevIndex);
        const rowIndex = params.node.rowIndex ?? 0;
        const foundRow = dataRef.current[rowIndex];
        const value = foundRow[prevColName] as Nullable<SelectorItem>;

        if (value) {
          const prevColId = value.id;
          localOptions = options.current.filter(
            (item) => item.parentId === prevColId
          );
        } else {
          disabled = true;
        }
      }
      return (
        <Selector
          value={params.data[rowName]}
          valueIndex="id"
          labelIndex="id"
          options={localOptions}
          disabled={disabled}
          onCreate={(value) => {
            const id = (value as SelectorItem).id;
            let parentId: Nullable<string> = null;
            const currentIndex = params.column?.getInstanceId() ?? 0;
            if (currentIndex > 0) {
              const prevColName = getColNameByIndex(currentIndex - 1);
              const rowIndex = params.node.rowIndex ?? 0;
              const foundRow = dataRef.current[rowIndex];
              const value = foundRow[prevColName] as Nullable<SelectorItem>;
              if (value) {
                parentId = value.id;
              }
            }
            options.current.push({ id, parentId });

            dataRef.current.forEach((item) => {
              const rowNode = gridRef.current?.api?.getRowNode(String(item.id));
              if (rowNode) {
                params.api.redrawRows({ rowNodes: [rowNode] });
              }
            });
          }}
          onChange={(value) => {
            const colIndex = params.column?.getInstanceId() ?? -1;
            console.log("params", params, colIndex, params.colDef?.field);
            if (colIndex >= 0) {
              const data = params.data;
              const currentColName = params.colDef?.field;
              if (currentColName) {
                data[currentColName] = value;
              }
              if (colIndex !== cols.length - 1) {
                for (let i = colIndex + 1; i < cols.length; i++) {
                  const colName = getColNameByIndex(i);
                  data[colName] = null;
                }
              }
              const id = params.data?.id;
              const rowNode = gridRef.current?.api?.getRowNode(id);
              if (rowNode) {
                params.api.redrawRows({ rowNodes: [rowNode] });
              }
            }
          }}
        />
      );
    };
  };

  const [columnDefs] = useState(
    cols.map((col) =>
      col === "id"
        ? { field: "id", headerName: "ID", width: 150 }
        : {
            field: col,
            headerName: formatColHeader(col),
            sortable: false,
            enableCellChangeFlash: true,
            cellRenderer: getCellRenderer(col),
          }
    )
  );

  const onAddButtonClick = useCallback(() => {
    const lastId = dataRef.current[dataRef.current.length - 1].id + 1;
    let rowsCount = Number(inputRef.current?.value ?? DEFAULT_INPUT_VALUE);

    const items: TableData = Array.from({ length: rowsCount }, (_, idx) => ({
      id: lastId + idx,
      col1: null,
      col2: null,
      col3: null,
      col4: null,
      col5: null,
    }));

    dataRef.current.push(...items);

    gridRef.current?.api?.setRowData(dataRef.current);
  }, []);

  return (
    <div>
      <div className="ag-theme-alpine table-container">
        <AgGridReact
          //@ts-ignore
          ref={gridRef}
          enableColResize={true}
          onGridReady={(event) => {
            event.api.sizeColumnsToFit();
          }}
          getRowId={(item) => item.data.id}
          rowHeight={50}
          rowData={dataRef.current}
          columnDefs={columnDefs}
          rowBuffer={0}
          cacheBlockSize={100}
          cacheOverflowSize={2}
          infiniteInitialRowCount={100}
          maxBlocksInCache={10}
        />
      </div>
      <div className="foot">
        <button onClick={onAddButtonClick} className="foot__button">
          Добавить строку
        </button>
        <input
          ref={inputRef}
          className="foot__input"
          defaultValue={DEFAULT_INPUT_VALUE}
          placeholder="Количество строк"
        />
      </div>
    </div>
  );
}

export default App;
