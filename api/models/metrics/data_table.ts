import { throws } from "assert";

type DataTableColumn = {
  label: string,
  type: string
}

type DataTableValue = {
  v: Number
}

type DataTableHeaderRow = Array<DataTableColumn>

type DataTableBodyRow = {
  c: Array<DataTableValue>
}

type DataTableRow = DataTableHeaderRow | DataTableBodyRow

export class DataTable {
  public rows: Array<Array<Number>>
  public cols: DataTableHeaderRow

  constructor() {
    this.rows = [];
    this.cols = [];
  }

  setColumns(cols: Array<DataTableColumn>) {
    this.cols = cols;
  }

  addRow(row: Array<Number>) {
    this.rows.push(row);
  }

  addRows(rows: Array<Array<Number>>) {
    for (let row of rows) {
      this.rows.push(row);
    }
  }

  build(): Array<DataTableRow> {
    const rows = [this.cols] as Array<DataTableRow>;
    for (let row of this.rows) {
      rows.push({
        c: row.map(value => ({ v: value }))
      });
    }
    return rows;
  }
}
