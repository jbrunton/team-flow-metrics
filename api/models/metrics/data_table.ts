import { throws } from "assert";

type DataTableColumn = {
  label: string,
  type: string
}

type DataTableValue = {
  v: number
}

type DataTableHeaderRow = Array<DataTableColumn>

type DataTableBodyRow = {
  c: Array<DataTableValue>
}

type DataTableRow = DataTableHeaderRow | DataTableBodyRow

export class DataTable {
  public rows: Array<Array<number>>
  public cols: DataTableHeaderRow

  constructor() {
    this.rows = [];
    this.cols = [];
  }

  setColumns(cols: Array<DataTableColumn>) {
    this.cols = cols;
  }

  addRow(row: Array<number>) {
    this.rows.push(row);
  }

  addRows(rows: Array<Array<number>>) {
    for (let row of rows) {
      this.rows.push(row);
    }
  }

  getColumnValues(colIndex: number) {
    return this.rows.map(row => row[colIndex]);
  }

  addPercentiles(percentiles: Array<number>) {
    percentiles.reverse().forEach(percentile => {
      this.cols.push({
        label: `${percentile}th Percentile`,
        type: "number"
      });
      this.rows.forEach(row => {
        row.push(null);
      });
    });
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
