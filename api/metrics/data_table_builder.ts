import { jStat } from "jstat";

type DataTableColumn = {
  label: string;
  type: string;
  role?: string;
};

type DataTableValue = {
  v: unknown;
};

type DataTableRow = {
  c: Array<DataTableValue>;
};

type DataTable = {
  cols: Array<DataTableColumn>;
  rows: Array<DataTableRow>;
};

export class DataTableBuilder {
  public rows: Array<Array<unknown>>;
  public cols: Array<DataTableColumn>;

  constructor(cols: Array<DataTableColumn> = []) {
    this.rows = [];
    this.cols = cols;
  }

  setColumns(cols: Array<DataTableColumn>) {
    this.cols = cols;
  }

  addRow(row: Array<number>) {
    this.rows.push(row);
  }

  addRows(rows: Array<Array<unknown>>) {
    for (const row of rows) {
      this.rows.push(row);
    }
  }

  getColumnValues(colIndex: number) {
    return this.rows.map((row) => row[colIndex]);
  }

  addPercentiles(
    colIndex: number,
    percentiles: Array<unknown>,
    fromValue: any,
    toValue: any
  ) {
    if (this.rows.length <= 1) {
      return;
    }

    const padding = new Array(this.cols.length - 1).fill(null);

    const columnValues = this.getColumnValues(colIndex);
    const percentileValues = percentiles
      .map((percentile) => {
        return jStat.percentile(columnValues, (percentile as number) / 100.0);
      })
      .reverse();

    percentiles.reverse().forEach((percentile) => {
      this.cols.push({
        label: `${percentile}th Percentile`,
        type: "number",
      });
      this.rows.forEach((row) => {
        row.push(null);
      });
    });

    this.rows.unshift([toValue].concat(padding).concat(percentileValues));
    this.rows.unshift([fromValue].concat(padding).concat(percentileValues));
  }

  build(): DataTable {
    const rows = this.rows.map((row) => {
      return { c: row.map((value) => ({ v: value })) };
    });
    return {
      cols: this.cols,
      rows,
    };
  }
}
