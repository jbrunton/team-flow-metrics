import { jStat } from "jstat";

type DataTableColumn = {
  label: string,
  type: string
}

type DataTableValue = {
  v: number
}

type DataTableRow = {
  c: Array<DataTableValue>
}

type DataTable = {
  cols: Array<DataTableColumn>,
  rows: Array<DataTableRow>
}

export class DataTableBuilder {
  public rows: Array<Array<number>>
  public cols: Array<DataTableColumn>

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

  addPercentiles(colIndex: number, percentiles: Array<number>) {
    if (this.rows.length <= 1) {
      return;
    }

    const fromValue = this.rows[0][0];
    const toValue = this.rows[this.rows.length - 1][0];
    const padding = new Array(this.cols.length - 1).fill(null);

    const columnValues = this.getColumnValues(colIndex);
    const percentileValues = percentiles.map(percentile => {
      return jStat.percentile(columnValues, percentile / 100.0);
    }).reverse();

    percentiles.reverse().forEach(percentile => {
      this.cols.push({
        label: `${percentile}th Percentile`,
        type: "number"
      });
      this.rows.forEach(row => {
        row.push(null);
      });
    });
    
    this.rows.push([fromValue].concat(padding).concat(percentileValues));
    this.rows.push([toValue].concat(padding).concat(percentileValues));
  }

  build(): DataTable {
    const rows = [] as Array<DataTableRow>;
    for (let row of this.rows) {
      rows.push({
        c: row.map(value => ({ v: value }))
      });
    }
    return {
      cols: this.cols,
      rows: rows
    };
  }
}